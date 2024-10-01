import React, { useState } from 'react';

const CertificationsSection = ({ profile }) => {
  const [localCertifications, setLocalCertifications] = useState(profile.certifications || []);
  const [newCertification, setNewCertification] = useState({
    name: '',
    institution: '',
    dateObtained: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);  // Mensagens de erro
  const [successMessage, setSuccessMessage] = useState(null);  // Mensagens de sucesso

  const handleCertificationChange = (event) => {
    const { name, value } = event.target;
    setNewCertification(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddCertification = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/certifications/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCertification),
      });

      const result = await response.json();

      if (response.ok) {
        setLocalCertifications([...localCertifications, newCertification]);
        setNewCertification({ name: '', institution: '', dateObtained: '' });
        setSuccessMessage(result.message);
        setErrorMessage(null); // Remove qualquer erro anterior
      } else {
        setErrorMessage(result.message || 'Failed to add certification.');
        setSuccessMessage(null); // Remove mensagens de sucesso se houver erro
      }
    } catch (error) {
      setErrorMessage('An error occurred while adding the certification.');
    } finally {
      setIsSubmitting(false); // Envio concluído
    }
  };

  return (
    <div className="profile-section">
      <h3>Certifications</h3>
      <div className="certification-cards">
        {localCertifications.length > 0 ? (
          localCertifications.map((cert, index) => (
            <div key={index} className="certification-card">
              <h4>{cert.name}</h4>
              <p>Institution: {cert.institution}</p>
              <p>Date: {new Date(cert.dateObtained).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No certifications added.</p>
        )}
      </div>
      <h4>Add New Certification</h4>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Exibe mensagem de erro */}
      <input
        type="text"
        name="name"
        placeholder="Certification Name"
        value={newCertification.name}
        onChange={handleCertificationChange}
      />
      <input
        type="text"
        name="institution"
        placeholder="Institution"
        value={newCertification.institution}
        onChange={handleCertificationChange}
      />
      <input
        type="date"
        name="dateObtained"
        value={newCertification.dateObtained}
        onChange={handleCertificationChange}
      />
      <button 
        type="button" 
        onClick={handleAddCertification} 
        disabled={isSubmitting} 
        className="action-button"
      >
        {isSubmitting ? 'Submitting...' : 'Add Certification'}
      </button>
    </div>
  );
};

export default CertificationsSection;
