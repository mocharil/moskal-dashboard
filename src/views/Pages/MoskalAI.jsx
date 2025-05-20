import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/MoskalAI.css';

const MoskalAI = () => {
  const userData = useSelector((state) => state.user);
  const [userName, setUserName] = useState('Guest');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
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

  const dummyChartData = [
    { name: 'Topic A', value: 400 },
    { name: 'Topic B', value: 300 },
    { name: 'Topic C', value: 200 },
    { name: 'Topic D', value: 278 },
    { name: 'Topic E', value: 189 },
  ];

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

    // Show typing indicator
    const typingIndicator = {
      id: Date.now() + 0.5,
      type: 'typing',
      sender: 'ai',
    };
    setMessages((prevMessages) => [...prevMessages, typingIndicator]);

    // Simulate AI response
    setTimeout(() => {
      // Remove typing indicator
      setMessages((prevMessages) => 
        prevMessages.filter(msg => msg.id !== typingIndicator.id)
      );
      
      let aiResponse;
      if (newUserMessage.text.toLowerCase().includes('chart') || 
          newUserMessage.text.toLowerCase().includes('grafik')) {
        aiResponse = {
          id: Date.now() + 1,
          type: 'chart',
          data: dummyChartData,
          sender: 'ai',
          text: 'Berikut adalah grafik yang Anda minta:',
        };
      } else if (newUserMessage.text.toLowerCase().includes('viral topics') || 
                newUserMessage.text.toLowerCase().includes('viral topic')) {
        aiResponse = {
          id: Date.now() + 1,
          type: 'text',
          sender: 'ai',
          list: [
            {
              title: 'Program makan siang gratis',
              description: 'This topic saw a 20% spike in negative sentiment due to a viral post on X/Twitter criticizing the fairness of Prabowo\'s free lunch program — particularly claims that it excludes regions outside of Java.',
            },
            {
              title: 'Influencer Discussions',
              description: 'It\'s been widely discussed by influencers like @nasiancorruptionwatch and @cnnindonesia, with posts reaching tens of thousands of views, likes, and retweets.',
            },
          ],
          followUp: 'Would you like to see the full conversation trail or sentiment breakdown?',
        };
      } else if (newUserMessage.text.toLowerCase().includes('sentiment')) {
        aiResponse = {
          id: Date.now() + 1,
          type: 'sentiment',
          sender: 'ai',
          title: 'Here\'s the sentiment breakdown for "Program makan siang gratis" over the last 7 days:',
          data: [
            { label: 'Negative', value: '62%', color: '#FF4D4F' },
            { label: 'Neutral', value: '24%', color: '#FAAD14' },
            { label: 'Positive', value: '14%', color: '#52C41A' }
          ]
        };
      } else if (newUserMessage.text.toLowerCase().includes('influencer')) {
        aiResponse = {
          id: Date.now() + 1,
          type: 'text',
          sender: 'ai',
          text: 'Based on our analysis, the top influencers for your brand are @nasiancorruptionwatch, @cnnindonesia, and @detikcom with a combined reach of over 15 million followers.',
        };
      } else {
        aiResponse = {
          id: Date.now() + 1,
          type: 'text',
          text: `Saya adalah Moskal AI. Saya masih dalam tahap pengembangan, tetapi saya belajar dengan cepat! Anda bertanya tentang: "${newUserMessage.text}". Saat ini saya belum bisa menjawabnya secara detail.`,
          sender: 'ai',
        };
      }
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsSending(false);
    }, 1500);
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
                <div className="chat-bubble-content">
                  {msg.type === 'chart' && msg.sender === 'ai' ? (
                    <>
                      <p>{msg.text}</p>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={msg.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4A6CF7" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : msg.sender === 'ai' && msg.list ? (
                    <>
                      <p>Based on the latest data, the most viral topic in the past 7 days is:</p>
                      <ol>
                        {msg.list.map((item, index) => (
                          <li key={index}>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                          </li>
                        ))}
                      </ol>
                      {msg.followUp && <p className="follow-up-question">{msg.followUp}</p>}
                    </>
                  ) : msg.type === 'sentiment' ? (
                    <>
                      <p>{msg.title}</p>
                      <ul className="sentiment-list">
                        {msg.data.map((item, index) => (
                          <li key={index}>
                            <span className="sentiment-dot" style={{ backgroundColor: item.color }}></span>
                            <strong>{item.label}:</strong> {item.value}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>{msg.text}</p>
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
