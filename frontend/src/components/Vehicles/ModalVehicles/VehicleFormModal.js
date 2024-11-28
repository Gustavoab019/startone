import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const VEHICLE_TYPES = {
  TRUCK: "Caminhão",
  VAN: "Van",
  CAR: "Carro"
};

const VEHICLE_STATUS = {
  AVAILABLE: "Disponível",
  UNAVAILABLE: "Indisponível",
  MAINTENANCE: "Manutenção"
};

const VehicleFormModal = ({ isOpen, onClose, onVehicleAdded, isProcessing }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: VEHICLE_TYPES.TRUCK,
    capacity: '',
    plate: '',
    nextMaintenanceDate: '',
    availabilityStatus: VEHICLE_STATUS.AVAILABLE,
    additionalNotes: ''
  });
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!formData.plate.match(/^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/)) {
      setError('Formato de placa inválido');
      return false;
    }
    if (formData.capacity <= 0) {
      setError('Capacidade deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      await onVehicleAdded(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao adicionar veículo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Adicionar Veículo</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isProcessing}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={isProcessing}
            >
              {Object.values(VEHICLE_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Capacidade (kg)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              min="1"
              disabled={isProcessing}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Placa</label>
            <input
              type="text"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              placeholder="ABC1D23"
              disabled={isProcessing}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Próxima Manutenção</label>
            <input
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              disabled={isProcessing}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
              disabled={isProcessing}
            >
              {Object.values(VEHICLE_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Notas Adicionais</label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              disabled={isProcessing}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" disabled={isProcessing}>
              {isProcessing ? "Adicionando..." : "Adicionar Veículo"}
            </button>
            <button type="button" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

VehicleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onVehicleAdded: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

export default VehicleFormModal;