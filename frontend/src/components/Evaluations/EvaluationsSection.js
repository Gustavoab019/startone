import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const EvaluationsSection = () => {
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [categoryAverages, setCategoryAverages] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [evaluationsResponse, averagesResponse] = await Promise.all([
          axios.get('/api/evaluations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/evaluations/averages', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setEvaluationsData(evaluationsResponse.data);
        setCategoryAverages(averagesResponse.data.averages);

        const totalCategories = Object.values(averagesResponse.data.averages).reduce((a, b) => a + b, 0);
        const generalAverage = totalCategories / Object.keys(averagesResponse.data.averages).length;
        setAverageRating(generalAverage);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Error loading evaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading evaluations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Professional Evaluations</h3>

      <div className={styles.averageRatingCard}>
        <h4 className={styles.averageRatingTitle}>
          General Average Rating: {averageRating ? averageRating.toFixed(2) : 'Not rated yet'}
        </h4>
      </div>

      {categoryAverages && (
        <>
          <h4 className={styles.subtitle}>Category Averages:</h4>
          {Object.entries(categoryAverages).map(([category, score]) => (
            <p key={category} className={styles.cardText}>
              {category}: {score.toFixed(2)}
            </p>
          ))}
        </>
      )}

      <h4 className={styles.subtitle}>Evaluation History:</h4>
      {evaluationsData.length > 0 ? (
        <div className={styles.cardsGrid}>
          {evaluationsData.map((evaluation) => (
            <div key={evaluation._id} className={styles.card}>
              <h5 className={styles.cardTitle}>
                Project: {evaluation.project?.projectTitle || 'N/A'}
              </h5>
              <p className={styles.cardText}>
                Evaluator: {evaluation.evaluator?.name || 'N/A'}
              </p>
              <p className={styles.cardText}>
                Feedback: {evaluation.feedback || 'No feedback provided'}
              </p>

              <div className={styles.categories}>
                {Object.entries(evaluation.categories).map(([category, score]) => (
                  <p key={category} className={styles.cardText}>
                    {category}: {score || 'N/A'}
                  </p>
                ))}
              </div>

              <div className={styles.participants}>
                <h5 className={styles.participantsTitle}>Project Participants:</h5>
                {evaluation.project?.participants?.length > 0 ? (
                  evaluation.project.participants.map((participant) => (
                    <p key={participant._id} className={styles.cardText}>
                      {participant.name}
                    </p>
                  ))
                ) : (
                  <p className={styles.cardText}>No participants found.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.cardText}>No evaluations found.</p>
      )}
    </div>
  );
};

export default EvaluationsSection;