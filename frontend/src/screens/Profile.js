import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    type: '',
    specialties: [],
    experienceYears: 0,
    certifications: [],
    portfolio: [],
    location: '',
    companyDetails: {
      companyName: '',
      location: '',
      services: []
    },
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [certificationMessage, setCertificationMessage] = useState('');
  const [projectMessage, setProjectMessage] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  const [newCertification, setNewCertification] = useState({
    name: '',
    institution: '',
    dateObtained: ''
  });

  const [newProject, setNewProject] = useState({
    projectTitle: '',
    description: '',
    completionDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para buscar o perfil atualizado
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(data);
    } catch (error) {
      setError('Failed to fetch profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value
    }));
  };

  const handleCertificationChange = (e) => {
    const { name, value } = e.target;
    setNewCertification((prevCert) => ({
      ...prevCert,
      [name]: value
    }));
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevProject) => ({
      ...prevProject,
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
      // Recarrega o perfil para refletir as novas certificações
      await fetchProfile();
      setNewCertification({ name: '', institution: '', dateObtained: '' });
    } catch (error) {
      setCertificationMessage('Error adding certification.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newCertification, fetchProfile]);

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
      // Recarrega o perfil para refletir o novo projeto
      await fetchProfile();
      setNewProject({ projectTitle: '', description: '', completionDate: '' });
    } catch (error) {
      setProjectMessage('Error adding project.');
    } finally {
      setIsSubmitting(false);
    }
  }, [newProject, fetchProfile]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form onSubmit={(e) => e.preventDefault()}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={profile.name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleInputChange}
        />

        {updateMessage && <p className="message">{updateMessage}</p>}

        {/* Certificações */}
        <h3>Certifications</h3>
        {profile.certifications?.length > 0 ? (
          profile.certifications.map((cert, index) => {
            const validDate = cert?.dateObtained ? new Date(cert.dateObtained) : null;
            const formattedDate = validDate && !isNaN(validDate) ? validDate.toLocaleDateString() : 'Invalid Date';

            return (
              <div key={index}>
                <p>{cert?.name || 'Unnamed'} - {cert?.institution || 'Unknown Institution'} (Obtained on: {formattedDate})</p>
              </div>
            );
          })
        ) : (
          <p>No certifications added.</p>
        )}

        <h4>Add New Certification</h4>
        {certificationMessage && <p className="message">{certificationMessage}</p>}
        <input
          type="text"
          name="name"
          placeholder="Certification Name"
          value={newCertification.name}
          onChange={handleCertificationChange}
        />
        <input
          type="text"
          name="institution"
          placeholder="Institution"
          value={newCertification.institution}
          onChange={handleCertificationChange}
        />
        <input
          type="date"
          name="dateObtained"
          value={newCertification.dateObtained}
          onChange={handleCertificationChange}
        />
        <button type="button" onClick={addCertification} disabled={isSubmitting}>Add Certification</button>

        {/* Portfólio */}
        <h3>Portfolio</h3>
        {profile.portfolio?.length > 0 ? (
          profile.portfolio.map((project, index) => {
            const validDate = project?.completionDate ? new Date(project.completionDate) : null;
            const formattedDate = validDate && !isNaN(validDate) ? validDate.toLocaleDateString() : 'Invalid Date';

            return (
              <div key={index}>
                <p>{project?.projectTitle || 'Untitled'} - {project?.description || 'No description'}</p>
                <p>Completed on: {formattedDate}</p>
              </div>
            );
          })
        ) : (
          <p>No projects added.</p>
        )}

        <h4>Add New Project</h4>
        {projectMessage && <p className="message">{projectMessage}</p>}
        <input
          type="text"
          name="projectTitle"
          placeholder="Project Title"
          value={newProject.projectTitle}
          onChange={handleProjectChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newProject.description}
          onChange={handleProjectChange}
        />
        <input
          type="date"
          name="completionDate"
          value={newProject.completionDate}
          onChange={handleProjectChange}
        />
        <button type="button" onClick={addProject} disabled={isSubmitting}>Add Project</button>

        {/* Alteração de senha */}
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={profile.password || ''} // Verifica se o valor é 'undefined' e atribui uma string vazia
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={profile.confirmPassword || ''} // Verifica se o valor é 'undefined' e atribui uma string vazia
            onChange={handleInputChange}
          />
        <button type="button" onClick={updateProfile} disabled={isSubmitting}>Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
