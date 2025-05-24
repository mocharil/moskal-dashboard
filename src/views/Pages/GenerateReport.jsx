import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux'; // No longer using for project keywords
import { useParams, Link } from 'react-router-dom'; // Import Link
import { getProjects } from '../../services/projectService'; // Import project service
import './styles/GenerateReport.css';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import DialogDateFilter from './components/DialogDateFilter'; // Import the date filter dialog
import { Button } from '@mui/material'; // For the "Change Date Range" button
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Optional: for an icon
import AssessmentIcon from '@mui/icons-material/Assessment'; // Report icon for header
import BarChartIcon from '@mui/icons-material/BarChart'; // Chart icon for header
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // No longer needed
// import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // No longer needed
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GenerateReport = () => {
  const params = useParams();
  const currentProjectNameFromUrl = params.keyword || 'Default Project';

  const [projectName, setProjectName] = useState(currentProjectNameFromUrl);
  // const relevantKeywordsFromStore = useSelector(state => state.keywords.keywords); // Replaced by project-specific fetch
  const [projectActiveKeywords, setProjectActiveKeywords] = useState([]); // For project-specific keywords
  const [isProjectKeywordsLoading, setIsProjectKeywordsLoading] = useState(false);
  const [projectKeywordsError, setProjectKeywordsError] = useState('');
  
  const [customKeywords, setCustomKeywords] = useState([]);
  const [newCustomKeyword, setNewCustomKeyword] = useState('');
  const [email, setEmail] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
    return {
      startDate: thirtyDaysAgo.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
    };
  });
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [apiResponse, setApiResponse] = useState(null); // No longer needed, using toast

  useEffect(() => {
    setProjectName(currentProjectNameFromUrl);

    // Fetch projects and set active keywords for the current project
    const fetchProjectKeywords = async () => {
      setIsProjectKeywordsLoading(true);
      setProjectKeywordsError('');
      try {
        const projectsResponse = await getProjects();

        if (typeof projectsResponse !== 'object' || projectsResponse === null) {
          console.error("Projects response is not an object:", projectsResponse);
          setProjectKeywordsError('Failed to load project data. Unexpected format.');
          setProjectActiveKeywords([]);
          setIsProjectKeywordsLoading(false);
          return;
        }

        const ownedProjects = projectsResponse.owned_projects || [];
        const accessibleProjects = projectsResponse.accessible_projects || [];
        const allProjects = [...ownedProjects, ...accessibleProjects];

        if (!Array.isArray(allProjects)) { // Should not happen if owned/accessible are arrays
            console.error("Combined projects data is not an array:", allProjects);
            setProjectKeywordsError('Failed to process project data.');
            setProjectActiveKeywords([]);
            setIsProjectKeywordsLoading(false);
            return;
        }
        
        // Assuming project objects have a 'name' field for the project's name
        // and 'active_keywords' field for its keywords.
        const currentProject = allProjects.find(p => p.name === currentProjectNameFromUrl);
        
        if (currentProject) {
          // Use 'keywords' field instead of 'active_keywords' based on user feedback
          const projectKeywordsArray = currentProject.keywords; 
          if (Array.isArray(projectKeywordsArray) && projectKeywordsArray.length > 0) {
            // Keywords are already strings as per user feedback, direct mapping or filtering out empty strings
            setProjectActiveKeywords(projectKeywordsArray.map(kw => kw || '').filter(kw => kw !== ''));
          } else {
            setProjectActiveKeywords([]); // Project found, but no keywords or not in expected format
          }
        } else {
          setProjectActiveKeywords([]); // Project not found
          if (currentProjectNameFromUrl !== 'Default Project') {
            setProjectKeywordsError(`Project "${currentProjectNameFromUrl}" not found or you may not have access.`);
          }
        }
      } catch (error) {
        console.error("Error fetching or processing project keywords:", error);
        setProjectActiveKeywords([]);
        const message = error.response?.data?.message || error.message || 'An error occurred while loading project keywords.';
        setProjectKeywordsError(message);
      } finally {
        setIsProjectKeywordsLoading(false);
      }
    };

    if (currentProjectNameFromUrl && currentProjectNameFromUrl !== 'Default Project') {
      fetchProjectKeywords();
    } else {
      setProjectActiveKeywords([]);
      setIsProjectKeywordsLoading(false); // Ensure loading is false if no fetch occurs
    }

    // Fetch user email from localStorage
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.value && userData.value.email) {
          setEmail(userData.value.email);
        } else {
          setEmail('user@example.com'); // Fallback email
        }
      } else {
        setEmail('user@example.com'); // Fallback email
      }
    } catch (error) {
      console.error("Error fetching user email from localStorage:", error);
      setEmail('user@example.com'); // Fallback email on error
    }
  }, [currentProjectNameFromUrl]); // Rerun effect if project name changes


  const handleAddCustomKeyword = () => {
    if (newCustomKeyword.trim() !== '' && !customKeywords.includes(newCustomKeyword.trim())) {
      setCustomKeywords([...customKeywords, newCustomKeyword.trim()]);
      setNewCustomKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove, type) => {
    // Active keywords from project are not removable from this UI
    if (type === 'custom') {
      setCustomKeywords(customKeywords.filter(k => k !== keywordToRemove));
    }
  };

  const handleDateChange = (selectedDates) => {
    // data from DialogDateFilter is { date_filter: "custom", custom_start_date: "YYYY-MM-DD", custom_end_date: "YYYY-MM-DD" }
    setDateRange({
      startDate: selectedDates.custom_start_date,
      endDate: selectedDates.custom_end_date,
    });
    setIsDateDialogOpen(false); // Close dialog after selection
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone issues if date is parsed incorrectly
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const handleGenerateReport = async () => {
    setIsLoading(true);
    // setApiResponse(null); // No longer needed

    const VITE_REPORT_API_BASE = import.meta.env.VITE_REPORT_API_BASE;
    if (!VITE_REPORT_API_BASE) {
        toast.error("API base URL not configured.");
        setIsLoading(false);
        return;
    }

    const allKeywords = [...projectActiveKeywords, ...customKeywords]; // Use projectActiveKeywords
    if (allKeywords.length === 0) {
      toast.error("Please add at least one keyword (project or custom).");
      setIsLoading(false);
      return;
    }
    const subKeywordsString = allKeywords.join(',');

    const params = new URLSearchParams({
      topic: projectName, // This is the project name from the URL
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      sub_keyword: subKeywordsString,
      email_receiver: email,
    });

    const url = `${VITE_REPORT_API_BASE}/generate-report?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
        // body: '' // API expects an empty body based on curl example
      });

      const result = await response.json();
      // setApiResponse(result); // No longer needed

      if (result.status === 'success') {
        // console.log('Report generation started:', result.data.job_id); // Job ID removed from user view
        toast.success(
          <div>
            <CustomText type="bold" style={{ fontSize: '1.1rem', color: '#ffffff' }}>Report Generation Initiated!</CustomText>
            <CustomText style={{ marginTop: '8px', fontSize: '0.95rem', color: '#ffffff' }}>
              Awesome! Your report is being generated and will be sent to your email address (<strong>{email}</strong>) as soon as it's ready.
            </CustomText>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored", // Use colored theme for better default styling
          }
        );
      } else {
        console.error('Error generating report:', result.message);
        toast.error(result.message || "An unknown error occurred while generating the report.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error('Failed to send request:', error);
      toast.error(`Failed to send request: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generate-report-container">
      <ToastContainer />
      <div className="report-page-header">
        <div className="header-content">
          <div className="header-icon-container">
            <AssessmentIcon className="header-icon primary" style={{ fontSize: 40 }} />
            <BarChartIcon className="header-icon secondary" style={{ fontSize: 32 }} />
          </div>
          <div className="header-text">
            <CustomText type="title" className="page-title">Generate Project Report</CustomText>
            <CustomText type="sub-title" className="page-subtitle">
              Create a sentiment analysis report for project: <strong>{projectName}</strong>
            </CustomText>
          </div>
        </div>
      </div>

      <div className="form-section">
        <CustomText type="label" className="custom-text-label">Report Date Range</CustomText>
        <div className="date-range-picker-control">
          <div className="date-range-display-text">
            <CalendarTodayIcon fontSize="small" style={{ marginRight: '10px', color: '#4a4a4a' }} />
            {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
          </div>
          <Button 
            variant="outlined" 
            onClick={() => setIsDateDialogOpen(true)}
            className="change-date-btn"
          >
            Change Date Range
          </Button>
        </div>
        <DialogDateFilter
          open={isDateDialogOpen}
          onClose={() => setIsDateDialogOpen(false)}
          handleChangeFilter={handleDateChange}
        />
      </div>

      <div className="form-section">
        <CustomText type="label" className="custom-text-label">
          Keywords for This Project <span className="keyword-count">{projectActiveKeywords.length}</span>
        </CustomText>
        {isProjectKeywordsLoading ? (
          <CustomText type="caption" style={{ color: '#555' }}>Loading project keywords...</CustomText>
        ) : projectKeywordsError ? (
          <CustomText type="caption" style={{ color: '#d9534f' }}>Error: {projectKeywordsError}</CustomText>
        ) : projectActiveKeywords.length > 0 ? (
          <>
            <div className="keywords-list" style={{ marginBottom: '8px' }}>
              {projectActiveKeywords.map((keyword, index) => (
                <div key={`${keyword}-${index}`} className="keyword-chip active">
                  {keyword}
                </div>
              ))}
            </div>
            <CustomText type="caption" style={{ color: '#777' }}>
            <br></br>These are the default project keywords configured in the Settings menu by the owner
            </CustomText>
          </>
        ) : (
          <CustomText type="caption" style={{ color: '#777' }}>
            No default keywords found for "{projectName}". You can add additional keywords below.
          </CustomText>
        )}
      </div>

      <div className="form-section">
        <CustomText type="label" className="custom-text-label">Add Additional Keywords (Optional)</CustomText>
        <div className="add-keyword-input-group">
          <input
            type="text"
            value={newCustomKeyword}
            onChange={e => setNewCustomKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()}
            placeholder="Enter an additional keyword and press Enter or click Add"
            className="custom-keyword-input"
          />
          <CustomButton onClick={handleAddCustomKeyword} className="add-keyword-btn">
            + Add Keyword
          </CustomButton>
        </div>
        {customKeywords.length > 0 && (
          <div className="keywords-list custom-keywords-display" style={{ marginTop: '15px' }}>
            {customKeywords.map(keyword => (
              <div key={keyword} className="keyword-chip custom">
                {keyword}
                <button onClick={() => handleRemoveKeyword(keyword, 'custom')} className="remove-keyword-btn" aria-label={`Remove ${keyword}`}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <CustomText type="label" className="custom-text-label">Report Destination Email</CustomText>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="email-input"
        />
        <CustomText type="caption" className="email-caption" style={{ marginTop: '5px', color: '#777' }}>
          The generated report will be sent to this email
        </CustomText>
      </div>

      <div className="action-buttons-container">
        <div className="primary-button-wrapper">
          <CustomButton
            onClick={handleGenerateReport}
            disabled={isLoading || isProjectKeywordsLoading}
            className="generate-send-btn"
          >
            {isLoading ? 'Generating Report...' : 'Generate & Send Report'}
          </CustomButton>
        </div>

        <div className="secondary-button-wrapper">
          <Link to="/report-list" className="view-reports-link">
            <CustomButton
              variant="outlined"
              className="view-report-list-btn"
              startIcon={<AssessmentIcon />}
            >
              View Report List
            </CustomButton>
          </Link>
        </div>
      </div>

      {/* The apiResponse display is now handled by react-toastify */}
    </div>
  );
};

export default GenerateReport;
