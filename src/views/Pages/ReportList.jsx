import React, { useState, useEffect } from 'react';
import { getReportJobs } from '../../services/reportLogService';
import CustomText from '../../components/CustomText';
import './styles/ReportList.css'; // We'll create this CSS file next

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const reportJobs = await getReportJobs();
        setReports(reportJobs);
      } catch (err) {
        setError(err.message || 'Failed to fetch reports.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatKeywords = (keywordsString) => {
    if (!keywordsString) return 'N/A';
    return keywordsString.split(',').map(kw => kw.trim()).join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return <div className="report-list-container"><CustomText>Loading reports...</CustomText></div>;
  }

  if (error) {
    return <div className="report-list-container"><CustomText type="error">Error: {error}</CustomText></div>;
  }

  return (
    <div className="report-list-container">
      <CustomText type="title" className="page-title">Report Jobs List</CustomText>
      {reports.length === 0 ? (
        <CustomText>No reports found.</CustomText>
      ) : (
        <table className="reports-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Keywords Used</th>
              <th>Date Range</th>
              <th>Creation Date</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Download Link</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id || report.created_at}> {/* Use a unique key */}
                <td>{report.topic || 'N/A'}</td>
                <td>{formatKeywords(report.sub_keyword)}</td>
                <td>{report.start_date} - {report.end_date}</td>
                <td>{formatDate(report.created_at)}</td>
                <td>{report.status || 'N/A'}</td>
                <td>{report.progress !== undefined ? `${report.progress}%` : 'N/A'}</td>
                <td>
                  {report.status === 'completed' && report.result?.url ? (
                    <a href={report.result.url} target="_blank" rel="noopener noreferrer" className="download-link">
                      Download
                    </a>
                  ) : report.status === 'completed' && report.result?.report_path ? (
                    <span>{report.result.report_path} (No public URL)</span>
                  )
                  : 'Not Available'}
                </td>
                <td>
                  {report.status === 'completed' ? (
                    <button 
                      className="view-summary-btn" 
                      onClick={() => alert(`Summary for ${report.topic} (ID: ${report.id}) - Not implemented yet.`)}
                    >
                      View
                    </button>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportList;
