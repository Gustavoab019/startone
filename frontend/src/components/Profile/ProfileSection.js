import React, { useState } from 'react';
import { useProfileData } from './hooks/useProfileData';
import { useProjects } from './hooks/useProjects';
import Tabs from './Tabs/Tabs';
import ProfessionalHeader from './Header/ProfessionalHeader';
import CompanyHeader from './Header/CompanyHeader';
import ToastContainer from './Toasts/ToastContainer';
import EditProfileModal from './Modals/EditProfileModal';
import FollowersModal from './Modals/FollowersModal';
import styles from './styles.module.css';

const ProfileSection = () => {
  const { profile } = useProfileData();
  const { recentProjects, projectsCount } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);

  const startEditing = () => setIsEditing(true);
  const closeEditing = () => setIsEditing(false);

  const openFollowersModal = () => setIsFollowersModalOpen(true);
  const closeFollowersModal = () => setIsFollowersModalOpen(false);

  const renderHeader = () => {
    if (profile?.type === 'company') {
      return (
        <CompanyHeader
          profile={{ ...profile, projectsCount }}
          onEdit={startEditing}
          onShowFollowers={openFollowersModal}
        />
      );
    }

    return (
      <ProfessionalHeader
        profile={{ ...profile, projectsCount }}
        onEdit={startEditing}
        onShowFollowers={openFollowersModal}
      />
    );
  };

  return (
    <div className={styles.container}>
      <ToastContainer />

      {profile && renderHeader()}

      <Tabs activeTab="info" profile={profile} recentProjects={recentProjects} />

      {isEditing && (
        <EditProfileModal
          profile={profile}
          onClose={closeEditing}
        />
      )}

      {isFollowersModalOpen && (
        <FollowersModal
          followers={profile?.followers || []}
          onClose={closeFollowersModal}
        />
      )}
    </div>
  );
};

export default ProfileSection;
