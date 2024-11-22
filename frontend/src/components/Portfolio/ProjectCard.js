import React from 'react';
import styles from './styles.module.css';

const ProjectCard = ({ project }) => {
  // Função para formatar a data
  const formatDate = (date) => {
    if (!date) return 'No date provided'; // Garante que o valor seja tratado caso seja null ou undefined
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  // Adiciona a classe de status de acordo com o valor do status
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
    </div>
  );
};

export default ProjectCard;
