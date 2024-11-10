import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/EvaluationsSection.css';

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

        // Fetch evaluations with project participants data
        const evaluationsResponse = await axios.get('/api/evaluations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvaluationsData(evaluationsResponse.data);

        // Fetch category averages
        const averagesResponse = await axios.get('/api/evaluations/averages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategoryAverages(averagesResponse.data.averages);

        const totalCategories = Object.values(averagesResponse.data.averages).reduce((a, b) => a + b, 0);
        const generalAverage = totalCategories / Object.keys(averagesResponse.data.averages).length;
        setAverageRating(generalAverage);

        setError(null);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error loading evaluations';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading evaluations...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="evaluations-section">
      <h3>Professional Evaluations</h3>

      {/* General Average Rating */}
      <div className="average-rating">
        <h4>General Average Rating: {averageRating ? averageRating.toFixed(2) : 'Not rated yet'}</h4>
      </div>

      {/* Category Averages */}
      {categoryAverages && (
        <>
          <h4>Category Averages:</h4>
          {Object.keys(categoryAverages).map((category) => (
            <p key={category}>{category}: {categoryAverages[category].toFixed(2)}</p>
          ))}
        </>
      )}

      {/* Evaluation History */}
      <h4>Evaluation History:</h4>
      {evaluationsData.length > 0 ? (
        <div className="evaluation-cards">
          {evaluationsData.map((evaluation) => (
            <div key={evaluation._id} className="evaluation-card">
              <h5>Project: {evaluation.project?.projectTitle || 'N/A'}</h5>
              <p>Evaluator: {evaluation.evaluator?.name || 'N/A'}</p>
              <p>Feedback: {evaluation.feedback || 'No feedback provided'}</p>

              {/* Categories */}
              <div className="categories">
                {Object.entries(evaluation.categories).map(([category, score]) => (
                  <p key={category}>{category}: {score || 'N/A'}</p>
                ))}
              </div>

              {/* Participants */}
              <div className="participants">
                <h5>Project Participants:</h5>
                {evaluation.project?.participants?.length > 0 ? (
                  evaluation.project.participants.map((participant) => (
                    <p key={participant._id}>{participant.name}</p>
                  ))
                ) : (
                  <p>No participants found.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No evaluations found.</p>
      )}
    </div>
  );
};

export default EvaluationsSection;
