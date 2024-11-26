import React, { useState, useEffect, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './Modals/AddProjectModal';
import AddParticipantsModal from './Modals/AddParticipantsModal';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles.module.css';

const PortfolioSection = ({ onProjectCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddParticipantsModalOpen, setIsAddParticipantsModalOpen] = useState(false);

  // Função para voltar à página anterior
  const handleBack = () => {
    navigate('/profile');
  };

  const fetchProjects = useCallback(async () => {
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

      if (onProjectCount) {
        onProjectCount(data.length);
      }

      setFetchError(null);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [onProjectCount]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error('Failed to add project');
      const data = await response.json();
      setProjects((prev) => [...prev, data]);

      if (onProjectCount) {
        onProjectCount(projects.length + 1);
      }

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

  const updateProject = async (updatedProject) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/projects/${updatedProject._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProject),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData);
        throw new Error('Failed to update project');
      }
  
      const data = await response.json();
      console.log('Project updated successfully:', data);
  
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? data.project : project
        )
      );
      return data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {location.pathname === '/portfolio' && (
          <button 
            onClick={handleBack}
            className={styles.backButton}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
        )}
        <h3 className={styles.title}>Projects</h3>
      </div>

      {fetchError && <p className={styles.error}>{fetchError}</p>}
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className={styles.cardsGrid}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                setSelectedProject={setSelectedProject}
                onEdit={updateProject}
              />
            ))
          ) : (
            <p>No projects added.</p>
          )}
        </div>
      )}

      <button onClick={() => setIsAddProjectModalOpen(true)}>Add New Project</button>
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={addProject}
        newProject={newProject}
        setNewProject={setNewProject}
      />

      <button onClick={() => setIsAddParticipantsModalOpen(true)}>Add Participants to Project</button>
      <AddParticipantsModal
        isOpen={isAddParticipantsModalOpen}
        onClose={() => setIsAddParticipantsModalOpen(false)}
        onAddParticipant={addParticipants}
        participants={participants}
        setParticipants={setParticipants}
        participantMessage={participantMessage}
        isSubmittingParticipants={isSubmittingParticipants}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
    </div>
  );
};

export default PortfolioSection;