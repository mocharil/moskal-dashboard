import React, { useState } from 'react';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import CustomContentBox from '../../../components/CustomContentBox';
import './styles/ReportSummaryModal.css';

// Icons as SVG components for better visual cues
const ScopeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="section-icon">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor"/>
  </svg>
);

const TopicsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="section-icon">
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7L12 12L22 7L12 2L2 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PeakIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="section-icon">
    <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SentimentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="section-icon">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RecommendationsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="section-icon">
    <path d="M12 15L8 11H16L12 15Z" fill="currentColor"/>
    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helper function to get the appropriate icon for a section
const getSectionIcon = (sectionKey) => {
  switch (sectionKey) {
    case 'scope_and_sentiment':
      return <ScopeIcon />;
    case 'dominant_topics':
      return <TopicsIcon />;
    case 'peak_periods':
      return <PeakIcon />;
    case 'negative_sentiment':
      return <SentimentIcon />;
    case 'key_recommendations':
      return <RecommendationsIcon />;
    default:
      return null;
  }
};

// Helper function to get section color
const getSectionColor = (sectionKey) => {
  switch (sectionKey) {
    case 'scope_and_sentiment':
      return '#3498db'; // Blue
    case 'dominant_topics':
      return '#2ecc71'; // Green
    case 'peak_periods':
      return '#9b59b6'; // Purple
    case 'negative_sentiment':
      return '#e74c3c'; // Red
    case 'key_recommendations':
      return '#f39c12'; // Orange
    default:
      return '#34495e'; // Dark blue/gray
  }
};

