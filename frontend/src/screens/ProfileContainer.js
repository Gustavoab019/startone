import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import ProfileSection from './ProfileSection';
import CertificationsSection from './CertificationsSection';
import PortfolioSection from './PortfolioSection';
import EvaluationsSection from './EvaluationsSection';
import RatingsSection from './RatingsSection';
import '../styles/Profile.css';

const ProfileContainer = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialties: [],
    certifications: [],
    portfolio: [],
    password: '',
    confirmPassword: ''
  });

  const [section, setSection] = useState('profile');
  const [certificationMessage, setCertificationMessage] = useState('');
  const [projectMessage, setProjectMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newCertification, setNewCertification] = useState({
    name: '',
    institution: '',
    dateObtained: ''
  });
  const [newProject, setNewProject] = useState({
    projectTitle: '',
    description: '',
    completionDate: ''
  });
  const [error, setError] = useState(null);

  // Função para buscar o perfil atualizado
  const fetchProfile = useCallback(async () => {
    setIsLoading(true); 
    try {
      const { data } = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(data);
      setError(null); 
    } catch (error) {
      setError('Erro ao carregar o perfil');
    } finally {
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Função para lidar com mudanças de input para atualizar o perfil
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value
    }));
  };

  // Função para adicionar certificações
  const handleCertificationChange = (e) => {
    const { name, value } = e.target;
    setNewCertification((prevCert) => ({
      ...prevCert,
      [name]: value
    }));
  };

  const addCertification = useCallback(async () => {
    if (!newCertification.name || !newCertification.institution || !newCertification.dateObtained) {
      setCertificationMessage('Please fill all the certification fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/certifications/add', newCertification, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setCertificationMessage('Certification added successfully!');
      await fetchProfile(); 
      setNewCertification({ name: '', institution: '', dateObtained: '' });
    } catch (error) {
      setCertificationMessage('Error adding certification.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newCertification, fetchProfile]);

  // Função para adicionar projetos
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value
    }));
  };

  const addProject = useCallback(async () => {
    if (!newProject.projectTitle || !newProject.description || !newProject.completionDate) {
      setProjectMessage('Please fill all the project fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('/api/portfolio/add', newProject, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setProjectMessage('Project added successfully!');
      await fetchProfile();
      setNewProject({ projectTitle: '', description: '', completionDate: '' });
    } catch (error) {
      setProjectMessage('Error adding project.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newProject, fetchProfile]);

  // Função para atualizar o perfil
  const updateProfile = useCallback(async () => {
    if (profile.password !== profile.confirmPassword) {
      setUpdateMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put('/api/users/profile', profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUpdateMessage('Profile updated successfully!');
    } catch (error) {
      setUpdateMessage('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  }, [profile]);

  if (isLoading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <Sidebar setSection={setSection} />
      <main className="profile-main-content">
        {section === 'profile' && (
          <ProfileSection
            profile={profile}
            handleInputChange={handleInputChange}
            updateProfile={updateProfile}
            isSubmitting={isSubmitting}
            updateMessage={updateMessage}
          />
        )}

        {section === 'certifications' && (
          <CertificationsSection
            profile={profile}
            certificationMessage={certificationMessage}
            handleCertificationChange={handleCertificationChange}
            addCertification={addCertification}
            newCertification={newCertification}
            isSubmitting={isSubmitting}
          />
        )}

        {section === 'portfolio' && (
          <PortfolioSection
            profile={profile}
            projectMessage={projectMessage}
            handleProjectChange={handleProjectChange}
            addProject={addProject}
            newProject={newProject}
            isSubmitting={isSubmitting}
          />
        )}
        {section === 'evaluations' && <EvaluationsSection />}
        {section === 'ratings' && <RatingsSection />}
      </main>
    </div>
  );
};

export default ProfileContainer;
