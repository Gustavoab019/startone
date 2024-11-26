import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, ArrowRight } from 'lucide-react'; // Adicionando ícone de seta
import { useNavigate } from 'react-router-dom'; // Para navegação
import styles from '../Details/styles/projects.module.css';

const RecentProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getProjectStatus = (project) => {
    if (project.status === 'completed') {
      return { text: 'Concluído', className: styles.statusConcluido };
    }
    return { text: 'Em Progresso', className: styles.statusInProgress };
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

      const sortedProjects = data
        .sort((a, b) => new Date(b.completionDate || b.createdAt) - new Date(a.completionDate || a.createdAt))
        .slice(0, 3);

      setProjects(sortedProjects);
      setFetchError(null);
    } catch (error) {
      setFetchError('Erro ao carregar os projetos. Tente novamente mais tarde.');
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleViewMore = () => {
    navigate('/portfolio'); // Navega para a página de portfolio
  };

  if (isLoading) {
    return (
      <div className={styles.recentProjectsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.projectsTitle}>Projetos Recentes</h2>
        </div>
        <div className={styles.loadingContainer}>
          <p>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.recentProjectsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.projectsTitle}>Projetos Recentes</h2>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.recentProjectsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.projectsTitle}>Projetos Recentes</h2>
        <button 
          onClick={handleViewMore}
          className={styles.viewMoreButton}
        >
          Ver mais
          <ArrowRight size={16} />
        </button>
      </div>
      
      {projects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {projects.map((project) => {
            const status = getProjectStatus(project);
            
            return (
              <div key={project._id} className={styles.projectCard}>
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.projectTitle}
                    className={styles.projectImage}
                  />
                )}
                <h3 className={styles.projectTitle}>{project.projectTitle}</h3>
                <p className={styles.projectDescription}>
                  {project.description?.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description}
                </p>
                <div className={styles.projectMeta}>
                  <span className={styles.projectDate}>
                    <CalendarIcon size={16} />
                    {formatDate(project.completionDate || project.createdAt)}
                  </span>
                  <span className={`${styles.statusTag} ${status.className}`}>
                    {status.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.noProjects}>Sem projetos recentes disponíveis.</p>
      )}
    </div>
  );
};

export default RecentProjects;