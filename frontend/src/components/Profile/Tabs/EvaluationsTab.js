import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const EvaluationsTab = ({ profile }) => {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${profile.userId}/evaluations`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erro ao carregar avaliações.');

        const data = await response.json();
        setEvaluations(data);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      }
    };

    fetchEvaluations();
  }, [profile.userId]);

  if (evaluations.length === 0) {
    return <p className={styles.emptyMessage}>Nenhuma avaliação disponível.</p>;
  }

  return (
    <div className={styles.evaluationsTab}>
      <h2>Avaliações</h2>
      <ul>
        {evaluations.map((evaluation) => (
          <li key={evaluation.id}>
            <p>
              <strong>{evaluation.reviewerName}</strong>: {evaluation.comment}
            </p>
            <p>Nota: {evaluation.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvaluationsTab;
