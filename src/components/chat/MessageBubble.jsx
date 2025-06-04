import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ClipboardIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  ArrowPathIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  ClipboardDocumentCheckIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon
} from '@heroicons/react/24/solid';
import ChartRenderer from '../visualizations/ChartRenderer';
import TableRenderer from '../visualizations/TableRenderer';

const MessageBubble = ({ 
  message, 
  isStreaming = false, 
  onRegenerate, 
  onRate,
  showActions = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(message.rating || null);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleRate = (newRating) => {
    setRating(newRating);
    if (onRate) {
      onRate(message.id, newRating);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    if (isStreaming && !message.content) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500">Moskal AI is thinking...</span>
        </div>
      );
    }

    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-lg"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside my-3 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-3 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-gray-700">{children}</li>;
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {children}
              </a>
            );
          }
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  const renderVisualizations = () => {
    if (!message.visualizations || message.visualizations.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-4">
        {message.visualizations.map((viz, index) => (
          <div key={index}>
            {viz.type === 'table' ? (
              <TableRenderer visualization={viz} />
            ) : (
              <ChartRenderer visualization={viz} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const bubbleClasses = `
    max-w-4xl p-4 rounded-2xl shadow-sm transition-all duration-200
    ${isUser 
      ? 'bg-blue-600 text-white ml-auto' 
      : isSystem
        ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        : 'bg-white border border-gray-200 text-gray-900'
    }
    ${message.isWelcome ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : ''}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={bubbleClasses}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : isSystem
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {isUser ? 'U' : isSystem ? 'S' : '🤖'}
            </div>
            <span className={`font-medium text-sm ${
              isUser ? 'text-blue-100' : isSystem ? 'text-yellow-700' : 'text-gray-600'
            }`}>
              {isUser ? 'You' : isSystem ? 'System' : 'Moskal AI'}
            </span>
          </div>
          
          {message.timestamp && (
            <span className={`text-xs ${
              isUser ? 'text-blue-200' : isSystem ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className={`prose prose-sm max-w-none ${
          isUser ? 'prose-invert' : ''
        }`}>
          {renderContent()}
        </div>

        {/* Visualizations */}
        {renderVisualizations()}

        {/* Message Actions */}
        {showActions && !isUser && !isSystem && !isStreaming && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ClipboardIcon className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Regenerate response"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Regenerate
                </button>
              )}

              <button
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Share message"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleRate('up')}
                className={`p-1 rounded transition-colors ${
                  rating === 'up' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Good response"
              >
                {rating === 'up' ? (
                  <HandThumbUpSolidIcon className="w-4 h-4" />
                ) : (
                  <HandThumbUpIcon className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => handleRate('down')}
                className={`p-1 rounded transition-colors ${
                  rating === 'down' 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Poor response"
              >
                {rating === 'down' ? (
                  <HandThumbDownSolidIcon className="w-4 h-4" />
                ) : (
                  <HandThumbDownIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
