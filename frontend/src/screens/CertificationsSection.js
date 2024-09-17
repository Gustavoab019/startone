import React from 'react';

const CertificationsSection = ({ profile, certificationMessage, handleCertificationChange, addCertification, newCertification, isSubmitting }) => (
  <div className="profile-section">
    <h3>Certifications</h3>
    <div className="certification-cards">
      {profile.certifications?.length > 0 ? (
        profile.certifications.map((cert, index) => (
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
    {certificationMessage && <p className="message">{certificationMessage}</p>}
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
    <button type="button" onClick={addCertification} disabled={isSubmitting} className="action-button">
      Add Certification
    </button>
  </div>
);

export default CertificationsSection;
