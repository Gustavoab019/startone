import React, { useState } from 'react';
import styles from './styles.module.css';

const EditProjectModal = ({ project, isOpen, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    projectTitle: project.projectTitle || '',
    description: project.description || '',
    status: project.status || '',
    completionDate: project.completionDate
      ? new Date(project.completionDate).toISOString().substr(0, 10)
      : '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Lidar com envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Validação básica
    if (
      !formData.projectTitle ||
      !formData.description ||
      !formData.status ||
      !formData.completionDate
    ) {
      setError('All fields are required.');
      setIsSaving(false);
      return;
    }

    try {
      await onEdit({ ...project, ...formData });
      onClose(); // Fecha o modal após sucesso
    } catch (err) {
      console.error('Error while updating the project:', err);
      setError('Failed to update the project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>Edit Project</h3>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Status:
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="not started">Not Started</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Completion Date:
            <input
              type="date"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              required
            />
          </label>
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
