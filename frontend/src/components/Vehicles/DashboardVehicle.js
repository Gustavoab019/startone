// DashboardVehicles.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import VehicleSummary from "./VehicleSummary";
import VehicleList from "./VehicleList";
import AddVehicleModal from "./ModalVehicles/VehicleFormModal";
import styles from "./styles.module.css";

const DashboardVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado. Token não encontrado.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get("/api/vehicles", config);
      setVehicles(response.data);
    } catch (error) {
      setFetchError("Erro ao buscar veículos. Tente novamente mais tarde.");
      console.error("Erro ao buscar veículos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleUpdateVehicle = async (updatedVehicle) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado. Token não encontrado.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.patch(
        `/api/vehicles/${updatedVehicle._id}`,
        updatedVehicle,
        config
      );

      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v._id === updatedVehicle._id ? response.data.vehicle : v
        )
      );
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao salvar alterações no veículo:", error);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado. Token não encontrado.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/vehicles/${vehicleId}`, config);
      setVehicles((prevVehicles) => prevVehicles.filter((v) => v._id !== vehicleId));
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao remover veículo:", error);
    }
  };

  const handleAddVehicle = async (newVehicle) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado. Token não encontrado.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post("/api/vehicles", newVehicle, config);
      setVehicles((prevVehicles) => [...prevVehicles, response.data]);
      setIsAddModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
    }
  };

  const handleAssignVehicle = async (vehicleId, projectId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado. Token não encontrado.");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(
        `/api/vehicles/${vehicleId}/assign`,
        { projectId },
        config
      );
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao alocar veículo:", error);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1>Gerenciamento de Veículos</h1>
      
      <div className={styles.addVehicleButton}>
        <button onClick={() => setIsAddModalOpen(true)}>+ Adicionar Veículo</button>
      </div>

      {fetchError && <p className={styles.error}>{fetchError}</p>}

      {isLoading ? (
        <p>Carregando veículos...</p>
      ) : (
        <>
          <VehicleSummary vehicles={vehicles} />
          <VehicleList
            vehicles={vehicles}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onAssignVehicle={handleAssignVehicle}
            onVehicleStatusChange={fetchVehicles}
          />
        </>
      )}

      {isAddModalOpen && (
        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddVehicle={handleAddVehicle}
        />
      )}
    </div>
  );
};

export default DashboardVehicles;