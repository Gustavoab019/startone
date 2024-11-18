import React, { useState } from 'react';
import styles from './styles.module.css';

const CertificationsSection = ({ profile }) => {
  const [localCertifications, setLocalCertifications] = useState(profile.certifications || []);
  const [newCertification, setNewCertification] = useState({
    name: '',
    institution: '',
    dateObtained: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
        setErrorMessage(null);
      } else {
        setErrorMessage(result.message || 'Failed to add certification.');
        setSuccessMessage(null);
      }
    } catch (error) {
      setErrorMessage('An error occurred while adding the certification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Certifications</h3>
      <div className={styles.cardsContainer}>
        {localCertifications.length > 0 ? (
          localCertifications.map((cert, index) => (
            <div key={index} className={styles.card}>
              <h4 className={styles.cardTitle}>{cert.name}</h4>
              <p className={styles.cardText}>Institution: {cert.institution}</p>
              <p className={styles.cardText}>
                Date: {new Date(cert.dateObtained).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No certifications added.</p>
        )}
      </div>
      <h4 className={styles.subtitle}>Add New Certification</h4>
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      <input
        type="text"
        name="name"
        placeholder="Certification Name"
        value={newCertification.name}
        onChange={handleCertificationChange}
        className={styles.input}
      />
      <input
        type="text"
        name="institution"
        placeholder="Institution"
        value={newCertification.institution}
        onChange={handleCertificationChange}
        className={styles.input}
      />
      <input
        type="date"
        name="dateObtained"
        value={newCertification.dateObtained}
        onChange={handleCertificationChange}
        className={styles.input}
      />
      <button 
        type="button" 
        onClick={handleAddCertification} 
        disabled={isSubmitting} 
        className={styles.button}
      >
        {isSubmitting ? 'Submitting...' : 'Add Certification'}
      </button>
    </div>
  );
};

export default CertificationsSection;