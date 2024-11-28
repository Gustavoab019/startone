// VehicleList.js
import React, { useState } from "react";
import EditVehicleModal from "./ModalVehicles/EditVehicleModal";
import AssignProjectModal from "./ModalVehicles/AssignProjectModal";
import styles from "./styles.module.css";

const VehicleList = ({ 
  vehicles, 
  onUpdateVehicle, 
  onDeleteVehicle, 
  onAssignVehicle, 
  onVehicleStatusChange 
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const handleSaveVehicle = async (updatedVehicle) => {
    try {
      await onUpdateVehicle(updatedVehicle);
      setIsEditModalOpen(false);
      onVehicleStatusChange();
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
    }
  };

  const handleAssignVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  const handleAssignToProject = async (vehicleId, projectId) => {
    try {
      await onAssignVehicle(vehicleId, projectId);
      setIsAssignModalOpen(false);
      onVehicleStatusChange();
    } catch (error) {
      console.error("Erro ao alocar veículo:", error);
    }
  };

  return (
    <div className={styles.vehicleListContainer}>
      <table className={styles.vehicleTable}>
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Status</th>
            <th>Projeto</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.plate}</td>
              <td>{vehicle.availabilityStatus}</td>
              <td>{vehicle.projectAssociated?.name || "N/A"}</td>
              <td>
                <button onClick={() => handleEditVehicle(vehicle)}>Editar</button>
                <button onClick={() => handleAssignVehicle(vehicle)}>
                  Atribuir a Projeto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen && (
        <EditVehicleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          vehicle={selectedVehicle}
          onSave={handleSaveVehicle}
        />
      )}

      {isAssignModalOpen && (
        <AssignProjectModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          vehicleId={selectedVehicle._id}
          onAssign={handleAssignToProject}
        />
      )}
    </div>
  );
};

export default VehicleList;