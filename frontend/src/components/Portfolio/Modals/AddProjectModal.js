import React from 'react';
import styles from './styles.module.css';

const AddProjectModal = ({ isOpen, onClose, onAddProject, newProject, setNewProject }) => {
  // Se a modal não estiver aberta, não renderiza nada
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProject(newProject);
    setNewProject({ projectTitle: '', description: '', completionDate: '', status: 'in progress' }); // Limpa o formulário após o envio
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add New Project</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Project Title:
            <input
              type="text"
              placeholder="Enter project title"
              value={newProject.projectTitle}
              onChange={(e) =>
                setNewProject({ ...newProject, projectTitle: e.target.value })
              }
              className={styles.input}
              required
            />
          </label>

          <label>
            Description:
            <textarea
              placeholder="Enter project description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className={styles.input}
              required
            />
          </label>

          <label>
            Completion Date:
            <input
              type="date"
              value={newProject.completionDate}
              onChange={(e) =>
                setNewProject({ ...newProject, completionDate: e.target.value })
              }
              className={styles.input}
              required
            />
          </label>

          <label>
            Status:
            <select
              value={newProject.status || 'in progress'}
              onChange={(e) =>
                setNewProject({ ...newProject, status: e.target.value })
              }
              className={styles.select}
              required
            >
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <button type="submit" className={styles.button}>
            Add Project
          </button>
        </form>

        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default AddProjectModal;
