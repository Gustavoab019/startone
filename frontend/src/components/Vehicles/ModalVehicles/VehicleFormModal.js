import React, { useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const VehicleFormModal = ({ isOpen, onClose, onVehicleAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Caminhão',
    capacity: '',
    plate: '',
    nextMaintenanceDate: '',
    availabilityStatus: 'Disponível',
    additionalNotes: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Obtendo o token do localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('Usuário não autenticado. Token não encontrado.');
        return;
      }

      // Configurando o cabeçalho Authorization com o token JWT
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Enviando os dados para o backend
      await axios.post('/api/vehicles', formData, config);
      onVehicleAdded(); // Callback para atualizar a lista de veículos após adicionar
      onClose(); // Fecha o modal após a adição bem-sucedida
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Adicionar Veículo</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="Caminhão">Caminhão</option>
              <option value="Van">Van</option>
              <option value="Carro">Carro</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Capacidade (kg)</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Placa</label>
            <input
              type="text"
              name="plate"
              value={formData.plate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Data da Próxima Manutenção</label>
            <input
              type="date"
              name="nextMaintenanceDate"
              value={formData.nextMaintenanceDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              name="availabilityStatus"
              value={formData.availabilityStatus}
              onChange={handleInputChange}
            >
              <option value="Disponível">Disponível</option>
              <option value="Indisponível">Indisponível</option>
              <option value="Manutenção">Manutenção</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Notas Adicionais</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit">Adicionar Veículo</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleFormModal;
