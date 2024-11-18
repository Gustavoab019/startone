import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EvaluationForm = () => {
  const { id: userId } = useParams();  // Captura o userId da URL
  const navigate = useNavigate();

  const [categories, setCategories] = useState({
    qualityOfWork: '',
    punctuality: '',
    communication: '',
    safety: '',
    problemSolving: ''
  });
  const [feedback, setFeedback] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Função para buscar os projetos do usuário
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Nenhum token de autenticação encontrado.');
        }

        // Log do userId para garantir que está correto
        console.log(`Buscando projetos para o userId: ${userId}`);

        const response = await fetch(`http://localhost:5000/api/projects/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Falha ao buscar projetos: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Projetos retornados:', result);  // Log dos projetos retornados

        setProjects(result.length ? result : []);
        setFetchError(result.length ? null : 'Nenhum projeto encontrado para este usuário.');
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);  // Log do erro
        setFetchError(error.message);
        if (error.message.includes('token')) navigate('/login'); // Redireciona se o token for inválido
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [userId, navigate]);

  // Manipulador de mudanças nos campos de avaliação
  const handleChange = (e) => {
    setCategories({ ...categories, [e.target.name]: e.target.value });
  };

  // Manipulador da submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    // Verificação se o projeto foi selecionado
    if (!selectedProject) {
      setSubmitError('Por favor, selecione um projeto para avaliar.');
      return;
    }

    // Validação dos valores de avaliação (1 a 10)
    const valuesValid = Object.values(categories).every(val => val >= 1 && val <= 10);
    if (!valuesValid) {
      setSubmitError('Cada categoria de avaliação deve estar entre 1 e 10.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Nenhum token de autenticação encontrado.');

      // Log para verificar o envio correto do userId
      console.log(`Enviando avaliação para o userId: ${userId}`);

      const response = await fetch('http://localhost:5000/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          evaluated: userId,  // O userId capturado da URL está sendo enviado corretamente
          project: selectedProject,  // Projeto selecionado
          categories,
          feedback,
        }),
      });

      if (response.ok) {
        setSubmitSuccess('Avaliação enviada com sucesso!');
        setFeedback('');
        setCategories({
          qualityOfWork: '',
          punctuality: '',
          communication: '',
          safety: '',
          problemSolving: ''
        });
        setSelectedProject('');
      } else {
        const data = await response.json();
        setSubmitError(data.message || 'Erro ao enviar avaliação.');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);  // Log do erro de envio
      setSubmitError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Avaliar Usuário</h2>

      {isLoading ? (
        <p>Carregando projetos...</p>
      ) : fetchError ? (
        <p className="error-message" aria-live="polite">{fetchError}</p>
      ) : (
        <div>
          <label>Selecione um Projeto</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
          >
            <option value="">-- Selecione um Projeto --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Campos de avaliação */}
      {['qualityOfWork', 'punctuality', 'communication', 'safety', 'problemSolving'].map((field) => (
        <div key={field}>
          <label>{field}</label>
          <input
            type="number"
            name={field}
            value={categories[field]}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />
        </div>
      ))}

      <div>
        <label>Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <button type="submit" disabled={!selectedProject || isLoading}>
        Enviar Avaliação
      </button>

      {submitError && <p className="error-message" aria-live="polite">{submitError}</p>}
      {submitSuccess && <p className="success-message" aria-live="polite">{submitSuccess}</p>}
    </form>
  );
};

export default EvaluationForm;
