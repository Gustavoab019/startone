import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

const VEHICLE_STATUS = {
  AVAILABLE: "Disponível",
  UNAVAILABLE: "Indisponível",
  MAINTENANCE: "Manutenção"
};

const EditVehicleModal = ({ isOpen, onClose, vehicle, onSave, isProcessing }) => {
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    availabilityStatus: "",
    nextMaintenanceDate: ""
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || "",
        plate: vehicle.plate || "",
        availabilityStatus: vehicle.availabilityStatus || "",
        nextMaintenanceDate: vehicle.nextMaintenanceDate
          ? new Date(vehicle.nextMaintenanceDate).toISOString().split("T")[0]
          : ""
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nextMaintenanceDate) {
      setError("Data de manutenção é obrigatória");
      return;
    }

    const success = await onSave({ ...vehicle, ...formData });
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Editar Veículo</h2>
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nome do Veículo:</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className={styles.readOnlyField}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Placa:</label>
            <input
              type="text"
              value={formData.plate}
              readOnly
              className={styles.readOnlyField}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status:</label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
              disabled={isProcessing}
              required
            >
              {Object.values(VEHICLE_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Próxima Manutenção:</label>
            <input
              type="date"
              value={formData.nextMaintenanceDate}
              onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
              disabled={isProcessing}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className={styles.modalActions}>
            <button type="submit" disabled={isProcessing}>
              {isProcessing ? "Salvando..." : "Salvar"}
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

EditVehicleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicle: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    plate: PropTypes.string.isRequired,
    availabilityStatus: PropTypes.string.isRequired,
    nextMaintenanceDate: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

export default EditVehicleModal;