// Component to render a topic item with improved styling
const TopicItem = ({ topic, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Extract sentiment values for visualization
  const sentimentText = topic.sentiment || '';
  const sentimentValues = {};
  
  if (sentimentText) {
    // Reset nilai properti
    sentimentValues.positive = 0;
    sentimentValues.negative = 0;
    sentimentValues.neutral = 0;
  
    // Tiga regex: format 1 => "55% Positive", format 2 => "Positive: 55%", format 3 => "Positive: 9.0%, Negative: 1.0%, Neutral: 90.0%"
    const patterns = [
      /(\d+)%\s*(Positive|Negative|Neutral)/gi,
      /(Positive|Negative|Neutral)\s*:\s*(\d+)%/gi,
      /(Positive|Negative|Neutral)\s*:\s*(\d+(?:\.\d+)?)%/gi
    ];
    
    // Check for comma-separated format first (Positive: 9.0%, Negative: 1.0%, Neutral: 90.0%)
    const commaPattern = /(Positive|Negative|Neutral)\s*:\s*(\d+(?:\.\d+)?)%,?\s*/gi;
    let commaMatch;
    let hasCommaFormat = false;
    
    // Create a copy of the text to work with
    let textCopy = sentimentText;
    
    while ((commaMatch = commaPattern.exec(textCopy)) !== null) {
      hasCommaFormat = true;
      const label = commaMatch[1].toLowerCase();
      const value = parseFloat(commaMatch[2]);
      
      if (label === 'positive') {
        sentimentValues.positive = value;
      } else if (label === 'negative') {
        sentimentValues.negative = value;
      } else if (label === 'neutral') {
        sentimentValues.neutral = value;
      }
    }
    
    // If comma format wasn't detected, try the other patterns
    if (!hasCommaFormat) {
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(sentimentText)) !== null) {
          let label, value;
    
          // Deteksi posisi angka dan label berdasarkan pola
          if (pattern === patterns[0]) {
            value = parseInt(match[1]);
            label = match[2].toLowerCase();
          } else {
            value = parseFloat(match[2]);
            label = match[1].toLowerCase();
          }
    
          if (label === 'positive') {
            sentimentValues.positive = value;
          } else if (label === 'negative') {
            sentimentValues.negative = value;
          } else if (label === 'neutral') {
            sentimentValues.neutral = value;
          }
        }
      }
    }
  }
  
  

  return (
    <div className={`topic-item ${expanded ? 'expanded' : ''}`}>
      <div 
        className="topic-header" 
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeftColor: `hsl(${120 + index * 40}, 70%, 45%)` }}
      >
        <div className="topic-title-container">
          <CustomText type="label" bold="bold" className="topic-name" style={{ fontSize: '1em' }}>
            {topic.name}
          </CustomText>
          <span className="expand-indicator">{expanded ? '−' : '+'}</span>
        </div>
        
        {topic.sentiment && (
          <div className="sentiment-bar-container">
            <div className="sentiment-bar">
              {sentimentValues.positive > 0 && (
                <div 
                  className="sentiment-segment positive" 
                  style={{ width: `${sentimentValues.positive}%` }}
                  title={`${sentimentValues.positive}% Positive`}
                ></div>
              )}
              {sentimentValues.neutral > 0 && (
                <div 
                  className="sentiment-segment neutral" 
                  style={{ width: `${sentimentValues.neutral}%` }}
                  title={`${sentimentValues.neutral}% Neutral`}
                ></div>
              )}
              {sentimentValues.negative > 0 && (
                <div 
                  className="sentiment-segment negative" 
                  style={{ width: `${sentimentValues.negative}%` }}
                  title={`${sentimentValues.negative}% Negative`}
                ></div>
              )}
            </div>
            <CustomText type="caption" className="sentiment-text">
              {topic.sentiment}
            </CustomText>
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="topic-details">
          {topic.reach && topic.reach !== "Not available" && topic.reach !== "N/A" && (
            <div className="topic-detail-item">
              <CustomText type="caption" bold="semibold">Reach:</CustomText>
              <CustomText type="caption">{topic.reach}</CustomText>
            </div>
          )}
          
          {topic.key_points && topic.key_points.length > 0 && (
            <div className="topic-key-points">
              <CustomText bold="semibold" className="key-points-title" style={{ fontSize: '0.9em' }}>Key Points:</CustomText>
              <ul className="key-points-list">
                {topic.key_points.map((point, idx) => (
                  <li key={idx}>
                    <CustomText size="xls" style={{ fontSize: '0.1em' }}>{point}</CustomText>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component to render a mention item with improved styling
const MentionItem = ({ mention }) => (
  <div className="mention-item">
    <div className="mention-source">
      <CustomText bold="bold" style={{ fontSize: '0.95em' }}>{mention.source}</CustomText>
    </div>
    <div className="mention-description">
      <CustomText style={{ fontSize: '0.9em' }}>{mention.description}</CustomText>
    </div>
  </div>
);

// Main modal component
const ReportSummaryModal = ({ isOpen, onClose, summary, topic }) => {
  if (!isOpen || !summary) {
    return null;
  }

  // The summary data is expected to be the direct 'summary' object from the report
  const reportSpecificSummary = summary.summary;
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    scope_and_sentiment: true,
    dominant_topics: true,
    peak_periods: true,
    negative_sentiment: true,
    key_recommendations: true
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections({
      ...expandedSections,
      [sectionKey]: !expandedSections[sectionKey]
    });
  };

  return (
    <div className="report-summary-modal-overlay">
      <div className="report-summary-modal-content">
        <div className="report-summary-modal-header">
          <CustomText type="title" size="mds"  bold="bold" className="modal-title" style={{ fontSize: '1.3em' }}>Report Summary: {topic || 'Details'}</CustomText>
          <button onClick={onClose} className="report-summary-modal-close-btn">&times;</button>
        </div>
        
        <div className="report-summary-modal-body">
          {reportSpecificSummary && Object.entries(reportSpecificSummary).map(([key, section]) => {
            if (!section || typeof section !== 'object' || !section.title) {
              return null; // Skip invalid sections
            }
            
            const sectionColor = getSectionColor(key);
            const sectionIcon = getSectionIcon(key);
            
            return (
              <div key={key} className="summary-section">
                <div 
                  className="section-header" 
                  onClick={() => toggleSection(key)}
                  style={{ borderBottomColor: sectionColor }}
                >
                  <div className="section-title-container">
                    {sectionIcon && <div className="section-icon-container" style={{ color: sectionColor }}>{sectionIcon}</div>}
                    <CustomText type="subtitle" bold="bold" className="section-title" style={{ color: sectionColor, fontSize: '1.1em' }}>
                      {section.title}
                    </CustomText>
                  </div>
                  <span className="section-toggle">{expandedSections[key] ? '−' : '+'}</span>
                </div>
                
                {expandedSections[key] && (
                  <div className="section-content">
                    {/* Render points (used in scope_and_sentiment, peak_periods, key_recommendations) */}
                    {section.points && Array.isArray(section.points) && (
                      <ul className="points-list">
                        {section.points.map((point, index) => (
                          <li key={index} className="point-item">
                            <CustomText size="xls" style={{ fontSize: '0.95em' }}>{point}</CustomText>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Render topics (used in dominant_topics) */}
                    {section.topics && Array.isArray(section.topics) && (
                      <div className="topics-container">
                        {section.topics.map((topicItem, topicIndex) => (
                          <TopicItem key={topicIndex} topic={topicItem} index={topicIndex} />
                        ))}
                      </div>
                    )}
                    
                    {/* Render mentions (used in negative_sentiment) */}
                    {section.mentions && Array.isArray(section.mentions) && (
                      <div className="mentions-container">
                        {section.mentions.map((mention, mentionIndex) => (
                          <MentionItem key={mentionIndex} mention={mention} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryModal;
