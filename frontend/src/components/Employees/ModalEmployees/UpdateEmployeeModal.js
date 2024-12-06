import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

const UpdateEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated }) => {
  const [formData, setFormData] = useState({
    status: employee.status || "Disponível",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      status: employee.status || "Disponível",
    });
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/employee/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: formData.status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar funcionário');
      }

      await onEmployeeUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canChangeStatus = !employee.currentProjectId;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Atualizar Status do Funcionário</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={loading || !canChangeStatus}
            >
              <option value="Disponível">Disponível</option>
              <option value="Férias">Férias</option>
              <option value="Indisponível">Indisponível</option>
            </select>
            
            {!canChangeStatus && (
              <p className={styles.warning}>
                Não é possível alterar o status enquanto o funcionário estiver em um projeto.
              </p>
            )}
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
              disabled={loading || !canChangeStatus}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UpdateEmployeeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    currentProjectId: PropTypes.string
  }).isRequired,
  onEmployeeUpdated: PropTypes.func.isRequired,
};

export default UpdateEmployeeModal;