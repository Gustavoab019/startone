import React, { useState, useEffect } from 'react';

const PortfolioSection = ({ projectMessage, handleProjectChange: parentHandleProjectChange, newProject, isSubmitting }) => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [participants, setParticipants] = useState({ professionals: '', clients: '' });
  const [participantMessage, setParticipantMessage] = useState('');
  const [isSubmittingParticipants, setIsSubmittingParticipants] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os projetos do usuário
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true); // Inicia o estado de carregamento
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Unauthorized - no token');
        }

        const response = await fetch('http://localhost:5000/api/projects/my-projects', { // Corrigido para usar a porta correta
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        setProjects(data);
        setFetchError(null); // Remove qualquer erro
      } catch (error) {
        console.error('Error fetching projects:', error);
        setFetchError(`Error fetching projects. Please try again. Details: ${error.message}`);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchProjects();
  }, []);

  // Função para resetar os campos do formulário de projeto
  const resetProjectForm = () => {
    parentHandleProjectChange({ target: { name: 'projectTitle', value: '' } });
    parentHandleProjectChange({ target: { name: 'description', value: '' } });
    parentHandleProjectChange({ target: { name: 'completionDate', value: '' } });
  };

  // Função para lidar com a adição de um novo projeto
  const addProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized - no token');
      }

      const response = await fetch('http://localhost:5000/api/projects', { // Corrigido para usar a porta correta
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Error adding project');
      }

      const data = await response.json();
      setProjects((prevProjects) => [...prevProjects, data]); // Adiciona o novo projeto ao estado
      resetProjectForm(); // Limpa os campos do formulário
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  // Função para lidar com a adição de participantes a um projeto
  const addParticipants = async () => {
    if (!participants.professionals && !participants.clients) {
      setParticipantMessage('Please provide at least one professional or client.');
      return;
    }

    setIsSubmittingParticipants(true); // Inicia o estado de submissão
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized - no token');
      }

      const response = await fetch(`http://localhost:5000/api/projects/${selectedProject}/add-participants`, { // Corrigido para usar a porta correta
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionals: participants.professionals.split(',').map(id => id.trim()), // Divide por vírgula e remove espaços
          clients: participants.clients.split(',').map(id => id.trim()), // Divide por vírgula e remove espaços
        }),
      });

      if (!response.ok) {
        throw new Error('Error adding participants');
      }

      setParticipantMessage('Participants added successfully!');
      setParticipants({ professionals: '', clients: '' }); // Limpa os campos após o sucesso
    } catch (error) {
      setParticipantMessage('Error adding participants');
      console.error('Error:', error);
    } finally {
      setIsSubmittingParticipants(false); // Finaliza o estado de submissão
    }
  };

  return (
    <div className="profile-section">
      <h3>Projects</h3>

      {/* Exibe erro ao buscar os projetos */}
      {fetchError && <p className="error-message">{fetchError}</p>}

      {/* Exibe indicador de carregamento enquanto os projetos estão sendo buscados */}
      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="portfolio-cards">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={index} className="portfolio-card">
                <h4>{project.projectTitle}</h4>
                <p>{project.description}</p>
                <p>Completion Date: {new Date(project.completionDate).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No projects added.</p>
          )}
        </div>
      )}

      <h4>Add New Project</h4>
      {projectMessage && <p className="message">{projectMessage}</p>}
      <input
        type="text"
        name="projectTitle"
        placeholder="Project Title"
        value={newProject.projectTitle}
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={newProject.description}
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <input
        type="date"
        name="completionDate"
        value={newProject.completionDate}
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <button type="button" onClick={addProject} disabled={isSubmitting} className="action-button">
        {isSubmitting ? 'Submitting...' : 'Add Project'}
      </button>

      {/* Seção para adicionar participantes */}
      <h4>Add Participants to Project</h4>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="select-field"
      >
        <option value="">Select Project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.projectTitle}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="professionals"
        placeholder="Professional IDs (comma-separated)"
        value={participants.professionals}
        onChange={(e) => setParticipants({ ...participants, professionals: e.target.value })}
        className="input-field"
      />
      <input
        type="text"
        name="clients"
        placeholder="Client IDs (comma-separated)"
        value={participants.clients}
        onChange={(e) => setParticipants({ ...participants, clients: e.target.value })}
        className="input-field"
      />
      <button type="button" onClick={addParticipants} disabled={!selectedProject || isSubmittingParticipants} className="action-button">
        {isSubmittingParticipants ? 'Adding...' : 'Add Participants'}
      </button>

      {participantMessage && <p className="message">{participantMessage}</p>}
    </div>
  );
};

export default PortfolioSection;
