import React, { useState } from 'react';
import EditProjectModal from './Modals/EditProjectModal';
import styles from './styles.module.css';

const ProjectCard = ({ project, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Lidar com a abertura e fechamento do modal
  const openEditModal = () => setIsEditing(true);
  const closeEditModal = () => setIsEditing(false);

  // Formatar a data
  const formatDate = (date) => {
    if (!date) return 'No date provided';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  // Adiciona a classe de status
  const statusClass = project.status
    ? `status-${project.status.replace(' ', '').toLowerCase()}`
    : '';

  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>{project.projectTitle}</h4>
      <p className={styles.cardText}>{project.description}</p>
      <p className={`${styles.cardText} ${styles[statusClass]}`}>
        <strong>Status:</strong> {project.status}
      </p>
      <p className={styles.cardText}>
        <strong>Completion Date:</strong> {formatDate(project.completionDate)}
      </p>
      <button className={styles.editButton} onClick={openEditModal}>
        Edit
      </button>

      {/* Modal separado para edição */}
      <EditProjectModal
        project={project}
        isOpen={isEditing}
        onClose={closeEditModal}
        onEdit={onEdit}
      />
    </div>
  );
};

export default ProjectCard;
