import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getReportJobs, regenerateReportJob } from '../../services/reportLogService';
import ReportSummaryModal from './components/ReportSummaryModal';
import ReplayIcon from '@mui/icons-material/Replay'; 
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LoadingUI from './components/LoadingUI';
import EmptyStateReports from './components/EmptyStateReports';
import './styles/ReportList.css';

const ReportList = () => {
  const [reportsData, setReportsData] = useState({
    reports: [], // This will store up to 1000 reports fetched from the API
    page: 1, // API page, should be 1
    size: 1000, // API page_size
    total: 0, // Total reports available on backend
    count: 0, // Count of reports in the current API response (<= 1000)
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // For client-side pagination
  const itemsPerPage = 10; // Items to display per page on the client side

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [currentReportSummary, setCurrentReportSummary] = useState(null);
  const [currentReportTopic, setCurrentReportTopic] = useState('');
  
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [currentErrorStep, setCurrentErrorStep] = useState('');
  const [currentErrorLocation, setCurrentErrorLocation] = useState('');

  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateJobDetails, setRegenerateJobDetails] = useState({
    jobId: null, email: '', startDate: '', endDate: '', subKeywords: [],
  });
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [regenerateError, setRegenerateError] = useState(null);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  const activeKeyword = useSelector((state) => state.keywords.activeKeyword);
  const userEmail = useSelector((state) => state.user.email);

  const [searchTerm, setSearchTerm] = useState('');

  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [keywordModalContent, setKeywordModalContent] = useState({ title: '', description: '', keywords: [] });

  const fetchReports = useCallback(async (pageToFetch, isBackgroundRefresh = false) => {
    if (!userEmail) {
      if (!isBackgroundRefresh) setIsLoading(false);
      return;
    }
    if (!isBackgroundRefresh) setIsLoading(true);

    try {
      // Fetch page 1 with size 1000 from the API
      const response = await getReportJobs(userEmail, 1, reportsData.size); 
      const updatedReports = response.reports.map(report => {
        if (report.status !== 'Completed' && report.status !== 'failed') {
          const originalCreatedAt = report.created_at;
          const createdAtDate = new Date(originalCreatedAt);
          const now = new Date();
          const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

          if (createdAtDate instanceof Date && !isNaN(createdAtDate.getTime())) {
            const timeDifference = now.getTime() - createdAtDate.getTime();
            if (timeDifference > oneDayInMilliseconds) {
              return {
                ...report,
                status: 'failed',
                error_step: report.error_step || 'System Error',
                error_location: report.error_location || 'System Timeout',
              };
            }
          }
        }
        return report;
      });
      setReportsData({
        reports: updatedReports, // Store all fetched reports (up to 1000)
        page: response.page, // API response page (should be 1)
        size: reportsData.size, // API page_size used (1000)
        total: response.total, // Total reports on backend
        count: response.count, // Number of reports in this API response
      });
      if (isBackgroundRefresh) setError(null);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      if (!isBackgroundRefresh) {
        let displayError = 'Failed to fetch reports.';
        if (err instanceof Error) {
          displayError = err.message;
        } else if (typeof err === 'string') {
          displayError = err;
        } else if (err && typeof err.toString === 'function') {
          const errStr = err.toString();
          if (errStr !== '[object Object]') {
            displayError = errStr;
          }
        }
        setError(displayError);
      }
    } finally {
      if (!isBackgroundRefresh) setIsLoading(false);
    }
  }, [userEmail, reportsData.size]); // Depends on reportsData.size for the API call

  useEffect(() => {
    if (userEmail) {
      fetchReports(1); // Always fetch the first page of 1000 items
      const intervalId = setInterval(() => {
        fetchReports(1, true); // Refresh the full dataset
      }, 10000);
      return () => clearInterval(intervalId);
    } else {
      setIsLoading(true); // Or handle not logged in state
    }
  }, [fetchReports, userEmail]); // No longer depends on currentPage for fetching

  const formatDate = (dateString, includeTime = true, forInput = false) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (forInput) { 
        return date.toISOString().split('T')[0];
      }
      const day = date.getDate();
      const month = date.toLocaleString('en-GB', { month: 'short' });
      const year = date.getFullYear();
      if (includeTime) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} at ${hours}:${minutes}`;
      }
      return `${String(day).padStart(2, '0')} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };
  
  const calculateDuration = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return 'N/A';
    try {
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} Days`;
    } catch (e) {
        return 'N/A';
    }
  };

  // Filter reports based on search term
  const filteredReports = reportsData.reports.filter(report => {
    const searchTermLower = searchTerm.toLowerCase();
    const topic = (report.topic || '').toLowerCase();
    const keywordsArray = report.keywords || (report.sub_keyword ? report.sub_keyword.split(',') : []);
    const keywordsString = keywordsArray.join(' ').toLowerCase();
    const startDate = formatDate(report.start_date, false).toLowerCase();
    const endDate = formatDate(report.end_date, false).toLowerCase();
    const createdAt = formatDate(report.created_at, true).toLowerCase();

    return topic.includes(searchTermLower) ||
           keywordsString.includes(searchTermLower) ||
           startDate.includes(searchTermLower) ||
           endDate.includes(searchTermLower) ||
           createdAt.includes(searchTermLower);
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Client-side pagination calculations
  const totalFilteredReports = filteredReports.length;
  const totalPages = Math.ceil(totalFilteredReports / itemsPerPage);
  
  const currentDisplayedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 4; // Max number of page links shown (excluding first, last, ellipsis)
    
    if (totalPages <= maxPagesToShow + 1) { 
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <div key={i} className={`page-number ${currentPage === i ? 'active' : ''}`} onClick={() => handlePageClick(i)}>
                    {i}
                </div>
            );
        }
    } else {
        // Always show first page
        pageNumbers.push(
            <div key={1} className={`page-number ${currentPage === 1 ? 'active' : ''}`} onClick={() => handlePageClick(1)}>
                1
            </div>
        );

        let startPage, endPage;
        // Determine the range of page numbers to show around the current page
        if (currentPage <= Math.ceil(maxPagesToShow / 2)) { // Current page is near the beginning
            startPage = 2;
            endPage = maxPagesToShow;
        } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) { // Current page is near the end
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages - 1;
        } else { // Current page is somewhere in the middle
            startPage = currentPage - Math.floor((maxPagesToShow -1) / 2);
            endPage = currentPage + Math.ceil((maxPagesToShow-1) / 2) ;
        }
        
        // Add ellipsis if startPage is far from the first page
        if (startPage > 2) {
             pageNumbers.push(<div key="start-ellipsis" className="page-number">...</div>);
        }

        // Add page numbers in the calculated range
        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) { // Ensure not to duplicate first/last page if they fall in range
                pageNumbers.push(
                    <div key={i} className={`page-number ${currentPage === i ? 'active' : ''}`} onClick={() => handlePageClick(i)}>
                        {i}
                    </div>
                );
            }
        }
        
        // Add ellipsis if endPage is far from the last page
        if (endPage < totalPages - 1) {
            pageNumbers.push(<div key="end-ellipsis" className="page-number">...</div>);
        }

        // Always show last page (if totalPages > 1)
        if (totalPages > 1) {
            pageNumbers.push(
                <div key={totalPages} className={`page-number ${currentPage === totalPages ? 'active' : ''}`} onClick={() => handlePageClick(totalPages)}>
                    {totalPages}
                </div>
            );
        }
    }
    return pageNumbers;
};

  const openSummaryModal = (summaryData, topic) => {
    setCurrentReportSummary(summaryData);
    setCurrentReportTopic(topic);
    setIsSummaryModalOpen(true);
  };
  const closeSummaryModal = () => setIsSummaryModalOpen(false);

  const openErrorModal = (step, location) => {
    setCurrentErrorStep(step || 'N/A');
    setCurrentErrorLocation(location || 'N/A');
    setIsErrorModalOpen(true);
  };
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const openRegenerateModal = (report) => {
    setRegenerateJobDetails({
      jobId: report.id || report.filename || report.created_at,
      email: userEmail,
      startDate: report.start_date ? formatDate(report.start_date, false, true) : '',
      endDate: report.end_date ? formatDate(report.end_date, false, true) : '',
      subKeywords: report.keywords || (report.sub_keyword ? report.sub_keyword.split(',').map(k => k.trim()) : []),
    });
    setShowRegenerateOptions(false);
    setRegenerateError(null);
    setIsRegenerateModalOpen(true);
  };
  const closeRegenerateModal = () => {
    setIsRegenerateModalOpen(false);
    setRegenerateLoading(false);
    setRegenerateError(null);
  };
  
  const handleRegenerateInputChange = (e) => {
    const { name, value } = e.target;
    setRegenerateJobDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKeyword = () => {
    if (newKeywordInput.trim() !== "") {
      const keywordToAdd = newKeywordInput.trim();
      if (!regenerateJobDetails.subKeywords.includes(keywordToAdd)) {
        setRegenerateJobDetails(prev => ({
          ...prev,
          subKeywords: [...prev.subKeywords, keywordToAdd]
        }));
      }
      setNewKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setRegenerateJobDetails(prev => ({
      ...prev,
      subKeywords: prev.subKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmitRegeneration = async () => {
    if (!regenerateJobDetails.jobId) return;
    setRegenerateLoading(true);
    setRegenerateError(null);
    const params = { email: regenerateJobDetails.email };
    if (showRegenerateOptions) {
      if (regenerateJobDetails.startDate) params.start_date = regenerateJobDetails.startDate;
      if (regenerateJobDetails.endDate) params.end_date = regenerateJobDetails.endDate;
      if (regenerateJobDetails.subKeywords && regenerateJobDetails.subKeywords.length > 0 && regenerateJobDetails.subKeywords[0] !== "") {
        params.sub_keywords = regenerateJobDetails.subKeywords;
      }
    }
    try {
      await regenerateReportJob(regenerateJobDetails.jobId, params);
      closeRegenerateModal();
      fetchReports(currentPage);
    } catch (err) {
      setRegenerateError(err.message || "Failed to start regeneration.");
    } finally {
      setRegenerateLoading(false);
    }
  };

  const showKeywordsModal = (report) => {
    const reportKeywords = report.keywords || (report.sub_keyword ? report.sub_keyword.split(',').map(k => k.trim()) : []);
    setKeywordModalContent({
        title: report.topic || "Report Keywords",
        description: `Keywords for report created at ${formatDate(report.created_at)}`,
        keywords: reportKeywords
    });
    setIsKeywordModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeKeywordModal = () => {
    setIsKeywordModalOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isKeywordModalOpen) {
        closeKeywordModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isKeywordModalOpen]);


  if (isLoading && reportsData.reports.length === 0 && !error) return <LoadingUI />;
  // Error state should be handled within the main layout if possible, or as a full page if critical
  // The new HTML structure doesn't have a dedicated full-page error spot, so we'll show it inside the container.

  return (
    <>
      <div className="container fade-in">
        <div className="header">
          <h1>📊 Report List</h1>
          <Link to={activeKeyword ? `/${activeKeyword.name}/generate-report` : "/generate-report"} className="back-btn" style={{textDecoration: 'none'}}>
            ← Back to Generate Report
          </Link>
        </div>
        
        <div className="table-container">
          <div className="search-bar">
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search reports by user, keywords, or date..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {isLoading && currentDisplayedReports.length === 0 && reportsData.reports.length === 0 && <LoadingUI />}
          {error && <div style={{color: 'red', textAlign: 'center', padding: '20px'}}>Error: {error}</div>}
          {!isLoading && !error && totalFilteredReports === 0 && <EmptyStateReports />}
          
          {totalFilteredReports > 0 && (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date Range</th>
                  <th>Created</th>
                  <th>Keywords</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDisplayedReports.map((report) => {
                  const isCompletedBySummary = report.summary && Object.keys(report.summary).length > 0;
                  let displayStatus = isCompletedBySummary ? 'Completed' : (report.status || 'N/A');
                  if (report.status === 'failed') displayStatus = 'failed';
                  
                  const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
                  const rawKeywords = report.keywords || (report.sub_keyword ? report.sub_keyword.split(',').map(k => k.trim()) : []);

                  return (
                    <tr key={report.id || report.filename || report.created_at}>
                      <td>
                        <div className="user-name">{report.topic || 'N/A'}</div>
                      </td>
                      <td>
                        {displayStatus === 'processing' || (displayStatus !== 'Completed' && displayStatus !== 'failed' && report.progress < 100 && report.progress !== undefined) ? (
                          <>
                            <span className={`status-badge status-${statusClass}`}>
                              <div className="spinner"></div>
                              {displayStatus}
                              <div className="processing-dots"><span></span><span></span><span></span></div>
                            </span>
                            {report.progress !== undefined && report.progress < 100 && (
                               <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${report.progress}%` }}></div>
                               </div>
                            )}
                          </>
                        ) : (
                          <span className={`status-badge status-${statusClass}`}>
                      
                            {displayStatus}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="date-range">
                          <div className="date-item">
                            <div className="date-icon from">📅</div>
                            <div className="date-content">
                              <span className="date-label">From</span>
                              <span className="date-value">{formatDate(report.start_date, false)}</span>
                            </div>
                          </div>
                          <div className="date-item">
                            <div className="date-icon to">📍</div>
                            <div className="date-content">
                              <span className="date-label">To</span>
                              <span className="date-value">{formatDate(report.end_date, false)}</span>
                            </div>
                          </div>
                          <div className="date-duration">
                            <span className="duration-icon">⏱️</span>
                            <span className="duration-text">{calculateDuration(report.start_date, report.end_date)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="created-date">{formatDate(report.created_at, true)}</div>
                      </td>
                      <td>
                        {rawKeywords.length > 0 ? (
                            <div className="keywords-container">
                            {rawKeywords.slice(0, 3).map((kw, idx) => (
                                <span key={idx} className="keyword-tag">{kw}</span>
                            ))}
                            {rawKeywords.length > 3 && (
                                <span className="see-more" onClick={() => showKeywordsModal(report)}>
                                +{rawKeywords.length - 3} more
                                </span>
                            )}
                            </div>
                        ) : (
                            <div className="keywords-container">
                                {/* Placeholder for loading or N/A for keywords */}
                                <span className="keyword-tag">N/A</span>
                            </div>
                        )}
                      </td>
                      <td>
                        <div className="actions-container">
                          {displayStatus === 'failed' ? (
                            <>
                              <button className="btn btn-secondary" onClick={() => openRegenerateModal(report)} title="Regenerate Report">
                                <ReplayIcon fontSize="small" style={{marginRight: '4px'}} /> Regenerate
                              </button>
                              <button className="btn btn-secondary" onClick={() => openErrorModal(report.error_step, report.error_location)} title="View Error Details">
                                <ErrorOutlineIcon fontSize="small" style={{marginRight: '4px'}} /> View Error
                              </button>
                            </>
                          ) : displayStatus === 'Completed' ? (
                            <>
                              {report.public_url ? (
                                <a href={report.public_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                  📥 Download Report
                                </a>
                              ) : (
                                <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                  📥 Download Unavailable
                                </button>
                              )}
                              <button className="btn btn-secondary" onClick={() => openSummaryModal(report.summary, report.topic)}>
                                👁 View Summary
                              </button>
                            </>
                          ) : ( 
                            <>
                              <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                ⏳ Processing...
                              </button>
                              <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                👁 View Summary
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {totalPages > 0 && totalFilteredReports > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredReports)}-{Math.min(currentPage * itemsPerPage, totalFilteredReports)}</strong> of <strong>{totalFilteredReports}</strong> reports
              </div>
              <div className="pagination-controls">
                <button 
                    className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => handlePageClick(currentPage - 1)} 
                    disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <div className="page-numbers">
                  {renderPageNumbers()}
                </div>
                <button 
                    className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
                    onClick={() => handlePageClick(currentPage + 1)} 
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReportSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={closeSummaryModal}
        summary={currentReportSummary}
        topic={currentReportTopic}
      />

      {isKeywordModalOpen && (
        <div className="keyword-modal show" onClick={(e) => { if (e.target === e.currentTarget) closeKeywordModal();}}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">🏷️ All Keywords</div>
              <button className="close-btn" onClick={closeKeywordModal}>×</button>
            </div>
            <div className="results-summary">
              <div className="results-icon">📊</div>
              <div className="results-text">
                <div className="results-title">{keywordModalContent.title}</div>
                <div className="results-desc">{keywordModalContent.description}</div>
              </div>
            </div>
            <div className="all-keywords">
              {keywordModalContent.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag-large">{keyword}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {isErrorModalOpen && (
         <div className="keyword-modal show" onClick={closeErrorModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title" style={{gap: '8px'}}><ErrorOutlineIcon /> Error Details</div>
                    <button className="close-btn" onClick={closeErrorModal}>×</button>
                </div>
                <div style={{padding: '10px 0'}}>
                    <p><strong>Error Step:</strong> {currentErrorStep}</p>
                    <p><strong>Error Location:</strong> {currentErrorLocation}</p>
                </div>
                 <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
                    <button onClick={closeErrorModal} className="btn btn-primary">Close</button>
                </div>
            </div>
        </div>
      )}

      {isRegenerateModalOpen && (
        <div className="keyword-modal show" onClick={closeRegenerateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <div className="modal-title" style={{gap: '8px'}}><ReplayIcon /> Regenerate Report</div>
                <button className="close-btn" onClick={closeRegenerateModal}>×</button>
            </div>
            <p style={{textAlign: 'center', margin: '10px 0', fontSize: '0.9em', color: '#555'}}>Job ID: {regenerateJobDetails.jobId}</p>

            <div style={{margin: '15px 0', padding: '10px', background: '#f9f9f9', borderRadius: '8px'}}>
              <input 
                type="checkbox" 
                id="editParamsToggle"
                checked={showRegenerateOptions}
                onChange={(e) => setShowRegenerateOptions(e.target.checked)}
                style={{marginRight: '8px', verticalAlign: 'middle'}}
              />
              <label htmlFor="editParamsToggle" style={{verticalAlign: 'middle', cursor: 'pointer'}}>Edit parameters before regenerating?</label>
            </div>

            {showRegenerateOptions && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', border:'1px solid #e0e0e0', padding:'20px', borderRadius:'8px', background:'#fff'}}>
                <div>
                  <label htmlFor="regen-email" style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>Email Receiver (Optional):</label>
                  <input
                    type="email" id="regen-email" name="email"
                    value={regenerateJobDetails.email} onChange={handleRegenerateInputChange}
                    placeholder="Enter new email (optional)" className="search-input"
                  />
                </div>
                <div style={{display:'flex', gap:'15px'}}>
                    <div style={{flex:1}}>
                        <label htmlFor="regen-startDate" style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>Start Date (Optional):</label>
                        <input type="date" id="regen-startDate" name="startDate" value={regenerateJobDetails.startDate} onChange={handleRegenerateInputChange} className="search-input"/>
                    </div>
                    <div style={{flex:1}}>
                        <label htmlFor="regen-endDate" style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>End Date (Optional):</label>
                        <input type="date" id="regen-endDate" name="endDate" value={regenerateJobDetails.endDate} onChange={handleRegenerateInputChange} className="search-input"/>
                    </div>
                </div>
                <div>
                  <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>Sub-Keywords (Optional):</label>
                  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '10px'}}>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px', minHeight: '30px'}}>
                      {regenerateJobDetails.subKeywords.map((keyword, index) => (
                        <span key={index} className="keyword-tag" style={{cursor:'default', display:'inline-flex', alignItems:'center'}}>
                          {keyword}
                          <button onClick={() => handleRemoveKeyword(keyword)} style={{marginLeft:'6px', border:'none', background:'transparent', color:'#d9534f', cursor:'pointer', fontSize:'1.1em', padding:'0 2px'}}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                      <input
                        type="text" value={newKeywordInput} onChange={(e) => setNewKeywordInput(e.target.value)}
                        placeholder="Add a keyword" className="search-input" style={{flexGrow:1}}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword();}}}
                      />
                      <button type="button" onClick={handleAddKeyword} className="btn btn-secondary" style={{padding:'8px 15px', fontSize:'0.9em'}}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {regenerateError && <p style={{color: 'red', marginTop: '15px', textAlign:'center', background:'#ffebee', border:'1px solid #ef9a9a', padding:'8px', borderRadius:'4px'}}>Error: {regenerateError}</p>}

            <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'25px'}}>
              <button onClick={closeRegenerateModal} className="btn btn-secondary" disabled={regenerateLoading}>Cancel</button>
              <button onClick={handleSubmitRegeneration} className="btn btn-primary" disabled={regenerateLoading}>
                {regenerateLoading ? 'Regenerating...' : 'Regenerate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportList;
