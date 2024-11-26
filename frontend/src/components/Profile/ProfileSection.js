import React, { useState } from 'react';
import ProfileHeader from './Header/ProfileHeader';
import AboutSection from './Details/AboutSection';
import EditProfileModal from './Modals/EditProfileModal';
import FollowersModal from './Modals/FollowersModal';
import ToastContainer from './Toasts/ToastContainer';
import PortfolioSection from '../Portfolio/PortfolioSection';
import EvaluationsSection from '../Evaluations/EvaluationsSection';
import styles from './styles.module.css';
import { toast } from 'react-toastify';

const ProfileSection = ({ profile: initialProfile, handleInputChange, updateProfile, isSubmitting, updateMessage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [projectsCount, setProjectsCount] = useState(0);
  
  // Novo estado para gerenciar o perfil localmente
  const [profile, setProfile] = useState(initialProfile);

  // Função para atualizar a bio no perfil
  const handleBioUpdate = async (newBio) => {
    try {
      const response = await fetch('/api/users/profile/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar a bio');

      const data = await response.json();
      
      // Atualiza o perfil local com a nova bio
      setProfile(prevProfile => ({
        ...prevProfile,
        bio: data.profile.bio
      }));

      toast.success('Bio atualizada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar a bio:', error);
      toast.error('Erro ao atualizar a bio. Tente novamente.');
      return false;
    }
  };

  const handleUpdateProfile = async () => {
    try {
      toast.info('Atualizando perfil...', { autoClose: 1500 });
      await updateProfile();
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil. Tente novamente.');
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
      toast.error('Erro ao carregar seguidores.');
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
        return (
          <AboutSection 
            about={{ bio: profile.bio }} 
            onBioUpdate={handleBioUpdate}
          />
        );
      case 'portfolio':
        return <PortfolioSection onProjectCount={setProjectsCount} />;
      case 'evaluations':
        return <EvaluationsSection profile={profile} />;
      default:
        return <AboutSection about={{ bio: profile.bio }} onBioUpdate={handleBioUpdate} />;
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <ProfileHeader
        profile={{
          ...profile,
          projectsCount,
        }}
        onEdit={startEditing}
        onShowFollowers={fetchFollowers}
        isLoadingFollowers={isLoadingFollowers}
      />

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

      <section className={styles.tabContent}>{renderTabContent()}</section>

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