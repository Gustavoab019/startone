import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onEmployeeAdded(professionalEmail);
      setProfessionalEmail('');
      onClose();
    } catch (error) {
      setError(error.message || 'Erro ao vincular profissional.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Adicionar Novo Funcionário</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="professionalEmail">Email do Profissional</label>
            <input
              id="professionalEmail"
              type="email"
              value={professionalEmail}
              onChange={(e) => setProfessionalEmail(e.target.value)}
              placeholder="Digite o Email do profissional"
              required
              disabled={loading}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Vinculando...' : 'Vincular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEmployeeAdded: PropTypes.func.isRequired
};

export default AddEmployeeModal;