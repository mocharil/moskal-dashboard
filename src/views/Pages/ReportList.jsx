import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Added useSelector
import { getReportJobs, regenerateReportJob } from '../../services/reportLogService'; // Added regenerateReportJob
import CustomText from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import ReportSummaryModal from './components/ReportSummaryModal';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay'; // For Regenerate
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // For View Error
import LoadingUI from './components/LoadingUI'; // Import LoadingUI
import './styles/ReportList.css';

const ReportList = () => {
  const [reportsData, setReportsData] = useState({
    reports: [],
    page: 1,
    size: 10,
    total: 0,
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // As per API pagination

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [currentReportSummary, setCurrentReportSummary] = useState(null);
  const [currentReportTopic, setCurrentReportTopic] = useState('');
  const [expandedKeywords, setExpandedKeywords] = useState({});
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State for error modal
  const [currentErrorStep, setCurrentErrorStep] = useState(''); // State for current error step
  const [currentErrorLocation, setCurrentErrorLocation] = useState(''); // State for current error location

  // States for Regenerate Modal
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateJobDetails, setRegenerateJobDetails] = useState({
    jobId: null,
    email: '', // Will use userEmail
    startDate: '',
    endDate: '',
    subKeywords: [], // Expects an array of strings
  });
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [regenerateError, setRegenerateError] = useState(null);


  const activeKeyword = useSelector((state) => state.keywords.activeKeyword); // Get activeKeyword from Redux

  // Hardcoded email for now, can be dynamic later (e.g., from user context)
  const userEmail = "arilindra21@gmail.com";

  // Wrapped fetchReports in useCallback
  const fetchReports = useCallback(async (pageToFetch, isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setIsLoading(true);
    }
    // setError(null); // Only clear global error for manual loads if needed

    try {
      const response = await getReportJobs(userEmail, pageToFetch, itemsPerPage);
      setReportsData({
        reports: response.reports,
        page: response.page,
        size: response.size,
        total: response.total,
        count: response.count,
      });
      if (isBackgroundRefresh) setError(null); // Clear error on successful background refresh
    } catch (err) {
      console.error("Failed to fetch reports (background or manual):", err);
      if (!isBackgroundRefresh) {
        setError(err.message || 'Failed to fetch reports.');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false);
      }
    }
  }, [userEmail, itemsPerPage]); // Dependencies for useCallback

  useEffect(() => {
    fetchReports(currentPage); // Initial fetch

    // Set up an interval to fetch reports every 30 seconds
    const intervalId = setInterval(() => {
      // console.log("Auto-refreshing reports...");
      fetchReports(currentPage, true); // Call the useCallback-wrapped fetchReports
    }, 10000); // 30 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);

  }, [currentPage, fetchReports]); // Added fetchReports to dependencies

  const formatKeywords = (keywordsArray) => {
    if (!keywordsArray || keywordsArray.length === 0) return 'N/A';
    return keywordsArray.join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-GB', { month: 'long' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year} at ${hours}:${minutes}`;
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Fallback if date is not parsable
    }
  };

  const toggleKeywords = (reportId) => {
    setExpandedKeywords(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  const totalPages = Math.ceil(reportsData.total / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openSummaryModal = (summaryData, topic) => {
    setCurrentReportSummary(summaryData);
    setCurrentReportTopic(topic);
    setIsSummaryModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setCurrentReportSummary(null);
    setCurrentReportTopic('');
  };

  const openErrorModal = (step, location) => {
    setCurrentErrorStep(step || 'N/A');
    setCurrentErrorLocation(location || 'N/A');
    setIsErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setCurrentErrorStep('');
    setCurrentErrorLocation('');
  };

  const openRegenerateModal = (report) => {
    setRegenerateJobDetails({
      jobId: report.id || report.filename || report.created_at,
      email: userEmail, // Pre-fill with current user's email
      startDate: report.start_date ? report.start_date.split(' ')[0] : '', // API expects YYYY-MM-DD
      endDate: report.end_date ? report.end_date.split(' ')[0] : '', // API expects YYYY-MM-DD
      subKeywords: report.sub_keyword ? report.sub_keyword.split(',').map(k => k.trim()) : (report.keywords || []),
    });
    setShowRegenerateOptions(false); // Reset to not show options by default
    setRegenerateError(null); // Clear previous errors
    setIsRegenerateModalOpen(true);
  };

  const closeRegenerateModal = () => {
    setIsRegenerateModalOpen(false);
    setRegenerateJobDetails({ jobId: null, email: '', startDate: '', endDate: '', subKeywords: [] });
    setRegenerateLoading(false);
    setRegenerateError(null);
  };

  const [newKeywordInput, setNewKeywordInput] = useState(''); // For the sub-keyword input field

  const handleRegenerateInputChange = (e) => {
    const { name, value } = e.target;
    // Removed direct handling of subKeywords here, will be handled by add/remove functions
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
      setNewKeywordInput(''); // Clear input field
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

    const params = {
      email: regenerateJobDetails.email, // Email is part of the main params for API
    };

    if (showRegenerateOptions) {
      if (regenerateJobDetails.startDate) params.start_date = regenerateJobDetails.startDate;
      if (regenerateJobDetails.endDate) params.end_date = regenerateJobDetails.endDate;
      if (regenerateJobDetails.subKeywords && regenerateJobDetails.subKeywords.length > 0 && regenerateJobDetails.subKeywords[0] !== "") {
        params.sub_keywords = regenerateJobDetails.subKeywords;
      }
    }
    // If not showRegenerateOptions, it will use original job's data on backend,
    // but we still need to pass email if it's intended to be updatable.
    // The API structure implies that if start_date, end_date, sub_keywords are not sent,
    // the backend uses the original ones.

    try {
      await regenerateReportJob(regenerateJobDetails.jobId, params);
      // alert('Report regeneration started successfully!');
      closeRegenerateModal();
      // Optionally, refresh the list or update the specific report item's status
      fetchReports(currentPage); // Refresh the list
    } catch (err) {
      console.error("Error regenerating report:", err);
      setRegenerateError(err.message || "Failed to start regeneration.");
      // alert(`Error: ${err.message || 'Failed to start regeneration.'}`);
    } finally {
      setRegenerateLoading(false);
    }
  };


  if (isLoading) {
    // return <div className="report-list-container"><CustomText>Loading reports...</CustomText></div>;
    return <LoadingUI />; // Use LoadingUI component
  }

  if (error) {
    return <div className="report-list-container"><CustomText type="error">Error: {error}</CustomText></div>;
  }

  return (
    <div className="report-list-container">
      <div className="report-list-header">
        <div className="header-content">
          <div className="header-title-section">
            {/* <AssessmentIcon className="header-icon" /> */}
            <CustomText type="title" size="ms" bold="bold" className="page-title">Report List</CustomText>
          </div>
          <Link to={`/${activeKeyword?.name}/generate-report`} className="back-to-generate-link">
            <CustomButton 
              variant="outlined" 
              className="back-to-generate-btn"
              startIcon={<ArrowBackIcon />}
            >
              Back to Generate Report
            </CustomButton>
          </Link>
        </div>
      </div>
      {reportsData.reports.length === 0 ? (
        <CustomText>No reports found.</CustomText>
      ) : (
        <>
          <div className="report-cards-container">
            {reportsData.reports.map(report => {
              const isCompletedBySummary = report.summary && Object.keys(report.summary).length > 0;
              const displayStatus = isCompletedBySummary ? 'Completed' : (report.status || 'N/A');
              const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-'); // e.g., 'completed', 'in-progress'
              const rawKeywords = report.keywords || (report.sub_keyword ? report.sub_keyword.split(',') : []);
              const reportId = report.id || report.filename || report.created_at;
              const isKeywordsExpanded = !!expandedKeywords[reportId];
              const keywordsToShow = isKeywordsExpanded ? rawKeywords : rawKeywords.slice(0, 3); // Show 3 keywords by default

              return (
                <div key={reportId} className="report-card">
                  <div className="report-card-header">
                    <CustomText type="subtitle" className="report-topic">{report.topic || 'N/A'}</CustomText>
                    {displayStatus !== 'N/A' && (
                      <span className={`status-badge status-${statusClass}`}>
                        {displayStatus}
                      </span>
                    )}
                  </div>
                  <div className="report-card-body">
                    <CustomText type="caption" className="report-date">
                      Date Range: {report.start_date && report.end_date 
                        ? `${formatDate(report.start_date)} - ${formatDate(report.end_date)}`
                        : 'N/A'}
                    </CustomText>
                    <CustomText type="caption" className="report-date">
                      Created At: {formatDate(report.created_at)}
                    </CustomText>
                    
                    {rawKeywords.length > 0 && (
                      <div className="keywords-section">
                        <CustomText type="label" className="keywords-title">Keywords:</CustomText>
                        <div className="keywords-and-button-container"> {/* New wrapper */}
                          <div className="keywords-container">
                            {keywordsToShow.map((keyword, index) => (
                              <span key={index} className="keyword-tag">{keyword.trim()}</span>
                            ))}
                          </div>
                          {rawKeywords.length > 3 && (
                            <button onClick={() => toggleKeywords(reportId)} className="toggle-keywords-btn">
                              {isKeywordsExpanded ? 'Show less' : `See more`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {report.progress !== undefined && displayStatus !== 'Completed' && report.status !== 'failed' && (
                      <div className="progress-section">
                        <CustomText type="info" className="progress-text">Progress: {report.progress}%</CustomText>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${report.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="report-card-actions">
                    {report.status === 'failed' ? (
                      <>
                        <button
                          className="report-action-button regenerate-button"
                          onClick={() => openRegenerateModal(report)} // Pass the whole report object
                          title="Regenerate this report"
                        >
                          <ReplayIcon fontSize="small" style={{ marginRight: '6px' }} />
                          Regenerate
                        </button>
                        <button
                          className="report-action-button view-error-button"
                          onClick={() => openErrorModal(report.error_step, report.error_location)}
                          title="View error details"
                        >
                          <ErrorOutlineIcon fontSize="small" style={{ marginRight: '6px' }} />
                          View Error
                        </button>
                      </>
                    ) : (
                      <>
                        {report.public_url ? (
                          <a
                            href={report.public_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="report-action-button download-button"
                          >
                            Download Report
                          </a>
                        ) : (
                          <button
                            className="report-action-button download-button disabled"
                            disabled
                          >
                            Download Unavailable
                          </button>
                        )}
                        {isCompletedBySummary ? (
                          <button
                            className="report-action-button summary-button"
                            onClick={() => openSummaryModal(report.summary, report.topic)}
                          >
                            View Summary
                          </button>
                        ) : (
                          <button
                            className="report-action-button summary-button disabled"
                            disabled
                          >
                            Summary Unavailable
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pagination-controls">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <CustomText>Page {currentPage} of {totalPages}</CustomText>
            <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
              Next
            </button>
          </div>
        </>
      )}
      <ReportSummaryModal 
        isOpen={isSummaryModalOpen}
        onClose={closeSummaryModal}
        summary={currentReportSummary}
        topic={currentReportTopic}
      />
      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="error-modal-overlay" onClick={closeErrorModal}>
          <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
            <CustomText type="subtitle" bold="bold">Error Details</CustomText>
            <div className="error-modal-details-grid">
              <CustomText type="label" bold="bold">Error Step:</CustomText>
              <CustomText type="body">{currentErrorStep}</CustomText>
              <CustomText type="label" bold="bold">Error Location:</CustomText>
              <CustomText type="body">{currentErrorLocation}</CustomText>
            </div>
            <CustomButton onClick={closeErrorModal} className="error-modal-close-btn">
              Close
            </CustomButton>
          </div>
        </div>
      )}

      {/* Regenerate Report Modal */}
      {isRegenerateModalOpen && (
        <div className="error-modal-overlay" onClick={closeRegenerateModal}>
          <div className="error-modal-content regenerate-modal-content" onClick={(e) => e.stopPropagation()}>
            <CustomText type="subtitle" bold="bold">Regenerate Report</CustomText>
            <CustomText type="body" style={{ margin: '10px 0' }}>
              Job ID: {regenerateJobDetails.jobId}
            </CustomText>

            <div className="regenerate-option-toggle">
              <input 
                type="checkbox" 
                id="editParamsToggle"
                checked={showRegenerateOptions}
                onChange={(e) => setShowRegenerateOptions(e.target.checked)}
              />
              <label htmlFor="editParamsToggle" style={{ marginLeft: '8px' }}>Edit parameters before regenerating?</label>
            </div>

            {showRegenerateOptions && (
              <div className="regenerate-options-form">
                <div className="form-field-group">
                  <CustomText type="label" bold="bold">Email Receiver (Optional):</CustomText>
                  <input
                    type="email"
                    name="email"
                    value={regenerateJobDetails.email}
                    onChange={handleRegenerateInputChange}
                    placeholder="Enter new email (optional)"
                    className="regenerate-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field-group">
                    <CustomText type="label" bold="bold">Start Date (Optional):</CustomText>
                    <input
                      type="date"
                      name="startDate"
                      value={regenerateJobDetails.startDate}
                      onChange={handleRegenerateInputChange}
                      className="regenerate-input"
                    />
                  </div>
                  <div className="form-field-group">
                    <CustomText type="label" bold="bold">End Date (Optional):</CustomText>
                    <input
                      type="date"
                      name="endDate"
                      value={regenerateJobDetails.endDate}
                      onChange={handleRegenerateInputChange}
                      className="regenerate-input"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <CustomText type="label" bold="bold">Sub-Keywords (Optional):</CustomText>
                  <div className="sub-keywords-input-area">
                    <div className="sub-keywords-tags-container">
                      {regenerateJobDetails.subKeywords.map((keyword, index) => (
                        <span key={index} className="sub-keyword-tag">
                          {keyword}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveKeyword(keyword)} 
                            className="remove-keyword-btn"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="add-keyword-controls">
                      <input
                        type="text"
                        value={newKeywordInput}
                        onChange={(e) => setNewKeywordInput(e.target.value)}
                        placeholder="Add a keyword"
                        className="regenerate-input add-keyword-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent form submission
                            handleAddKeyword();
                          }
                        }}
                      />
                      <CustomButton 
                        type="button" 
                        onClick={handleAddKeyword}
                        className="add-keyword-button"
                        variant="text"
                      >
                        Add
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {regenerateError && (
              <CustomText type="error" style={{ marginTop: '10px', color: 'red' }}>
                Error: {regenerateError}
              </CustomText>
            )}

            <div className="regenerate-modal-actions">
              <CustomButton 
                onClick={closeRegenerateModal} 
                className="regenerate-modal-button"
                variant="outlined"
                disabled={regenerateLoading}
              >
                Cancel
              </CustomButton>
              <CustomButton 
                onClick={handleSubmitRegeneration} 
                className="regenerate-modal-button"
                variant="contained"
                disabled={regenerateLoading}
              >
                {regenerateLoading ? 'Regenerating...' : 'Regenerate Now'}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportList;
