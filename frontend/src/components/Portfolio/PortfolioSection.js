import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const ProjectCard = ({ project }) => (
  <div className={styles.card}>
    <h4 className={styles.cardTitle}>{project.projectTitle}</h4>
    <p className={styles.cardText}>{project.description}</p>
    <p className={styles.cardText}>
      Completion Date: {new Date(project.completionDate).toLocaleDateString()}
    </p>
  </div>
);

const ProjectForm = ({ projectMessage, handleProjectChange, newProject, isSubmitting, addProject }) => (
  <>
    {projectMessage && <p className={styles.success}>{projectMessage}</p>}
    <input
      type="text"
      name="projectTitle"
      placeholder="Project Title"
      value={newProject.projectTitle}
      onChange={handleProjectChange}
      className={styles.input}
    />
    <input
      type="text"
      name="description"
      placeholder="Description"
      value={newProject.description}
      onChange={handleProjectChange}
      className={styles.input}
    />
    <input
      type="date"
      name="completionDate"
      value={newProject.completionDate}
      onChange={handleProjectChange}
      className={styles.input}
    />
    <button onClick={addProject} disabled={isSubmitting} className={styles.button}>
      {isSubmitting ? 'Submitting...' : 'Add Project'}
    </button>
  </>
);

const ParticipantForm = ({ 
  projects, 
  selectedProject, 
  setSelectedProject, 
  participants, 
  setParticipants, 
  participantMessage, 
  addParticipants, 
  isSubmittingParticipants 
}) => (
  <>
    <select 
      value={selectedProject} 
      onChange={(e) => setSelectedProject(e.target.value)} 
      className={styles.select}
    >
      <option value="">Select Project</option>
      {projects.map(project => (
        <option key={project._id} value={project._id}>
          {project.projectTitle}
        </option>
      ))}
    </select>
    <input
      type="text"
      placeholder="Professional IDs (comma-separated)"
      value={participants.professionals}
      onChange={(e) => setParticipants({ ...participants, professionals: e.target.value })}
      className={styles.input}
    />
    <input
      type="text"
      placeholder="Client IDs (comma-separated)"
      value={participants.clients}
      onChange={(e) => setParticipants({ ...participants, clients: e.target.value })}
      className={styles.input}
    />
    <button 
      onClick={addParticipants} 
      disabled={!selectedProject || isSubmittingParticipants} 
      className={styles.button}
    >
      {isSubmittingParticipants ? 'Adding...' : 'Add Participants'}
    </button>
    {participantMessage && <p className={styles.success}>{participantMessage}</p>}
  </>
);

const PortfolioSection = ({ projectMessage, handleProjectChange, newProject, isSubmitting }) => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [participants, setParticipants] = useState({ professionals: '', clients: '' });
  const [participantMessage, setParticipantMessage] = useState('');
  const [isSubmittingParticipants, setIsSubmittingParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized - no token');

      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch projects: ${response.statusText}`);

      const data = await response.json();
      setProjects(data);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setFetchError(`Error fetching projects. Details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized - no token');

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) throw new Error('Error adding project');

      const data = await response.json();
      setProjects(prev => [...prev, data]);
      handleProjectChange({ target: { name: 'projectTitle', value: '' } });
      handleProjectChange({ target: { name: 'description', value: '' } });
      handleProjectChange({ target: { name: 'completionDate', value: '' } });
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
      if (!token) throw new Error('Unauthorized - no token');

      const response = await fetch(`http://localhost:5000/api/projects/${selectedProject}/add-participants`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionals: participants.professionals.split(',').map(id => id.trim()),
          clients: participants.clients.split(',').map(id => id.trim()),
        }),
      });

      if (!response.ok) throw new Error('Error adding participants');

      setParticipantMessage('Participants added successfully!');
      setParticipants({ professionals: '', clients: '' });
    } catch (error) {
      setParticipantMessage('Error adding participants');
      console.error('Error:', error);
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
            projects.map(project => <ProjectCard key={project._id} project={project} />)
          ) : (
            <p>No projects added.</p>
          )}
        </div>
      )}

      <h4 className={styles.title}>Add New Project</h4>
      <ProjectForm
        projectMessage={projectMessage}
        handleProjectChange={handleProjectChange}
        newProject={newProject}
        isSubmitting={isSubmitting}
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