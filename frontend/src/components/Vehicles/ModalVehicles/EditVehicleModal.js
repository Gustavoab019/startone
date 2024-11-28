import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

const EditVehicleModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    plate: "",
    availabilityStatus: "",
    nextMaintenanceDate: "",
  });

  // Preenche os dados do veículo ao abrir a modal
  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || "",
        plate: vehicle.plate || "",
        availabilityStatus: vehicle.availabilityStatus || "",
        nextMaintenanceDate: vehicle.nextMaintenanceDate
          ? new Date(vehicle.nextMaintenanceDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [vehicle]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...vehicle, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Editar Veículo</h2>
        <form onSubmit={handleSubmit}>
          {/* Nome e Placa como somente leitura */}
          <label>
            Nome do Veículo:
            <input
              type="text"
              name="name"
              value={formData.name}
              readOnly
              className={styles.readOnlyField}
            />
          </label>
          <label>
            Placa:
            <input
              type="text"
              name="plate"
              value={formData.plate}
              readOnly
              className={styles.readOnlyField}
            />
          </label>

          {/* Status e Data de Manutenção como editáveis */}
          <label>
            Status:
            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Disponível">Disponível</option>
              <option value="Indisponível">Em Uso</option>
              <option value="Manutenção">Em Manutenção</option>
            </select>
          </label>
          <label>
            Próxima Manutenção:
            <input
              type="date"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleInputChange}
            />
          </label>
          <div className={styles.modalActions}>
            <button type="submit">Salvar</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;
