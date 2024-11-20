import React, { useState } from 'react';
import ProfileHeader from './Header/ProfileHeader';
import ProfileDetailsCard from './Details/ProfileDetailsCard';
import EditProfileModal from './Modals/EditProfileModal';
import FollowersModal from './Modals/FollowersModal';
import ToastContainer from './Toasts/ToastContainer';
import styles from './styles.module.css';
import { toast } from 'react-toastify';

// Importação de novos componentes
import PortfolioSection from '../Portfolio/PortfolioSection';
import EvaluationsSection from '../Evaluations/EvaluationsSection';

const ProfileSection = ({ profile, handleInputChange, updateProfile, isSubmitting, updateMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  // Estado para gerenciar a aba ativa
  const [activeTab, setActiveTab] = useState('info');

  const handleUpdateProfile = async () => {
    try {
      toast.info('Updating profile...', { autoClose: 1500 });
      await updateProfile();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile. Please try again.');
    }
  };

  const fetchFollowers = async () => {
    if (isLoadingFollowers || !profile?.userId) return;

    setIsLoadingFollowers(true);
    try {
      const response = await fetch(`/api/users/${profile.userId}/followers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setFollowers(data.followers);
      setIsFollowersModalOpen(true);
    } catch (error) {
      toast.error('Error fetching followers.');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const startEditing = () => {
    setOriginalProfile({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    ['name', 'username', 'location', 'password', 'confirmPassword'].forEach(field => {
      handleInputChange({ target: { name: field, value: originalProfile[field] } });
    });
    setIsEditing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileDetailsCard profile={profile} />;
      case 'portfolio':
        return <PortfolioSection profile={profile} />;
      case 'evaluations':
        return <EvaluationsSection profile={profile} />;
      default:
        return <ProfileDetailsCard profile={profile} />;
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <ProfileHeader
        profile={profile}
        onEdit={startEditing}
        onShowFollowers={fetchFollowers}
        isLoadingFollowers={isLoadingFollowers}
      />
      
      {/* Navegação entre abas */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'info' ? styles.active : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Informações
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'portfolio' ? styles.active : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfólio
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'evaluations' ? styles.active : ''}`}
          onClick={() => setActiveTab('evaluations')}
        >
          Avaliações
        </button>
      </div>

      {/* Conteúdo da aba ativa */}
      <section className={styles.tabContent}>
        {renderTabContent()}
      </section>

      {isEditing && (
        <EditProfileModal
          profile={profile}
          isSubmitting={isSubmitting}
          handleInputChange={handleInputChange}
          handleUpdate={handleUpdateProfile}
          onCancel={cancelEditing}
        />
      )}
      {isFollowersModalOpen && (
        <FollowersModal
          followers={followers}
          onClose={() => setIsFollowersModalOpen(false)}
        />
      )}
      {updateMessage && <p className={styles.message}>{updateMessage}</p>}
    </div>
  );
};

export default ProfileSection;
