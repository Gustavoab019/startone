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
      
      if (!response.ok) throw new Error('Falha ao carregar projetos');
      
      const data = await response.json();
      setProjects(data);

      if (onProjectCount) {
        onProjectCount(data.length);
      }

      setFetchError(null);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setFetchError('Erro ao carregar projetos. Por favor, tente novamente.');
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

      if (!response.ok) throw new Error('Falha ao adicionar projeto');

      const data = await response.json();
      setProjects((prev) => [...prev, data]);

      if (onProjectCount) {
        onProjectCount(projects.length + 1);
      }

      setNewProject({ projectTitle: '', description: '', completionDate: '' });
      setIsAddProjectModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      setFetchError('Erro ao adicionar projeto. Por favor, tente novamente.');
    }
  };

  const addParticipants = async () => {
    if (!participants.professionals && !participants.clients) {
      setParticipantMessage('Por favor, forneça pelo menos um profissional ou cliente.');
      return;
    }

    setIsSubmittingParticipants(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/projects/${selectedProject}/add-participants`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            professionals: participants.professionals.split(',').map((id) => id.trim()),
            clients: participants.clients.split(',').map((id) => id.trim()),
          }),
        }
      );

      if (!response.ok) throw new Error('Falha ao adicionar participantes');

      setParticipantMessage('Participantes adicionados com sucesso!');
      setParticipants({ professionals: '', clients: '' });
      await fetchProjects(); // Recarrega os projetos para atualizar a lista
    } catch (error) {
      console.error('Erro ao adicionar participantes:', error);
      setParticipantMessage('Erro ao adicionar participantes. Por favor, tente novamente.');
    } finally {
      setIsSubmittingParticipants(false);
    }
  };

  const updateProject = async (projectId, updatedProject) => {
    try {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === projectId ? updatedProject : project
        )
      );
      await fetchProjects(); // Recarrega os projetos para garantir sincronização
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      setFetchError('Erro ao atualizar projeto. Por favor, tente novamente.');
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Falha ao remover projeto');

      setProjects((prev) => prev.filter(project => project._id !== projectId));
      
      if (onProjectCount) {
        onProjectCount(projects.length - 1);
      }
    } catch (error) {
      console.error('Erro ao remover projeto:', error);
      setFetchError('Erro ao remover projeto. Por favor, tente novamente.');
    }
  };

  const createdProjects = projects.filter((p) => p.role === 'Creator');
  const involvedProjects = projects.filter((p) => p.role !== 'Creator');

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

      <div className={styles.statsContainer}>
        <div className={styles.statsCard}>
          <div className={styles.statsLabel}>Criados</div>
          <div className={styles.statsValue}>{createdProjects.length} projetos</div>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statsLabel}>Envolvido</div>
          <div className={styles.statsValue}>{involvedProjects.length} projetos</div>
        </div>
      </div>

      {fetchError && <p className={styles.error}>{fetchError}</p>}
      {participantMessage && <p className={styles.message}>{participantMessage}</p>}
      
      {isLoading ? (
        <p className={styles.loadingText}>Carregando projetos...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Funcionários</th>
                <th>Status</th>
                <th>Data Prevista</th>
                <th>Veículos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  setSelectedProject={setSelectedProject}
                  onUpdateProject={updateProject}
                  onDeleteProject={deleteProject}
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