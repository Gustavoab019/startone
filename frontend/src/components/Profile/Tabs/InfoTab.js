import React from 'react';
import AboutSection from '../Details/AboutSection';
import RecentProjects from '../Details/RecentProjects';
import RecentReviews from '../Details/RecentReviews';
import styles from './styles.module.css';

const InfoTab = ({ profile, recentProjects }) => (
  <div className={styles.infoTab}>
    <AboutSection about={{ bio: profile?.bio }} />
    <RecentProjects projects={recentProjects} />
    <RecentReviews />
  </div>
);

export default InfoTab;
