import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';

const EditProjectModal = ({ project, isOpen, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    projectTitle: project?.projectTitle || '',
    description: project?.description || '',
    status: project?.status || 'not started',
    completionDate: project?.completionDate
      ? new Date(project.completionDate).toISOString().substr(0, 10)
      : '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
  
    try {
      // Validação dos campos
      const requiredFields = {
        projectTitle: 'Título',
        description: 'Descrição',
        status: 'Status',
        completionDate: 'Data de Conclusão'
      };
  
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]?.trim()) {
          throw new Error(`O campo ${label} é obrigatório.`);
        }
      }
  
      // Formatar data corretamente
      const formattedData = {
        ...formData,
        completionDate: new Date(formData.completionDate).toISOString()
      };
  
      await onEdit(project._id, formattedData);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar o projeto:', err);
      setError(err.message || 'Falha ao atualizar o projeto. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Editar Projeto</h3>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Título:
            <input
              type="text"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Descrição:
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
              <option value="not started">Não Iniciado</option>
              <option value="in progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </label>
          <label>
            Data de Conclusão:
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
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProjectModal;