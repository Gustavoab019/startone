import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const PortfolioTab = ({ onProjectCount }) => {
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/portfolio', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erro ao carregar o portfólio.');

        const data = await response.json();
        setPortfolio(data);
        onProjectCount(data.length);
      } catch (error) {
        console.error('Erro ao carregar o portfólio:', error);
      }
    };

    fetchPortfolio();
  }, [onProjectCount]);

  if (portfolio.length === 0) {
    return <p className={styles.emptyMessage}>Nenhum projeto no portfólio.</p>;
  }

  return (
    <div className={styles.portfolioTab}>
      <h2>Portfólio</h2>
      <ul>
        {portfolio.map((project) => (
          <li key={project.id}>
            <strong>{project.title}</strong> - {project.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioTab;
