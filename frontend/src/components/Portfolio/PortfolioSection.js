import React, { useState, useEffect, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import AddProjectModal from './Modals/AddProjectModal'; // Modal para adicionar projeto
import AddParticipantsModal from './Modals/AddParticipantsModal'; // Modal para adicionar participantes
import styles from './styles.module.css';

const PortfolioSection = ({ onProjectCount }) => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(''); // Seleciona o projeto
  const [participants, setParticipants] = useState({ professionals: '', clients: '' });
  const [participantMessage, setParticipantMessage] = useState('');
  const [isSubmittingParticipants, setIsSubmittingParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    projectTitle: '',
    description: '',
    completionDate: '',
  });

  // Estados para controlar as modais
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddParticipantsModalOpen, setIsAddParticipantsModalOpen] = useState(false);

  // Função para buscar projetos do usuário, agora com useCallback
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

      // Atualiza a quantidade de projetos no componente pai
      if (onProjectCount) {
        onProjectCount(data.length);
      }

      setFetchError(null);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [onProjectCount]); // Incluímos `onProjectCount` como dependência

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Incluímos `fetchProjects` como dependência

  // Função para adicionar um novo projeto
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

      // Atualiza a quantidade de projetos no componente pai
      if (onProjectCount) {
        onProjectCount(projects.length + 1);
      }

      setNewProject({ projectTitle: '', description: '', completionDate: '' });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  // Função para adicionar participantes ao projeto
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

  // Função para atualizar o projeto
  const updateProject = async (updatedProject) => {
    try {
      const token = localStorage.getItem('token'); // Certifique-se de que o token é válido
      const response = await fetch(
        `http://localhost:5000/api/projects/${updatedProject._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProject), // Envia os dados atualizados para a API
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData); // Log da resposta de erro
        throw new Error('Failed to update project');
      }
  
      const data = await response.json();
      console.log('Project updated successfully:', data);
  
      // Atualiza o estado do projeto localmente
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? data.project : project
        )
      );
      return data.project; // Retorna o projeto atualizado
    } catch (error) {
      console.error('Error updating project:', error);
      throw error; // Lança o erro para que o componente `ProjectCard` possa tratá-lo
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
            projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                setSelectedProject={setSelectedProject}
                onEdit={updateProject} // Passa a função de atualização
              />
            ))
          ) : (
            <p>No projects added.</p>
          )}
      </div>

      )}

      <button onClick={() => setIsAddProjectModalOpen(true)}>Add New Project</button>
      {/* Modal para adicionar projeto */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={addProject}
        newProject={newProject}
        setNewProject={setNewProject}
      />

      <button onClick={() => setIsAddParticipantsModalOpen(true)}>Add Participants to Project</button>
      {/* Modal para adicionar participantes */}
      <AddParticipantsModal
        isOpen={isAddParticipantsModalOpen}
        onClose={() => setIsAddParticipantsModalOpen(false)}
        onAddParticipant={addParticipants}
        participants={participants}
        setParticipants={setParticipants}
        participantMessage={participantMessage}
        isSubmittingParticipants={isSubmittingParticipants}
        projects={projects} // Passando a lista de projetos
        selectedProject={selectedProject} // Passando o projeto selecionado
        setSelectedProject={setSelectedProject} // Passando a função para setar o projeto selecionado
      />
    </div>
  );
};

export default PortfolioSection;
