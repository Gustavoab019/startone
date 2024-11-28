import React, { useState } from "react";
import PropTypes from "prop-types";
import EditVehicleModal from "./ModalVehicles/EditVehicleModal";
import AssignProjectModal from "./ModalVehicles/AssignProjectModal";
import styles from "./styles.module.css";

const VehicleList = ({ 
  vehicles = [], 
  onUpdateVehicle, 
  onDeleteVehicle, 
  onAssignVehicle,
  isUpdating = false
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalState, setModalState] = useState({ edit: false, assign: false });

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalState({ ...modalState, edit: true });
  };

  const handleSaveVehicle = async (updatedVehicle) => {
    const success = await onUpdateVehicle(updatedVehicle);
    if (success) {
      setModalState({ ...modalState, edit: false });
    }
  };

  const handleAssignVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalState({ ...modalState, assign: true });
  };

  const handleAssignToProject = async (vehicleId, projectId) => {
    const success = await onAssignVehicle(vehicleId, projectId);
    if (success) {
      setModalState({ ...modalState, assign: false });
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Disponível': styles.statusAvailable,
      'Indisponível': styles.statusUnavailable,
      'Manutenção': styles.statusMaintenance
    };
    return statusMap[status] || styles.statusDefault;
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
          {vehicles.filter(vehicle => vehicle?._id).map((vehicle) => (
            <tr key={vehicle._id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.plate}</td>
              <td className={getStatusClass(vehicle.availabilityStatus)}>
                {vehicle.availabilityStatus}
              </td>
              <td>{vehicle.projectAssociated?.name || "N/A"}</td>
              <td className={styles.actions}>
                <button 
                  onClick={() => handleEditVehicle(vehicle)}
                  disabled={isUpdating}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleAssignVehicle(vehicle)}
                  disabled={isUpdating || vehicle.availabilityStatus === 'Manutenção'}
                  className={styles.assignButton}
                >
                  Atribuir a Projeto
                </button>
                <button
                  onClick={() => onDeleteVehicle(vehicle._id)}
                  disabled={isUpdating}
                  className={styles.deleteButton}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalState.edit && selectedVehicle && (
        <EditVehicleModal
          isOpen={modalState.edit}
          onClose={() => setModalState({ ...modalState, edit: false })}
          vehicle={selectedVehicle}
          onSave={handleSaveVehicle}
          isProcessing={isUpdating}
        />
      )}

      {modalState.assign && selectedVehicle && (
        <AssignProjectModal
          isOpen={modalState.assign}
          onClose={() => setModalState({ ...modalState, assign: false })}
          vehicleId={selectedVehicle._id}
          onAssign={handleAssignToProject}
          isProcessing={isUpdating}
        />
      )}
    </div>
  );
};

VehicleList.propTypes = {
  vehicles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      plate: PropTypes.string,
      availabilityStatus: PropTypes.string,
      projectAssociated: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string
      })
    })
  ),
  onUpdateVehicle: PropTypes.func.isRequired,
  onDeleteVehicle: PropTypes.func.isRequired,
  onAssignVehicle: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool
};

export default VehicleList;