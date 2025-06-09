import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ChartRenderer from '../../components/visualizations/ChartRenderer'; // Corrected path
import TableRenderer from '../../components/visualizations/TableRenderer'; // Corrected path
import { getProjects } from '../../services/projectService';
import './styles/MoskalAI.css';

const MoskalAI = () => {
  const { keyword: encodedProjectNameFromURL } = useParams();
  const userData = useSelector((state) => state.user);
  const keywordsFromStore = useSelector((state) => state.keywords.keywords);

  const [userName, setUserName] = useState('Julian');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentProject, setCurrentProject] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [currentProjectKeywords, setCurrentProjectKeywords] = useState([]);
  const [feedbackStates, setFeedbackStates] = useState({}); // Track feedback for each message
  const [showFeedbackForm, setShowFeedbackForm] = useState(null); // Track which message shows feedback form
  const currentAiMessageIdRef = useRef(null); // To track the current AI message being streamed
  
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  // Set user name from Redux store
  useEffect(() => {
    if (userData && userData.name) {
      const firstName = userData.name.split(' ')[0];
      setUserName(firstName);
    }
    // Add initial greeting message if no interaction yet
    if (messages.length === 0 && !hasInteracted) {
      setMessages([
        // Optional: Add an initial AI greeting if desired, or keep it clean
        // {
        //   id: `ai-initial-${Date.now()}`,
        //   text: `Hello, ${userData?.name?.split(' ')[0] || 'Julian'}! How can I help you with the project "${currentProject || 'selected project'}" today?`,
        //   sender: 'ai',
        // }
      ]);
    }
  }, [userData, messages.length, hasInteracted, currentProject]);

  // Initialize project context from URL
  useEffect(() => {
    if (encodedProjectNameFromURL) {
      const projectNameFromURL = decodeURIComponent(encodedProjectNameFromURL);
      setCurrentProject(projectNameFromURL);
      // Update initial greeting if project name becomes available
      // This might be redundant if the above useEffect handles it well
    }
  }, [encodedProjectNameFromURL]);

  // Fetch projects and find current project keywords
  useEffect(() => {
    const fetchProjectsAndKeywords = async () => {
      try {
        const projects = await getProjects();
        setProjectData(projects);
        
        if (currentProject && projects) {
          // Combine owned and accessible projects
          const allProjects = [
            ...(projects.owned_projects || []),
            ...(projects.accessible_projects || [])
          ];
          
          // Find the current project by name
          const foundProject = allProjects.find(project => 
            project.name === currentProject
          );
          
          if (foundProject && foundProject.keywords) {
            setCurrentProjectKeywords(foundProject.keywords);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    if (currentProject) {
      fetchProjectsAndKeywords();
    }
  }, [currentProject]);

  // Auto-scroll chat area
  useEffect(() => {
    if (chatAreaRef.current && messages.length > 0) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!hasInteracted && e.target.value.trim() !== '') {
      setHasInteracted(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isSending) return;

    setIsSending(true);
    setHasInteracted(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
    };

    // Add user message and an initial AI streaming message
    const newAiMessageId = `ai-${Date.now()}`;
    currentAiMessageIdRef.current = newAiMessageId;
    const initialAiMessage = {
      id: newAiMessageId,
      text: '', // Start with empty text for streaming
      sender: 'ai',
      isStreaming: true,
      status: 'Initializing...', // Initial status
      previewComponents: null, // Added
      finalComponents: null,   // Added
      finalInsights: null,     // New
      finalFootnotes: null   // New
    };
    setMessages(prev => [...prev, userMessage, initialAiMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      // Construct URL with query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('query', currentInput);
      // Add keywords from Redux store as comma-separated values
      if (currentProjectKeywords && currentProjectKeywords.length > 0) {
        const keywordsString = currentProjectKeywords.join(',');
        queryParams.append('keywords', keywordsString);
      } else if (currentProject) { // Fallback to project name if no keywords in store
        queryParams.append('keywords', currentProject);
      }
      const url = `/data-api/moskal-ai?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          // No Content-Type or body for GET request
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.substring(6);
            console.log('Received raw jsonString:', jsonString); // Log raw string
            try {
              const data = JSON.parse(jsonString);
              console.log('Parsed data object:', data); // Log parsed object
              const messageIdToUpdate = currentAiMessageIdRef.current; // Capture for this specific update
              setMessages(prevMsgs =>
                prevMsgs.map(msg => {
                  if (msg.id === messageIdToUpdate) { // Use captured ID for this update
                    // Log details if progress is high or type is final
                    if (data.progress >= 80 || data.type === 'final') {
                      console.log(`Updating message for progress ${data.progress}, type ${data.type}:`, { currentMsg: msg, incomingData: data, targetId: messageIdToUpdate });
                    }
                    let newText = msg.text;
                    let newStatus = msg.status;
                    let streamingDone = msg.isStreaming;
                    let updatedPreviewComponents = msg.previewComponents;
                    let updatedFinalComponents = msg.finalComponents;
                    let updatedFinalInsights = msg.finalInsights; // Initialize from current msg state
                    let updatedFinalFootnotes = msg.finalFootnotes; // Initialize from current msg state

                    // Update status from stream
                    if (data.message && data.progress !== undefined) {
                      newStatus = `${data.message} (${data.progress}%)`;
                    } else if (data.message) {
                      newStatus = data.message;
                    } else if (data.step && data.progress !== undefined) {
                      newStatus = `Step: ${data.step} (${data.progress}%)`;
                    } else if (data.step) {
                      newStatus = `Step: ${data.step}`;
                    }

                    if (data.type === "stream") {
                      if (data.step === "response_generation" && data.data && data.data.response_preview) {
                        const previewComps = data.data.response_preview;
                        if (Array.isArray(previewComps)) {
                          updatedPreviewComponents = previewComps; // Store all preview components
                          const textContent = previewComps
                            .filter(comp => comp.type === 'text')
                            .map(comp => comp.content)
                            .join('\n');
                          if (textContent) newText = textContent;
                        }
                      }
                    } else if (data.type === "final") {
                      streamingDone = false;
                      if (data.message && data.progress !== undefined) {
                        newStatus = `${data.message} (${data.progress}%)`;
                      } else if (data.message) {
                        newStatus = data.message;
                      }

                      if (data.data && data.data.final_response && data.data.final_response.components) {
                        const finalComps = data.data.final_response.components;
                        if (Array.isArray(finalComps)) {
                          updatedFinalComponents = finalComps; // Store all final components
                          updatedPreviewComponents = null; // Clear preview components once final is received
                          const textContent = finalComps
                            .filter(comp => comp.type === 'text')
                            .map(comp => comp.content)
                            .join('\n');
                          newText = textContent; // This will be the main text part of the message
                        }
                        // Extract insights and footnotes
                        if (data.data.final_response.insights) {
                          updatedFinalInsights = data.data.final_response.insights;
                        }
                        if (data.data.final_response.footnotes) {
                          updatedFinalFootnotes = data.data.final_response.footnotes;
                        }
                      }
                    }
                    
                    return { 
                      ...msg, 
                      text: newText, 
                      status: newStatus, 
                      isStreaming: streamingDone,
                      previewComponents: updatedPreviewComponents,
                      finalComponents: updatedFinalComponents,
                      finalInsights: updatedFinalInsights,
                      finalFootnotes: updatedFinalFootnotes
                    };
                  }
                  return msg;
                })
              );
            } catch (e) {
              console.error('Error parsing stream JSON:', e, jsonString);
            }
          }
        }
      }

      // Process any remaining data in the buffer after the stream is done
      if (buffer.startsWith('data: ')) {
        const jsonString = buffer.substring(6);
        console.log('Received raw jsonString from buffer:', jsonString); // Log raw string from buffer
        try {
          const data = JSON.parse(jsonString);
          console.log('Parsed data object from buffer:', data); // Log parsed object from buffer
          const messageIdToUpdateFromBuffer = currentAiMessageIdRef.current; // Capture ID for this specific update
          setMessages(prevMsgs =>
            prevMsgs.map(msg => {
              if (msg.id === messageIdToUpdateFromBuffer) { // Use captured ID for this update
                 if (data.progress >= 80 || data.type === 'final') {
                    console.log(`Updating message from buffer for progress ${data.progress}, type ${data.type}:`, { currentMsg: msg, incomingData: data, targetId: messageIdToUpdateFromBuffer });
                  }
                let newText = msg.text;
                let newStatus = msg.status;
                let streamingDone = msg.isStreaming;
                let updatedPreviewComponents = msg.previewComponents;
                let updatedFinalComponents = msg.finalComponents;
                let updatedFinalInsights = msg.finalInsights; // Initialize from current msg state
                let updatedFinalFootnotes = msg.finalFootnotes; // Initialize from current msg state

                if (data.message && data.progress !== undefined) {
                  newStatus = `${data.message} (${data.progress}%)`;
                } else if (data.message) {
                  newStatus = data.message;
                } else if (data.step && data.progress !== undefined) {
                  newStatus = `Step: ${data.step} (${data.progress}%)`;
                } else if (data.step) {
                  newStatus = `Step: ${data.step}`;
                }

                if (data.type === "stream") {
                  if (data.step === "response_generation" && data.data && data.data.response_preview) {
                    const previewComps = data.data.response_preview;
                    if (Array.isArray(previewComps)) {
                      updatedPreviewComponents = previewComps;
                      const textContent = previewComps.filter(comp => comp.type === 'text').map(comp => comp.content).join('\n');
                      if (textContent) newText = textContent;
                    }
                  }
                } else if (data.type === "final") {
                  streamingDone = false;
                  if (data.message && data.progress !== undefined) {
                    newStatus = `${data.message} (${data.progress}%)`;
                  } else if (data.message) {
                    newStatus = data.message;
                  }
                  if (data.data && data.data.final_response && data.data.final_response.components) {
                    const finalComps = data.data.final_response.components;
                    if (Array.isArray(finalComps)) {
                      updatedFinalComponents = finalComps;
                      updatedPreviewComponents = null;
                      const textContent = finalComps.filter(comp => comp.type === 'text').map(comp => comp.content).join('\n');
                      newText = textContent;
                    }
                     // Extract insights and footnotes from buffer
                    if (data.data.final_response.insights) {
                      updatedFinalInsights = data.data.final_response.insights;
                    }
                    if (data.data.final_response.footnotes) {
                      updatedFinalFootnotes = data.data.final_response.footnotes;
                    }
                  }
                }
                return { 
                  ...msg, 
                  text: newText, 
                  status: newStatus, 
                  isStreaming: streamingDone, 
                  previewComponents: updatedPreviewComponents, 
                  finalComponents: updatedFinalComponents,
                  finalInsights: updatedFinalInsights,   // New
                  finalFootnotes: updatedFinalFootnotes  // New
                };
              }
              return msg;
            })
          );
        } catch (e) {
          console.error('Error parsing final stream JSON from buffer:', e, jsonString);
        }
      }
    } catch (error) {
      console.error('Error sending message or processing stream:', error);
      setMessages(prevMsgs =>
        prevMsgs.map(msg =>
          msg.id === currentAiMessageIdRef.current
            ? { ...msg, text: `Error: ${error.message}`, isStreaming: false, status: 'Error' }
            : msg
        )
      );
    } finally {
      console.log('Executing finally block. Current AI message ID before null:', currentAiMessageIdRef.current);
      setIsSending(false);
      // The 'type: "final"' event handler is now solely responsible for setting isStreaming to false.
      // We only nullify the ref here.
      currentAiMessageIdRef.current = null;
      console.log('Executing finally block. Current AI message ID after null:', currentAiMessageIdRef.current);
    }
  }, [inputValue, isSending, userData, currentProject, messages, keywordsFromStore]);

  // Handle AI feedback submission
  const handleFeedback = async (messageId, feedbackType, feedbackText = '') => {
    try {
      // Find the user query and AI response for this message
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      const aiMessage = messages[messageIndex];
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
      
      if (!aiMessage || !userMessage || aiMessage.sender !== 'ai' || userMessage.sender !== 'user') {
        console.error('Could not find corresponding user query for AI response');
        return;
      }

      // Prepare AI response data
      let responseAi = {};
      if (aiMessage.finalComponents) {
        responseAi.components = aiMessage.finalComponents;
      }
      if (aiMessage.finalInsights) {
        responseAi.insights = aiMessage.finalInsights;
      }
      if (aiMessage.finalFootnotes) {
        responseAi.footnotes = aiMessage.finalFootnotes;
      }
      if (aiMessage.text) {
        responseAi.text = aiMessage.text;
      }

      const feedbackData = {
        query_user: userMessage.text,
        response_ai: responseAi,
        feedback_user: feedbackText || feedbackType,
        user_name: userData?.name || userName,
        project_name: currentProject || 'Unknown Project',
        additional_info: {
          feedback_type: feedbackType,
          message_id: messageId,
          timestamp_interaction: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/data-api/ai-feedback', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Feedback submitted successfully:', result);
        
        // Update feedback state
        setFeedbackStates(prev => ({
          ...prev,
          [messageId]: { type: feedbackType, submitted: true }
        }));
        
        // Hide feedback form
        setShowFeedbackForm(null);
      } else {
        console.error('Failed to submit feedback:', response.status);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const renderFormattedText = (text) => {
    if (typeof text !== 'string') return text;
    
    return text.split('\n').map((line, index) => (
      <p key={index} style={{ margin: index === 0 ? '0' : '0.5em 0 0 0' }}>
        {(() => {
          // Parse bold text (**text**)
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return parts.map((part, partIndex) => {
            // Every odd index is bold text (between **)
            if (partIndex % 2 === 1) {
              return <strong key={partIndex}>{part}</strong>;
            }
            return part;
          });
        })()}
      </p>
    ));
  };

  return (
    <div className={`moskal-ai-page-container ${hasInteracted || messages.length > 0 ? 'has-interacted' : ''}`}>
      <div className={`moskal-ai-content ${hasInteracted || messages.length > 0 ? 'has-interacted' : ''}`} ref={chatAreaRef}>
        
        {/* Welcome Header - Only show when no interaction */}
        {(!hasInteracted && messages.length === 0) && (
          <div className="moskal-ai-header">
            <h1>
              Hello, {userName} <span className="sparkle">✨</span>
            </h1>
            <p>Ask me anything and discover key insights you might have missed.</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="moskal-ai-chat-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${
                msg.sender === 'user' ? 'user-query-bubble' : 'ai-response-bubble'
              } ${msg.isStreaming ? 'streaming' : ''}`}
            >
              {msg.sender === 'ai' && (
                <div className="sparkle-icon">✨</div>
              )}
              <div className="chat-bubble-content">
                <div className="ai-text-content">
                  {msg.finalComponents ? 
                    (() => {
                      console.log('Rendering with msg.finalComponents:', msg.finalComponents, 'for message ID:', msg.id);
                      return msg.finalComponents.map((component, index) => {
                        const componentType = component.type ? component.type.trim().toLowerCase() : '';
                        const componentStyle = { marginBottom: '15px' }; // Add margin to each component

                        if (componentType === 'text') {
                          return <div key={`final-text-${index}`} style={componentStyle}>{renderFormattedText(component.content)}</div>;
                        } else if (componentType === 'chart') {
                          const chartType = component.chart_type ? component.chart_type.trim().toLowerCase() : '';
                          const visualizationProp = {
                            type: chartType, // Map chart_type to type
                            title: component.title,
                            data: component.data,
                            options: component.options || {} // Pass options if available
                          };
                          console.log('Rendering Chart with visualization prop:', visualizationProp);
                          return <div key={`final-chart-${index}`} style={componentStyle}><ChartRenderer visualization={visualizationProp} /></div>;
                        } else if (componentType === 'table') {
                          const tableVisualizationProp = {
                            title: component.title,
                            data: { // Nest headers and rows under data
                              headers: component.headers,
                              rows: component.rows
                            },
                            options: component.options || {} // Pass options if available
                          };
                          console.log('Rendering Table with visualization prop:', tableVisualizationProp);
                          return <div key={`final-table-${index}`} style={componentStyle}><TableRenderer visualization={tableVisualizationProp} /></div>;
                        }
                        return null;
                      });
                    })()
                  : msg.previewComponents && msg.isStreaming ? (
                    msg.previewComponents.map((component, index) => {
                      if (component.type === 'text') {
                        return <div key={`preview-text-${index}`}>{renderFormattedText(component.content)}</div>;
                      }
                      // Optionally render placeholders or simplified previews for charts/tables during streaming
                      else if (component.type === 'chart') {
                        return <div key={`preview-chart-${index}`} style={{opacity: 0.7, fontStyle: 'italic'}}>{`Chart: ${component.title || 'Loading chart...'}`}</div>;
                      } else if (component.type === 'table') {
                        return <div key={`preview-table-${index}`} style={{opacity: 0.7, fontStyle: 'italic'}}>{`Table: ${component.title || 'Loading table...'}`}</div>;
                      }
                      return null;
                    })
                  ) : (
                    renderFormattedText(msg.text) // Fallback to plain text
                  )}

                  {/* Render Insights */}
                  {msg.finalInsights && msg.finalInsights.length > 0 && (
                    <div className="moskal-ai-insights-container" style={{ marginTop: '15px', marginBottom: '15px' }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Insights:</h4>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                        {msg.finalInsights.map((insight, index) => (
                          <li key={`insight-${index}`} style={{ marginBottom: '3px' }}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Render Footnotes */}
                  {msg.finalFootnotes && msg.finalFootnotes.length > 0 && (
                    <div className="moskal-ai-footnotes-container" style={{ marginTop: '15px', marginBottom: '15px' }}>
                      <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Footnotes:</h4>
                      <ul style={{ listStyleType: 'decimal', paddingLeft: '20px', margin: 0 }}>
                        {msg.finalFootnotes.map((footnote, index) => (
                          <li key={`footnote-${index}`} style={{ marginBottom: '3px', wordBreak: 'break-all' }}>
                            {typeof footnote.content === 'string' && (footnote.content.startsWith('http://') || footnote.content.startsWith('https://')) ? (
                              <a href={footnote.content} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                {footnote.content}
                              </a>
                            ) : (
                              footnote.content
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.isStreaming && !msg.finalComponents && <span className="streaming-cursor"></span>}
                  {msg.isStreaming && !msg.text && !msg.previewComponents && !msg.finalComponents && msg.status && <span style={{ fontStyle: 'italic', opacity: 0.7 }}>{msg.status}</span>}
                  {msg.isStreaming && !msg.text && !msg.previewComponents && !msg.finalComponents && !msg.status && <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Thinking...</span>}
                </div>

                {/* AI Feedback Section */}
                {msg.sender === 'ai' && !msg.isStreaming && (
                  <div className="ai-feedback-section" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                    {feedbackStates[msg.id]?.submitted ? (
                      <div style={{ fontSize: '0.8em', color: '#10b981', fontStyle: 'italic' }}>
                        ✓ Feedback submitted. Thank you!
                      </div>
                    ) : showFeedbackForm === msg.id ? (
                      <div className="feedback-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.8em', color: '#6b7280', marginBottom: '5px' }}>
                          How was this response?
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleFeedback(msg.id, 'helpful')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75em',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            👍 Helpful
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'not_helpful')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75em',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            👎 Not Helpful
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'inaccurate')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75em',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            ⚠️ Inaccurate
                          </button>
                          <button
                            onClick={() => setShowFeedbackForm(null)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75em',
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowFeedbackForm(msg.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.75em',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        💬 Feedback
                      </button>
                    )}
                  </div>
                )}

                {msg.sender === 'ai' && msg.status && (
                  <div style={{ fontSize: '0.75em', opacity: 0.6, marginTop: '5px' }}>
                    {/* {msg.status} */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="moskal-ai-input-container">
        <div className="moskal-ai-input-area">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask Moskal AI here..."
            disabled={isSending}
            rows={1}
          />
          <button
            className={`send-button ${inputValue.trim() !== '' && !isSending ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isSending}
          >
            {isSending ? (
              <div className="loader"></div>
            ) : (
              <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            )}
          </button>
        </div>
        
        {/* Disclaimer */}
        <div className="disclaimer">
          Moskal AI is always learning. Double-check for key details for accuracy.
        </div>
      </div>
    </div>
  );
};

export default MoskalAI;
