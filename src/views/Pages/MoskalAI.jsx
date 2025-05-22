import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // Import useParams
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getProjects } from '../../services/projectService'; // Import getProjects
import './styles/MoskalAI.css';

const MoskalAI = () => {
  const { keyword: encodedProjectName } = useParams(); // Changed projectName to keyword
  const userData = useSelector((state) => state.user);
  const [userName, setUserName] = useState('Guest');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [projectKeywords, setProjectKeywords] = useState([]); // State for project keywords
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  // Template questions
  const templateQuestions = [
    "Who are the top influencers?",
    "How can we achieve the best short-term results in our brand's communication and marketing?",
    "What is the most viral topic in the last 7 days?",
    "What is the sentiment breakdown for our brand?"
  ];

  useEffect(() => {
    if (userData && userData.name) {
      const firstName = userData.name.split(' ')[0];
      setUserName(firstName);
    }
  }, [userData]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatAreaRef.current && messages.length > 0) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    const fetchProjectKeywords = async () => {
      if (!encodedProjectName) {
        console.warn("MoskalAI - Project name not found in URL params. Cannot fetch keywords.");
        setProjectKeywords([]);
        return;
      }
      const currentProjectName = decodeURIComponent(encodedProjectName);
      console.log("MoskalAI - Current project name from URL:", currentProjectName);

      try {
        const projectsData = await getProjects();
        console.log("MoskalAI - projectsData from getProjects():", projectsData); // Log 1
        let activeProjectKeywords = [];
        let projectFound = false;

        if (projectsData && typeof projectsData === 'object') {
          const findAndSetKeywords = (projectsArray, type) => {
            if (projectFound || !Array.isArray(projectsArray)) return;
            
            const foundProject = projectsArray.find(p => p.name === currentProjectName);
            if (foundProject) {
              if (foundProject.keywords && Array.isArray(foundProject.keywords)) {
                activeProjectKeywords = [...foundProject.keywords];
                console.log(`MoskalAI - Keywords found for active project "${currentProjectName}" in ${type}:`, activeProjectKeywords);
              } else {
                console.warn(`MoskalAI - Active project "${currentProjectName}" in ${type} found, but has no .keywords array or it's not an array.`);
              }
              projectFound = true;
            }
          };

          findAndSetKeywords(projectsData.owned_projects, 'owned_projects');
          if (!projectFound) { // Only search accessible if not found in owned
            findAndSetKeywords(projectsData.accessible_projects, 'accessible_projects');
          }
          
          if (projectFound) {
            setProjectKeywords(activeProjectKeywords);
          } else {
            console.warn(`MoskalAI - Active project "${currentProjectName}" not found in owned or accessible projects. Setting projectKeywords to empty.`);
            setProjectKeywords([]);
          }
          console.log("MoskalAI - Final projectKeywords for API call:", activeProjectKeywords); // Log 2 (renamed from allKeywords)
        } else {
          console.warn("MoskalAI - getProjects did not return an object or returned null/undefined. Setting projectKeywords to empty.");
          setProjectKeywords([]);
        }
      } catch (error) {
        console.error("MoskalAI - Error fetching project keywords:", error);
        setProjectKeywords([]);
      }
    };

    fetchProjectKeywords();
  }, [encodedProjectName]); // Re-run if project name in URL changes

  // Helper function to render formatted text (bold and lists)
  const renderFormattedText = (text) => {
    if (typeof text !== 'string') {
      return text; // Return as is if not a string
    }

    const lines = text.split('\n');
    const elements = [];
    let currentListItems = [];

    const processLineContent = (lineContent, keyPrefix) => {
      const parts = lineContent.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, lineIndex) => {
      if (line.trim().startsWith('- ')) {
        currentListItems.push(
          <li key={`li-${lineIndex}`}>
            {processLineContent(line.trim().substring(2), `li-content-${lineIndex}`)}
          </li>
        );
      } else {
        if (currentListItems.length > 0) {
          elements.push(<ul key={`ul-${elements.length}`} className="ai-list">{currentListItems}</ul>);
          currentListItems = [];
        }
        if (line.trim() !== '') {
          elements.push(
            <p key={`p-${lineIndex}`}>
              {processLineContent(line, `p-content-${lineIndex}`)}
            </p>
          );
        }
      }
    });

    if (currentListItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="ai-list">{currentListItems}</ul>);
    }

    return elements.length > 0 ? <>{elements}</> : <p>{processLineContent(text, 'single-p')}</p>;
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isTyping && e.target.value.trim() !== '') {
      setIsTyping(true);
    } else if (isTyping && e.target.value.trim() === '') {
      setIsTyping(false);
    }
    
    if (!hasInteracted && e.target.value.trim() !== '') {
      setHasInteracted(true);
    }
  };

  const handleTemplateClick = (question) => {
    setInputValue(question);
    setIsTyping(true);
    setHasInteracted(true);
    textareaRef.current.focus();
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || isSending) return;

    setIsSending(true);
    setHasInteracted(true);
    
    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsTyping(false);

    console.log("MoskalAI - projectKeywords state in handleSendMessage:", projectKeywords); // Log 3

    // Show typing indicator
    const typingIndicator = {
      id: Date.now() + 0.5,
      type: 'typing',
      sender: 'ai',
    };
    setMessages((prevMessages) => [...prevMessages, typingIndicator]);

    const VITE_DATA_API_BASE = import.meta.env.VITE_DATA_API_BASE;

    axios.post(`${VITE_DATA_API_BASE}/moskal-ai-pipeline`, {
      user_query: newUserMessage.text,
      extracted_keywords: projectKeywords,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }
    })
    .then(response => {
      setMessages((prevMessages) =>
        prevMessages.filter(msg => msg.id !== typingIndicator.id)
      );
      const apiJsonResponse = response.data; // API returns the JSON directly
      let aiResponseMessage;

      if (apiJsonResponse && apiJsonResponse.components && Array.isArray(apiJsonResponse.components)) {
        // Successfully received the new JSON format
        aiResponseMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          response_type: apiJsonResponse.response_type, // e.g., "mixed"
          components: apiJsonResponse.components,     // array of {type, content/title/headers/rows/etc.}
          footnotes: apiJsonResponse.footnotes || [], // array of {content}
        };
      } else {
        // Fallback if the response is not the expected JSON structure or an error occurred
        let errorMessage = "Sorry, I received an unexpected response from the AI.";
        if (typeof apiJsonResponse === 'string') { // If API returned a plain string error
            errorMessage = apiJsonResponse;
        } else if (apiJsonResponse && (apiJsonResponse.error || apiJsonResponse.message)) { // If API returned a JSON error object
            errorMessage = apiJsonResponse.error || apiJsonResponse.message;
        } else if (response.status !== 200) {
            errorMessage = `Error: Received status code ${response.status}`;
        }
        
        aiResponseMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          response_type: 'error', // Custom type to indicate an error
          components: [{ type: 'text', content: errorMessage }], // Wrap error in component structure
          footnotes: [],
        };
      }
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);
    })
    .catch(error => {
      console.error("Error calling Moskal AI API:", error);
      setMessages((prevMessages) =>
        prevMessages.filter(msg => msg.id !== typingIndicator.id)
      );
      const errorResponse = {
        id: Date.now() + 1,
        type: 'text',
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    })
    .finally(() => {
      setIsSending(false);
    });
  };

  return (
    <div className={`moskal-ai-page-container ${hasInteracted ? 'has-interacted' : ''}`}>
      <div className={`moskal-ai-content ${hasInteracted ? 'has-interacted' : ''}`} ref={chatAreaRef}>
        {messages.length === 0 && (
          <>
            <div className="moskal-ai-header">
              <h1>
                Hello, {userName} <span className="sparkle">✨</span>
              </h1>
              <p>Ask me anything and discover key insights you might have missed.</p>
            </div>
            
            <div className="template-questions-container">
              <h2>Examples</h2>
              <div className="template-questions-grid">
                {templateQuestions.map((question, index) => (
                  <button 
                    key={index} 
                    className="template-question-button"
                    onClick={() => handleTemplateClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="moskal-ai-chat-area">
          {messages.map((msg) => (
            msg.type === 'typing' ? (
              <div key={msg.id} className="chat-bubble ai-response-bubble typing-indicator-bubble">
                <span className="sparkle-icon">✨</span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className={`chat-bubble ${
                  msg.sender === 'user' ? 'user-query-bubble' : 'ai-response-bubble'
                }`}
              >
                {msg.sender === 'ai' && <span className="sparkle-icon">✨</span>}
                <div className="chat-bubble-content ai-content-padding">
                  {msg.sender === 'user' ? (
                    <p>{msg.text}</p> // User messages are simple text
                  ) : msg.sender === 'ai' && msg.components ? ( // AI messages with new JSON structure
                    <>
                      {msg.components.map((component, index) => {
                        if (component.type === 'text') {
                          return <div key={`comp-text-${index}`} className="ai-text-content">{renderFormattedText(component.content)}</div>;
                        } else if (component.type === 'table' && component.headers && component.rows) {
                          return (
                            <div key={`comp-${index}`} className="ai-table-component my-2">
                              {component.title && <h4 className="text-md font-semibold mb-1">{component.title}</h4>}
                              <table className="ai-table w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-100">
                                  <tr>
                                    {component.headers.map((header, hIndex) => (
                                      <th key={`th-${hIndex}`} scope="col" className="px-3 py-2">
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {component.rows.map((row, rIndex) => {
                                    if (!Array.isArray(row)) {
                                      console.warn(`Table row at index ${rIndex} is not an array for table "${component.title}". Skipping row. Row data:`, row);
                                      return null; // Skip rendering this row
                                    }
                                    return (
                                      <tr key={`tr-${rIndex}`} className="bg-white border-b">
                                        {row.map((cell, cIndex) => (
                                          <td key={`td-${cIndex}`} className="px-3 py-2">
                                            {String(cell)}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        } else if (component.type === 'chart' && component.data && component.x_axis && component.y_axis) {
                          if (component.chart_type === 'bar') {
                            return (
                              <div key={`comp-${index}`} className="ai-chart-component my-2">
                                {component.title && <h4 className="text-md font-semibold mb-1">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <BarChart data={component.data}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey={(() => {
                                        // Special case for "Tren Sentimen Harian"
                                        if (component.title === "Tren Sentimen Harian" && component.data.length > 0 && component.data[0].hasOwnProperty('post_date')) {
                                          return 'post_date';
                                        }
                                        // General case for other charts
                                        if (typeof component.x_axis === 'string' && component.data.length > 0) {
                                          const lowerCaseXKey = component.x_axis.toLowerCase();
                                          if (component.data[0].hasOwnProperty(lowerCaseXKey)) {
                                            return lowerCaseXKey; // Use lowercase if it exists in data
                                          }
                                          // If lowercase key doesn't exist, try the original component.x_axis value
                                          if (component.data[0].hasOwnProperty(component.x_axis)) {
                                            return component.x_axis;
                                          }
                                          // If neither specific lowercase nor original case key is found, log a warning.
                                          // Default to component.x_axis; chart might not display X-axis correctly.
                                          console.warn(`Chart X-axis key issue: Neither '${component.x_axis}' (original) nor '${lowerCaseXKey}' (lowercase) found in data for chart titled '${component.title}'. Defaulting to '${component.x_axis}'.`);
                                        }
                                        return component.x_axis; // Fallback to original x_axis value if no data or not a string
                                      })()} />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      {/* Check if the data is for sentiment trends by looking for positive/negative/neutral keys */}
                                      {component.data.length > 0 &&
                                      typeof component.data[0].positive !== 'undefined' &&
                                      typeof component.data[0].negative !== 'undefined' &&
                                      typeof component.data[0].neutral !== 'undefined' ? (
                                        <>
                                          <Bar dataKey="positive" fill="#82ca9d" name="Positive" />
                                          <Bar dataKey="negative" fill="#ff7300" name="Negative" />
                                          <Bar dataKey="neutral" fill="#8884d8" name="Neutral" />
                                        </>
                                      ) : (
                                        // Fallback to original single bar
                                        (() => {
                                          if (!component.y_axis || typeof component.y_axis !== 'string' || component.data.length === 0) {
                                            return null; // Cannot render bar without y_axis, or if data is empty
                                          }
                                          const originalYKey = component.y_axis;
                                          const lowerCaseYKey = originalYKey.toLowerCase();
                                          let dataKeyToUse = null;

                                          // Prioritize lowercase key if it exists in the data, as per example discrepancy
                                          if (component.data[0].hasOwnProperty(lowerCaseYKey)) {
                                            dataKeyToUse = lowerCaseYKey;
                                          } else if (component.data[0].hasOwnProperty(originalYKey)) {
                                            // Fallback to original key if lowercase isn't found but original is
                                            dataKeyToUse = originalYKey;
                                          }

                                          if (dataKeyToUse) {
                                            return <Bar dataKey={dataKeyToUse} fill="#4A6CF7" name={originalYKey || 'Value'} />;
                                          } else {
                                            // If neither key is found, log a warning and render no bar.
                                            console.warn(`Chart Y-axis key issue: Neither '${originalYKey}' (original) nor '${lowerCaseYKey}' (lowercase) found in data for chart titled '${component.title}'. Bar not rendered.`);
                                            return null;
                                          }
                                        })()
                                      )}
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          } else if (component.chart_type === 'line') {
                            return (
                              <div key={`comp-${index}`} className="ai-chart-component my-2">
                                {component.title && <h4 className="text-md font-semibold mb-1">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <LineChart data={component.data}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey={(() => {
                                        // For "Tren Sentimen Harian", x_axis is always 'post_date' if available
                                        if (component.title === "Tren Sentimen Harian" && component.data.length > 0 && component.data[0].hasOwnProperty('post_date')) {
                                          return 'post_date';
                                        }
                                        // General case for other line charts
                                        if (typeof component.x_axis === 'string' && component.data.length > 0) {
                                          const lowerCaseXKey = component.x_axis.toLowerCase();
                                          if (component.x_axis === "Tanggal" && component.data[0].hasOwnProperty('date')) return 'date'; // Specific for "Tanggal" -> "date"
                                          if (component.data[0].hasOwnProperty(lowerCaseXKey)) return lowerCaseXKey;
                                          if (component.data[0].hasOwnProperty(component.x_axis)) return component.x_axis;
                                          console.warn(`Line Chart X-axis key issue: Neither '${component.x_axis}' nor '${lowerCaseXKey}' found for chart '${component.title}'. Defaulting.`);
                                        }
                                        return component.x_axis;
                                      })()} />
                                      <YAxis domain={['auto', 'auto']} />
                                      <Tooltip />
                                      <Legend />
                                      {/* Logic for rendering lines */}
                                      {component.title === "Tren Sentimen Harian" && component.data.length > 0 ? (
                                        <>
                                          {component.data[0].hasOwnProperty('positive') && <Line type="monotone" dataKey="positive" stroke="#82ca9d" name="Positive" />}
                                          {component.data[0].hasOwnProperty('negative') && <Line type="monotone" dataKey="negative" stroke="#ff7300" name="Negative" />}
                                          {component.data[0].hasOwnProperty('neutral') && <Line type="monotone" dataKey="neutral" stroke="#8884d8" name="Neutral" />}
                                        </>
                                      ) : (
                                        (() => { // Generic line chart with one line based on y_axis
                                          if (!component.y_axis || typeof component.y_axis !== 'string' || component.data.length === 0) return null;
                                          const originalYKey = component.y_axis;
                                          const lowerCaseYKey = originalYKey.toLowerCase();
                                          let dataKeyToUse = null;
                                          if (originalYKey === "Jumlah Mentions" && component.data[0].hasOwnProperty('total_mentions')) dataKeyToUse = 'total_mentions';
                                          else if (component.data[0].hasOwnProperty(lowerCaseYKey)) dataKeyToUse = lowerCaseYKey;
                                          else if (component.data[0].hasOwnProperty(originalYKey)) dataKeyToUse = originalYKey;

                                          if (dataKeyToUse) {
                                            return <Line type="monotone" dataKey={dataKeyToUse} stroke="#8884d8" name={originalYKey || 'Value'} />;
                                          }
                                          console.warn(`Generic Line Chart Y-axis key issue for '${component.title}'. Neither '${originalYKey}' nor '${lowerCaseYKey}' found. Line not rendered.`);
                                          return null;
                                        })()
                                      )}
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          } else if (component.chart_type === 'pie' && component.data) {
                            const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];
                            // Determine the name key, preferring 'label', then 'name', then 'sentiment' (from older examples)
                            const nameKey = component.data.length > 0 ? 
                                            (component.data[0].hasOwnProperty('label') ? 'label' : 
                                            (component.data[0].hasOwnProperty('name') ? 'name' : 
                                            (component.data[0].hasOwnProperty('sentiment') ? 'sentiment' : 'label'))) 
                                            : 'label';
                            const dataKeyToUse = component.data.length > 0 && component.data[0].hasOwnProperty('value') ? 'value' : 
                                                 (component.data.length > 0 && component.data[0].hasOwnProperty('mentions') ? 'mentions' : 'value');

                            if (!(component.data.length > 0 && (component.data[0].hasOwnProperty(nameKey) && component.data[0].hasOwnProperty(dataKeyToUse)))) {
                                console.warn(`Pie Chart key issue: Cannot find '${nameKey}' or '${dataKeyToUse}' in data for chart titled '${component.title}'. Pie chart not rendered.`);
                                return null;
                            }

                            return (
                              <div key={`comp-${index}`} className="ai-chart-component my-2">
                                {component.title && <h4 className="text-md font-semibold mb-1">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie
                                        data={component.data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                          const RADIAN = Math.PI / 180;
                                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                          return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                              {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                          );
                                        }}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey={dataKeyToUse}
                                        nameKey={nameKey}
                                      >
                                        {component.data.map((entry, cIndex) => (
                                          <Cell key={`cell-${cIndex}`} fill={COLORS[cIndex % COLORS.length]} />
                                        ))}
                                      </Pie>
                                      <Tooltip />
                                      <Legend />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          }
                        }
                        return null; // Fallback for unknown component types or missing data
                      })}
                      {/* Render footnotes */}
                      {msg.footnotes && msg.footnotes.length > 0 && (
                        <div className="ai-footnotes mt-3 pt-2 border-t border-gray-200">
                          <h5 className="text-sm font-semibold mb-1">References:</h5>
                          {msg.footnotes.map((footnote, fIndex) => (
                            <p key={`fn-${fIndex}`} className="text-xs text-gray-500 italic">
                              {/* Assuming footnote.content is a URL. If it can be other text, this needs adjustment. */}
                              {/* Also, ensure footnote.url or similar field is available if content is just a description */}
                              <a 
                                href={footnote.url || footnote.content} // Prefer footnote.url if available
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {footnote.content || footnote.url}
                              </a>
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                     // Fallback for AI messages that don't fit the new structure
                     msg.sender === 'ai' && <div className="ai-text-content">{renderFormattedText(msg.text) || "Response from AI."}</div>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="moskal-ai-input-container">
        <div className="moskal-ai-input-area">
          <textarea
            ref={textareaRef}
            placeholder="What is the most viral topics in the last 7 days?"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />
          <button 
            className={`send-button ${inputValue.trim() !== '' ? 'active' : ''}`} 
            onClick={handleSendMessage} 
            disabled={isSending || inputValue.trim() === ''}
          >
            {isSending ? (
              <div className="loader"></div>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="send-icon"
              >
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="disclaimer">
          Moskal AI is always learning. Double-check for key details for accuracy.
        </p>
      </div>
    </div>
  );
};

export default MoskalAI;
