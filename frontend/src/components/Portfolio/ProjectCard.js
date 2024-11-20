import React from 'react';
import styles from './styles.module.css';

const ProjectCard = ({ project }) => {
  // Função para formatar a data
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>{project.projectTitle}</h4>
      <p className={styles.cardText}>{project.description}</p>
      <p className={styles.cardText}>
        <strong>Completion Date:</strong> {formatDate(project.completionDate)}
      </p>
    </div>
  );
};

export default ProjectCard;
