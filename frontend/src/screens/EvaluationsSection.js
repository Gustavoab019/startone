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
    const fetchEvaluations = async () => {
      try {
        setLoading(true);

        // Requisição para obter as avaliações do usuário autenticado
        const evaluationsResponse = await axios.get('/api/evaluations', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEvaluationsData(evaluationsResponse.data);

        // Requisição para obter as médias por categoria do usuário autenticado
        const averagesResponse = await axios.get('/api/evaluations/averages', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCategoryAverages(averagesResponse.data.averages);

        const totalCategories = Object.values(averagesResponse.data.averages).reduce((a, b) => a + b, 0);
        const generalAverage = totalCategories / Object.keys(averagesResponse.data.averages).length;
        setAverageRating(generalAverage);

        setError(null);
        setLoading(false);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erro ao carregar as avaliações';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []); // Executa o efeito apenas uma vez ao montar o componente

  if (loading) {
    return <p>Loading evaluations...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="evaluations-section">
      <h3>Professional Evaluations</h3>

      {/* Exibe a média geral */}
      <div className="average-rating">
        <h4>General Average Rating: {averageRating ? averageRating.toFixed(2) : 'Not rated yet'}</h4>
      </div>

      {/* Exibe as médias por categoria */}
      {categoryAverages && (
        <>
          <h4>Category Averages:</h4>
          <p>Quality of Work: {categoryAverages.qualityOfWork.toFixed(2)}</p>
          <p>Punctuality: {categoryAverages.punctuality.toFixed(2)}</p>
          <p>Communication: {categoryAverages.communication.toFixed(2)}</p>
          <p>Safety: {categoryAverages.safety.toFixed(2)}</p>
          <p>Problem Solving: {categoryAverages.problemSolving.toFixed(2)}</p>
        </>
      )}

      {/* Histórico de avaliações */}
      <h4>Evaluation History:</h4>
      {evaluationsData.length > 0 ? (
        <div className="evaluation-cards">
          {evaluationsData.map((evaluation, index) => (
            <div key={index} className="evaluation-card">
              <h5>Project: {evaluation.project?.projectTitle || 'N/A'}</h5>
              <p>Evaluator: {evaluation.evaluator?.name || 'N/A'}</p>
              <p>Feedback: {evaluation.feedback || 'No feedback provided'}</p>

              <div className="categories">
                <p>Quality of Work: {evaluation.categories.qualityOfWork || 'N/A'}</p>
                <p>Punctuality: {evaluation.categories.punctuality || 'N/A'}</p>
                <p>Communication: {evaluation.categories.communication || 'N/A'}</p>
                <p>Safety: {evaluation.categories.safety || 'N/A'}</p>
                <p>Problem Solving: {evaluation.categories.problemSolving || 'N/A'}</p>
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