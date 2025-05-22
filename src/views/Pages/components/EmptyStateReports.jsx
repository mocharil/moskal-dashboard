import React from 'react';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './styles/EmptyStateReports.css';

const EmptyStateReports = () => {
  const activeKeyword = useSelector((state) => state.keywords.activeKeyword);

  return (
    <div className="empty-state-reports-container">
      <img src="/error.svg" alt="No reports found" className="empty-state-illustration" />
      <CustomText type="title" size="m" bold="bold" className="empty-state-title">
        No Reports Found Yet
      </CustomText>
      <CustomText type="body" size="m" className="empty-state-message">
        It looks like there are no reports generated for this view.
        Why not create your first one?
      </CustomText>
      <Link to={`/${activeKeyword?.name || 'global'}/generate-report`} className="empty-state-cta-link">
        <CustomButton variant="contained" className="empty-state-cta-button">
          Generate New Report
        </CustomButton>
      </Link>
    </div>
  );
};

export default EmptyStateReports;
