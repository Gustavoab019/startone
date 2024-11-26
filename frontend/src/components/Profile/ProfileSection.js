import React, { useState, useEffect, useCallback } from 'react';
import ProfileHeader from './Header/ProfileHeader';
import AboutSection from './Details/AboutSection';
import EditProfileModal from './Modals/EditProfileModal';
import FollowersModal from './Modals/FollowersModal';
import ToastContainer from './Toasts/ToastContainer';
import PortfolioSection from '../Portfolio/PortfolioSection';
import EvaluationsSection from '../Evaluations/EvaluationsSection';
import RecentProjects from '../Profile/Details/RecentProjects';
import RecentReviews from '../Profile/Details/RecentReviews';
import styles from './styles.module.css';
import { toast } from 'react-toastify';

const ProfileSection = ({ handleInputChange, updateProfile, isSubmitting, updateMessage }) => {
  const [profile, setProfile] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [projectsCount, setProjectsCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      
      const sortedProjects = data.sort((a, b) => 
        new Date(b.createdAt || b.completionDate) - new Date(a.createdAt || a.completionDate)
      );
      
      const latestProjects = sortedProjects.slice(0, 3);
      setRecentProjects(latestProjects);
      setProjectsCount(data.length);
      
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar os projetos.');
      return [];
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar os dados do perfil');

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar os dados do perfil:', error);
      toast.error('Erro ao carregar os dados do perfil.');
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProfileData();
      await fetchProjects();
    };

    loadInitialData();
  }, [fetchProfileData, fetchProjects]);

  const handleBioUpdate = async (newBio) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar a bio');

      const data = await response.json();
      setProfile((prevProfile) => ({
        ...prevProfile,
        bio: data.profile.bio,
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
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
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
    ['name', 'username', 'location', 'password', 'confirmPassword'].forEach((field) => {
      handleInputChange({ target: { name: field, value: originalProfile[field] } });
    });
    setIsEditing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <>
            <AboutSection 
              about={{ bio: profile?.bio }} 
              onBioUpdate={handleBioUpdate} 
            />
            <div className={styles.infoContent}>
              {recentProjects.length > 0 ? (
                <RecentProjects projects={recentProjects} />
              ) : (
                <p className={styles.noProjects}>Sem projetos recentes.</p>
              )}
              <RecentReviews />
            </div>
          </>
        );
      case 'portfolio':
        return <PortfolioSection onProjectCount={setProjectsCount} />;
      case 'evaluations':
        return <EvaluationsSection profile={profile} />;
      default:
        return <AboutSection about={{ bio: profile?.bio }} onBioUpdate={handleBioUpdate} />;
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

      <section className={styles.tabContent}>
        {profile && renderTabContent()}
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

      {updateMessage && (
        <p className={styles.message}>{updateMessage}</p>
      )}
    </div>
  );
};

export default ProfileSection;