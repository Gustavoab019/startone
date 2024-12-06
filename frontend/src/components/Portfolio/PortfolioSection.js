import React, { useState, useEffect, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './Modals/AddProjectModal';
import AddParticipantsModal from './Modals/AddParticipantsModal';
import { ArrowLeft, Plus } from 'lucide-react';
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {location.pathname === '/portfolio' && (
            <button onClick={handleBack} className={styles.backButton}>
              <ArrowLeft size={20} />
              Voltar
            </button>
          )}
          <h1 className={styles.title}>Projetos</h1>
        </div>
        <button onClick={() => setIsAddProjectModalOpen(true)} className={styles.addButton}>
          <Plus size={20} />
          Adicionar Projeto
        </button>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statsLabel}>Em Andamento</div>
        <div className={styles.statsValue}>{projects.length} projetos</div>
      </div>

      {fetchError && <p className={styles.error}>{fetchError}</p>}
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Funcionários</th>
                <th>Status</th>
                <th>Data Prevista</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  setSelectedProject={setSelectedProject}
                  onEdit={updateProject}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={addProject}
        newProject={newProject}
        setNewProject={setNewProject}
      />

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