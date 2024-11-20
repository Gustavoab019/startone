import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import ProjectForm from './Form/ProjectForm';
import ParticipantForm from './Form/ParticipantForm';
import styles from './styles.module.css';

const PortfolioSection = () => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [participants, setParticipants] = useState({ professionals: '', clients: '' });
  const [participantMessage, setParticipantMessage] = useState('');
  const [isSubmittingParticipants, setIsSubmittingParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    projectTitle: '',
    description: '',
    completionDate: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
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
      setProjects(data);
      setFetchError(null);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });
      if (!response.ok) throw new Error('Failed to add project');
      const data = await response.json();
      setProjects((prev) => [...prev, data]);
      setNewProject({ projectTitle: '', description: '', completionDate: '' });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const addParticipants = async () => {
    if (!participants.professionals && !participants.clients) {
      setParticipantMessage('Please provide at least one professional or client.');
      return;
    }

    setIsSubmittingParticipants(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${selectedProject}/add-participants`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionals: participants.professionals.split(',').map((id) => id.trim()),
          clients: participants.clients.split(',').map((id) => id.trim()),
        }),
      });
      if (!response.ok) throw new Error('Failed to add participants');
      setParticipantMessage('Participants added successfully!');
      setParticipants({ professionals: '', clients: '' });
    } catch (error) {
      setParticipantMessage('Error adding participants');
    } finally {
      setIsSubmittingParticipants(false);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Projects</h3>
      {fetchError && <p className={styles.error}>{fetchError}</p>}
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className={styles.cardsGrid}>
          {projects.length > 0 ? (
            projects.map((project) => <ProjectCard key={project._id} project={project} />)
          ) : (
            <p>No projects added.</p>
          )}
        </div>
      )}

      <h4 className={styles.title}>Add New Project</h4>
      <ProjectForm
        newProject={newProject}
        setNewProject={setNewProject}
        addProject={addProject}
      />

      <h4 className={styles.title}>Add Participants to Project</h4>
      <ParticipantForm
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        participants={participants}
        setParticipants={setParticipants}
        participantMessage={participantMessage}
        addParticipants={addParticipants}
        isSubmittingParticipants={isSubmittingParticipants}
      />
    </div>
  );
};

export default PortfolioSection;
