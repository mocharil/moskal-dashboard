import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // Import useParams
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { getProjects } from '../../services/projectService'; // Import getProjects
import './styles/MoskalAI.css';

// Helper functions for dynamic chart keys
const cleanKey = (key) => {
  if (typeof key !== 'string') return 'Value';
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const findKeyInData = (keysInSample, hint) => {
  if (!hint || !keysInSample) return null;
  if (keysInSample.includes(hint)) return hint;
  const lowerHint = hint.toLowerCase();
  return keysInSample.find(k => k.toLowerCase() === lowerHint) || null;
};

const isValueSuitableForAxis = (value) => {
  return typeof value === 'number' || (typeof value === 'string' && String(value).trim() !== '');
};

const identifyChartKeys = (data, apiXHint, apiYHintsInput, chartTitle = "") => {
  if (!data || data.length === 0) {
    const yHints = apiYHintsInput ? (Array.isArray(apiYHintsInput) ? apiYHintsInput : [apiYHintsInput]) : ['value'];
    return {
      xAxisKey: apiXHint || 'date',
      yAxisSeries: yHints.map(hint => ({ dataKey: hint, name: cleanKey(hint) }))
    };
  }

  const sample = data[0];
  const keysInSample = Object.keys(sample);
  let determinedXAxisKey = null;

  // 1. Determine X-Axis Key
  // Try API hint (case-insensitive), but only if its values are suitable
  if (apiXHint) {
      const keyFromHint = findKeyInData(keysInSample, apiXHint);
      if (keyFromHint && sample.hasOwnProperty(keyFromHint) && isValueSuitableForAxis(sample[keyFromHint])) {
          determinedXAxisKey = keyFromHint;
      }
  }
  
  // If API hint didn't match or wasn't suitable, try common categorical keys
  if (!determinedXAxisKey) {
    const commonCatKeys = ['name', 'label', 'category', 'kategori']; // Add 'kategori' for case-insensitivity with findKeyInData
    for (const commonName of commonCatKeys) {
        const potentialKey = findKeyInData(keysInSample, commonName);
        if (potentialKey && sample.hasOwnProperty(potentialKey) && isValueSuitableForAxis(sample[potentialKey])) {
            determinedXAxisKey = potentialKey;
            break;
        }
    }
  }

  // If not found, try to find a date-like key with suitable values
  if (!determinedXAxisKey) {
      const dateKeywords = ['date', 'time', 'period', 'day', 'month', 'year', 'timestamp', 'tanggal', 'waktu', 'post_date'];
      const potentialDateKey = keysInSample.find(key => {
          if (sample.hasOwnProperty(key) && isValueSuitableForAxis(sample[key])) {
              const lowerKey = key.toLowerCase();
              if (dateKeywords.some(dk => lowerKey.includes(dk))) {
                  return (typeof sample[key] === 'number' ||
                         (typeof sample[key] === 'string' && (String(sample[key]).match(/^\d{4}-\d{2}-\d{2}/) || !isNaN(Date.parse(String(sample[key]))))));
              }
          }
          return false;
      });
      if (potentialDateKey) {
          determinedXAxisKey = potentialDateKey;
      }
  }

  // If still no key, fallback to the first key with a suitable string value
  if (!determinedXAxisKey) {
      const firstSuitableStringKey = keysInSample.find(k => sample.hasOwnProperty(k) && typeof sample[k] === 'string' && isValueSuitableForAxis(sample[k]));
      if (firstSuitableStringKey) {
          determinedXAxisKey = firstSuitableStringKey;
      }
  }
  
  // If still no key, fallback to the first key with any suitable value
  if (!determinedXAxisKey) {
      const firstSuitableKey = keysInSample.find(k => sample.hasOwnProperty(k) && isValueSuitableForAxis(sample[k]));
      if (firstSuitableKey) {
          determinedXAxisKey = firstSuitableKey;
      }
  }

  // Absolute fallbacks if no suitable key is found
  if (!determinedXAxisKey || !keysInSample.includes(determinedXAxisKey)) {
       if (keysInSample.length > 0) {
          // If all else fails, use the first key from the data, hoping for the best.
          // Or, if apiXHint was provided but not found/suitable, it might be an intended non-data key (less likely for X-axis).
          console.warn(`X-axis key determination failed to find a suitable key for chart "${chartTitle}". Hint: "${apiXHint}". Defaulting to first data key: "${keysInSample[0]}".`);
          determinedXAxisKey = keysInSample[0];
       } else {
          // Data is empty or has no keys, this case should ideally be caught earlier.
          determinedXAxisKey = apiXHint || 'x'; 
       }
  }
  
  // Final check: ensure determinedXAxisKey is an actual key if data exists.
  // This might be slightly redundant given the above, but acts as a safeguard.
  if (data.length > 0 && keysInSample.length > 0 && !keysInSample.includes(determinedXAxisKey)) {
      console.warn(`Final X-axis key "${determinedXAxisKey}" is not in data keys [${keysInSample.join(', ')}] for chart "${chartTitle}". Defaulting to "${keysInSample[0]}".`);
      determinedXAxisKey = keysInSample[0];
  }
  
  // 2. Determine Y-Axis Series
  const yAxisSeries = [];
  const apiYHints = apiYHintsInput ? (Array.isArray(apiYHintsInput) ? apiYHintsInput : [apiYHintsInput]) : [];

  if (chartTitle === "Tren Sentimen Harian" &&
      keysInSample.includes('positive') && typeof sample['positive'] === 'number' &&
      keysInSample.includes('negative') && typeof sample['negative'] === 'number' &&
      keysInSample.includes('neutral') && typeof sample['neutral'] === 'number') {
    if (keysInSample.includes('post_date')) determinedXAxisKey = 'post_date';
    yAxisSeries.push({ dataKey: 'positive', name: 'Positive' });
    yAxisSeries.push({ dataKey: 'negative', name: 'Negative' });
    yAxisSeries.push({ dataKey: 'neutral', name: 'Neutral' });
  } else {
    if (apiYHints.length > 0) {
      apiYHints.forEach(hint => {
        const foundYKey = findKeyInData(keysInSample, hint);
        if (foundYKey && typeof sample[foundYKey] === 'number') {
          yAxisSeries.push({ dataKey: foundYKey, name: cleanKey(hint) });
        }
      });
    }
    if (yAxisSeries.length === 0) {
      keysInSample.forEach(key => {
        if (key !== determinedXAxisKey && typeof sample[key] === 'number') {
          yAxisSeries.push({ dataKey: key, name: cleanKey(key) });
        }
      });
    }
  }

  if (yAxisSeries.length === 0) {
    const fallbackYKey = keysInSample.find(k => k !== determinedXAxisKey && typeof sample[k] === 'number') ||
                         keysInSample.find(k => k !== determinedXAxisKey) ||
                         (keysInSample.length > 1 ? keysInSample[1] : null);
    if (fallbackYKey) {
        yAxisSeries.push({ dataKey: fallbackYKey, name: cleanKey(fallbackYKey) });
    } else if (apiYHints.length > 0 && apiYHints[0]) {
        yAxisSeries.push({ dataKey: apiYHints[0], name: cleanKey(apiYHints[0]) });
    } else {
        yAxisSeries.push({ dataKey: 'value', name: 'Value' });
    }
  }
  return { xAxisKey: determinedXAxisKey, yAxisSeries };
};

const identifyPieChartKeys = (data, apiNameKeyHint, apiDataKeyHint) => {
  if (!data || data.length === 0) {
    return { nameKey: apiNameKeyHint || 'name', dataKey: apiDataKeyHint || 'value' };
  }
  const sample = data[0];
  const keysInSample = Object.keys(sample);
  let determinedNameKey = apiNameKeyHint;
  let determinedDataKey = apiDataKeyHint;

  let foundNameKey = findKeyInData(keysInSample, apiNameKeyHint);
  if (foundNameKey && (typeof sample[foundNameKey] === 'string' || typeof sample[foundNameKey] === 'number')) { // Name key can be number sometimes
      determinedNameKey = foundNameKey;
  } else {
      const commonNameKeys = ['name', 'label', 'sentiment', 'category', 'group'];
      determinedNameKey = keysInSample.find(k => commonNameKeys.includes(k.toLowerCase()) && (typeof sample[k] === 'string' || typeof sample[k] === 'number')) ||
                          keysInSample.find(k => (typeof sample[k] === 'string' || typeof sample[k] === 'number'));
      if (!determinedNameKey && apiNameKeyHint) determinedNameKey = apiNameKeyHint;
      else if (!determinedNameKey) determinedNameKey = keysInSample[0];
  }
  determinedNameKey = determinedNameKey || keysInSample[0] || 'name';

  let foundDataKey = findKeyInData(keysInSample, apiDataKeyHint);
   if (foundDataKey && typeof sample[foundDataKey] === 'number') {
      determinedDataKey = foundDataKey;
  } else {
      const commonDataKeys = ['value', 'count', 'mentions', 'total', 'amount', 'percentage'];
      determinedDataKey = keysInSample.find(k => commonDataKeys.includes(k.toLowerCase()) && typeof sample[k] === 'number' && k !== determinedNameKey) ||
                          keysInSample.find(k => typeof sample[k] === 'number' && k !== determinedNameKey);
      if (!determinedDataKey) {
          determinedDataKey = keysInSample.find(k => typeof sample[k] === 'number');
      }
      if (!determinedDataKey && apiDataKeyHint) determinedDataKey = apiDataKeyHint;
      else if (!determinedDataKey) {
          const otherKeys = keysInSample.filter(k => k !== determinedNameKey);
          determinedDataKey = otherKeys.length > 0 ? otherKeys[0] : (keysInSample.length > 1 ? keysInSample[1] : keysInSample[0]);
      }
  }
  determinedDataKey = determinedDataKey || (keysInSample.length > 1 ? keysInSample.find(k => k !== determinedNameKey) || keysInSample[1] : 'value');

  if (determinedDataKey === determinedNameKey || typeof sample[determinedDataKey] !== 'number') {
      const alternativeDataKey = keysInSample.find(k => k !== determinedNameKey && typeof sample[k] === 'number');
      if (alternativeDataKey) {
          determinedDataKey = alternativeDataKey;
      } else if (typeof sample[determinedDataKey] !== 'number') {
          const anyNumeric = keysInSample.find(k => typeof sample[k] === 'number');
          if (anyNumeric) determinedDataKey = anyNumeric;
          else determinedDataKey = apiDataKeyHint || 'value';
      }
  }
  return { nameKey: determinedNameKey, dataKey: determinedDataKey };
};

const extractCleanUrl = (text) => {
  if (typeof text !== 'string') return null;
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
};

const BAR_COLORS = ['#4A6CF7', '#82ca9d', '#ff7300', '#8884d8', '#FFBB28', '#FF8042', '#AF19FF'];
const LINE_COLORS = ['#8884d8', '#82ca9d', '#ff7300', '#4A6CF7', '#FFBB28', '#FF8042', '#AF19FF'];
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#8884d8'];

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
                      {msg.components.map((component, compIndex) => {
                        const componentClasses = compIndex > 0 ? "mt-8" : ""; // Add top margin if not the first component
                        if (component.type === 'text') {
                          return <div key={`comp-text-${compIndex}`} className={`ai-text-content ${componentClasses}`}>{renderFormattedText(component.content)}</div>;
                        } else if (component.type === 'table' && component.headers && component.rows) {
                          return (
                            <div key={`comp-${compIndex}`} className={`ai-table-component w-full ${componentClasses}`}> {/* Removed my-2, added dynamic margin */}
                              {component.title && <h4 className="text-md font-semibold mb-1 mt-6">{component.title}</h4>}
                              <table className="ai-table w-full"> {/* text-sm, border-collapse, border, border-gray-300 are now in CSS */}
                                <thead className="text-xs uppercase"> {/* bg-gray-200 is now in CSS for th */}
                                  <tr>
                                    {component.headers.map((header, hIndex) => (
                                      <th key={`th-${hIndex}`} scope="col" className="font-semibold"> {/* All padding, text-align, borders are in CSS */}
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
                                      // bg-white and conditional border-b are handled by CSS (tbody tr and tbody tr:nth-child(even))
                                      <tr key={`tr-${rIndex}`}> 
                                        {row.map((cell, cIndex) => (
                                          <td key={`td-${cIndex}`}> {/* All padding, text-align, borders are in CSS */}
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
                        } else if (component.type === 'chart' && component.data && component.data.length > 0) {
                          if (component.chart_type === 'bar') {
                            const { xAxisKey, yAxisSeries } = identifyChartKeys(component.data, component.x_axis, component.y_axis, component.title);
                            if (!xAxisKey || yAxisSeries.length === 0 || !yAxisSeries[0].dataKey) {
                                console.warn(`Bar Chart: Could not determine valid keys for chart titled '${component.title}'. X-Key: ${xAxisKey}, Y-Series: ${JSON.stringify(yAxisSeries)}`);
                                return <div key={`comp-${compIndex}-error`} className={`ai-chart-component text-red-500 ${componentClasses}`}>Chart data incomplete for "{component.title}"</div>;
                            }
                            return (
                              <div key={`comp-${compIndex}`} className={`ai-chart-component ${componentClasses}`}> {/* Removed my-2, added dynamic margin */}
                                {component.title && <h4 className="text-md font-semibold mb-1 mt-6">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <BarChart data={component.data}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey={xAxisKey} />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      {yAxisSeries.map((series, idx) => (
                                        <Bar key={idx} dataKey={series.dataKey} fill={BAR_COLORS[idx % BAR_COLORS.length]} name={series.name} />
                                      ))}
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          } else if (component.chart_type === 'line') {
                            const { xAxisKey, yAxisSeries } = identifyChartKeys(component.data, component.x_axis, component.y_axis, component.title);
                             if (!xAxisKey || yAxisSeries.length === 0 || !yAxisSeries[0].dataKey) {
                                console.warn(`Line Chart: Could not determine valid keys for chart titled '${component.title}'. X-Key: ${xAxisKey}, Y-Series: ${JSON.stringify(yAxisSeries)}`);
                                return <div key={`comp-${compIndex}-error`} className={`ai-chart-component text-red-500 ${componentClasses}`}>Chart data incomplete for "{component.title}"</div>;
                            }
                            return (
                              <div key={`comp-${compIndex}`} className={`ai-chart-component ${componentClasses}`}> {/* Removed my-2, added dynamic margin */}
                                {component.title && <h4 className="text-md font-semibold mb-1 mt-6">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <LineChart data={component.data}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey={xAxisKey} />
                                      <YAxis domain={['auto', 'auto']} />
                                      <Tooltip />
                                      <Legend />
                                      {yAxisSeries.map((series, idx) => (
                                        <Line key={idx} type="monotone" dataKey={series.dataKey} stroke={LINE_COLORS[idx % LINE_COLORS.length]} name={series.name} />
                                      ))}
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            );
                          } else if (component.chart_type === 'pie' && component.data) {
                            const { nameKey, dataKey } = identifyPieChartKeys(component.data, component.name_key, component.value_key); // API might provide these hints
                            if (!nameKey || !dataKey || !component.data[0].hasOwnProperty(nameKey) || !component.data[0].hasOwnProperty(dataKey)) {
                                console.warn(`Pie Chart: Could not determine valid keys for chart titled '${component.title}'. Name Key: ${nameKey}, Data Key: ${dataKey}`);
                                return <div key={`comp-${compIndex}-error`} className={`ai-chart-component text-red-500 ${componentClasses}`}>Chart data incomplete for "{component.title}"</div>;
                            }
                            return (
                              <div key={`comp-${compIndex}`} className={`ai-chart-component ${componentClasses}`}> {/* Removed my-2, added dynamic margin */}
                                {component.title && <h4 className="text-md font-semibold mb-1 mt-6">{component.title}</h4>}
                                <div className="chart-container" style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie
                                        data={component.data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                                        fill="#8884d8" // Default fill, overridden by Cell
                                        dataKey={dataKey}
                                        nameKey={nameKey}
                                      >
                                        {component.data.map((entry, cIndex) => (
                                          <Cell key={`cell-${cIndex}`} fill={PIE_COLORS[cIndex % PIE_COLORS.length]} />
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
                          {msg.footnotes.map((footnote, fIndex) => {
                            const rawLinkSource = footnote.url || footnote.content;
                            const cleanedHref = extractCleanUrl(rawLinkSource);

                            if (!cleanedHref) {
                              return (
                                <p key={`fn-${fIndex}-nourl`} className="text-xs text-gray-500 italic">
                                  {footnote.content || footnote.url || "Reference (invalid URL)"}
                                </p>
                              );
                            }

                            let linkDisplayText = cleanedHref; // Default display text
                            if (footnote.content && footnote.content.trim() !== "" && footnote.content !== rawLinkSource && footnote.content !== cleanedHref) {
                                // Case 1: footnote.content is meaningful and different from the link source or cleaned link
                                linkDisplayText = footnote.content;
                            } else if (footnote.content && footnote.content.trim() !== "" && footnote.content === rawLinkSource && rawLinkSource !== cleanedHref) {
                                // Case 2: footnote.content was the source of the link and it got cleaned (e.g., "Referensi: http://...")
                                linkDisplayText = cleanedHref;
                            } else if (footnote.content && footnote.content.trim() !== "") {
                                // Case 3: footnote.content is present (e.g., it was already a clean URL or same as rawLinkSource which was clean)
                                linkDisplayText = footnote.content;
                            }
                            // If linkDisplayText is still just cleanedHref and footnote.content is empty but footnote.url was the source, it's fine.

                            return (
                              <p key={`fn-${fIndex}`} className="text-xs text-gray-500 italic">
                                <a
                                  href={cleanedHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {linkDisplayText}
                                </a>
                              </p>
                            );
                          })}
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
