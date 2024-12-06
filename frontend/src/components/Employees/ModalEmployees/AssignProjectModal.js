import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import styles from './styles.module.css';

const AssignProjectModal = ({ isOpen, onClose, employee, onAssignProject, isLoading }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/projects/my-projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const availableProjects = data.filter(project => 
          project.status !== 'completed' && project.status !== 'cancelled'
        );
        setProjects(availableProjects);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao carregar projetos');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !role) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    
    try {
      await onAssignProject(employee._id, selectedProject, role);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao atribuir projeto');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Atribuir Projeto</h2>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.employeeDetails}>
            Atribuindo projeto para: <strong>{employee.userName}</strong>
          </p>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button 
                onClick={() => setError(null)} 
                className={styles.closeAlert}
                aria-label="Fechar mensagem de erro"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="project">Projeto:</label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={isLoading || isLoadingProjects}
                className={styles.select}
              >
                <option value="">Selecione um projeto</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.projectTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Função no Projeto:</label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Desenvolvedor, Designer, etc."
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading || isLoadingProjects}
              >
                {isLoading ? 'Atribuindo...' : 'Atribuir Projeto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectModal;