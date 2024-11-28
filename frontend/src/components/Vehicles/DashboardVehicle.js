import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import VehicleSummary from "./VehicleSummary";
import VehicleList from "./VehicleList";
import AddVehicleModal from "./ModalVehicles/VehicleFormModal";
import styles from "./styles.module.css";

const DashboardVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/vehicles", getAuthConfig());
      setVehicles(data);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao buscar veículos");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleAddVehicle = async (newVehicle) => {
    setIsUpdating(true);
    try {
      const config = getAuthConfig();
      const vehicleData = {
        ...newVehicle,
        availabilityStatus: newVehicle.availabilityStatus || "Disponível",
      };
      await axios.post("/api/vehicles", vehicleData, config);
      await fetchVehicles();
      setIsAddModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao adicionar veículo");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    setIsUpdating(true);
    try {
      const { data } = await axios.patch(
        `/api/vehicles/${updatedVehicle._id}`,
        updatedVehicle,
        getAuthConfig()
      );
      setVehicles(prev =>
        prev.map(v => v._id === updatedVehicle._id ? data.vehicle : v)
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar veículo");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Confirma a exclusão deste veículo?")) return;
    
    setIsUpdating(true);
    try {
      await axios.delete(`/api/vehicles/${vehicleId}`, getAuthConfig());
      setVehicles(prev => prev.filter(v => v._id !== vehicleId));
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao remover veículo");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignVehicle = async (vehicleId, projectId) => {
    setIsUpdating(true);
    try {
      await axios.patch(
        `/api/vehicles/${vehicleId}/assign`,
        { projectId },
        getAuthConfig()
      );
      await fetchVehicles();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao alocar veículo");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Gerenciamento de Veículos</h1>
      
      <div className={styles.addVehicleButton}>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          disabled={isUpdating}
        >
          + Adicionar Veículo
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Carregando veículos...</div>
      ) : (
        <>
          <VehicleSummary vehicles={vehicles} />
          <VehicleList
            vehicles={vehicles}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onAssignVehicle={handleAssignVehicle}
            isUpdating={isUpdating}
          />
        </>
      )}

      {isAddModalOpen && (
        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onVehicleAdded={handleAddVehicle}
          isProcessing={isUpdating}
        />
      )}
    </div>
  );
};

DashboardVehicles.propTypes = {
  vehicles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      plate: PropTypes.string.isRequired,
      availabilityStatus: PropTypes.string.isRequired,
      nextMaintenanceDate: PropTypes.string,
      projectAssociated: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    })
  ),
};

export default DashboardVehicles;