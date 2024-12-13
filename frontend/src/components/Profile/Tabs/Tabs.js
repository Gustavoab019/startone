import React from 'react';
import InfoTab from './InfoTab';
import PortfolioTab from './PortfolioTab';
import EvaluationsTab from './EvaluationsTab';

const Tabs = ({ activeTab, profile, recentProjects, setProjectsCount }) => {
  switch (activeTab) {
    case 'info':
      return <InfoTab profile={profile} recentProjects={recentProjects} />;
    case 'portfolio':
      return <PortfolioTab onProjectCount={setProjectsCount} />;
    case 'evaluations':
      return <EvaluationsTab profile={profile} />;
    default:
      return <InfoTab profile={profile} recentProjects={recentProjects} />;
  }
};

export default Tabs;
