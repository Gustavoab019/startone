import React, { useState } from 'react';
import axios from 'axios';
import VehicleSummary from '../Vehicles/VehicleSummary';
import VehicleFormModal from '../Vehicles/ModalVehicles/VehicleFormModal';
import VehicleList from '../Vehicles/VehicleList';
import styles from './styles.module.css';

const DashboardVehicles = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null); // Estado para gerenciar qual veículo editar

  // Função para abrir o modal de adicionar veículo
  const handleAddVehicle = () => {
    setVehicleToEdit(null); // Reseta o veículo a ser editado
    setShowAddModal(true); // Abre o modal
  };

  // Função para abrir o modal de edição
  const handleEditVehicle = (vehicle) => {
    setVehicleToEdit(vehicle); // Define o veículo a ser editado
    setShowAddModal(true); // Abre o modal
  };

  // Função para remover um veículo
  const handleDeleteVehicle = async (vehicleId) => {
    const confirm = window.confirm('Tem certeza que deseja remover este veículo?');
    if (!confirm) return;

    try {
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

      // Faz a requisição para remover o veículo
      await axios.delete(`/api/vehicles/${vehicleId}`, config);
      window.location.reload(); // Atualiza a página após remover o veículo
    } catch (error) {
      console.error('Erro ao remover veículo:', error);
    }
  };

  // Função para alocar o veículo a um projeto
  const handleAssignVehicle = (vehicle) => {
    console.log('Alocar veículo a projeto:', vehicle);
    // Aqui podemos abrir um modal para selecionar o projeto ou implementar outra lógica
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Gerenciamento de Veículos</h1>
      <p>Gerencie sua frota e alocações em projetos</p>

      <VehicleSummary />

      <div className={styles.addVehicleButton}>
        <button onClick={handleAddVehicle}>+ Adicionar Veículo</button>
      </div>

      <VehicleList
        onEditVehicle={handleEditVehicle}
        onDeleteVehicle={handleDeleteVehicle}
        onAssignVehicle={handleAssignVehicle}
      />

      {showAddModal && (
        <VehicleFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onVehicleAdded={() => window.location.reload()} // Atualiza a página após adicionar veículo
          vehicle={vehicleToEdit} // Passa o veículo a ser editado para o modal
        />
      )}
    </div>
  );
};

export default DashboardVehicles;

