import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from '../Details/styles/review.module.css';

const RecentReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateAverageScore = (categories) => {
    const scores = [
      categories.qualityOfWork,
      categories.punctuality,
      categories.communication,
      categories.safety,
      categories.problemSolving,
    ];
    
    const average = scores.reduce((acc, curr) => acc + curr, 0) / scores.length;
    return average.toFixed(1);
  };

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/evaluations', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Falha ao carregar avaliações');

      const data = await response.json();
      const recentReviews = data.slice(0, 3); // Apenas as 3 mais recentes
      setReviews(recentReviews);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError('Não foi possível carregar as avaliações recentes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleViewAll = () => {
    navigate('/evaluations'); // Navega para a página com todas as avaliações
  };

  return (
    <div className={styles.recentReviewsSection}>
      {/* Header da seção com título e botão */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Avaliações Recentes</h2>
        <button onClick={handleViewAll} className={styles.viewMoreButton}>
          Ver mais
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Conteúdo da seção */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Carregando avaliações...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className={styles.reviewsGrid}>
          {reviews.map((review) => (
            <div key={review._id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <h3 className={styles.reviewedName}>{review.evaluated.name}</h3>
                <span
                  className={`${styles.reviewScore} ${
                    calculateAverageScore(review.categories) >= 8
                      ? styles.scoreHigh
                      : calculateAverageScore(review.categories) >= 5
                      ? styles.scoreMedium
                      : styles.scoreLow
                  }`}
                >
                  {calculateAverageScore(review.categories)}
                </span>
              </div>
              
              <p className={styles.reviewFeedback}>
                {review.feedback || 'Sem feedback adicional.'}
              </p>

              <div className={styles.reviewMeta}>
                <span className={styles.reviewDate}>
                  <CalendarIcon size={16} />
                  {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className={styles.reviewerName}>
                  <User size={16} />
                  {review.evaluator.name || 'Anônimo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noReviews}>Nenhuma avaliação recente encontrada.</p>
      )}
    </div>
  );
};

export default RecentReviews;
