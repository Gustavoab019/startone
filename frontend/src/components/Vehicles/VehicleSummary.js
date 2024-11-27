import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css'; // CSS do componente

const VehicleSummary = () => {
  const [vehicleCounts, setVehicleCounts] = useState({
    available: 0,
    inUse: 0,
    maintenance: 0,
    pendingMaintenance: 0,
  });

  useEffect(() => {
    // Função para buscar os dados dos veículos do backend
    const fetchVehicleCounts = async () => {
      try {
        // Obtendo o token do local storage
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

        const response = await axios.get('/api/vehicles', config);
        const vehicles = response.data;

        // Calculando os contadores de cada status
        const available = vehicles.filter(vehicle => vehicle.availabilityStatus === 'Disponível').length;
        const inUse = vehicles.filter(vehicle => vehicle.availabilityStatus === 'Indisponível').length;
        const maintenance = vehicles.filter(vehicle => vehicle.availabilityStatus === 'Manutenção').length;
        const pendingMaintenance = vehicles.filter(vehicle => {
          const nextMaintenanceDate = new Date(vehicle.nextMaintenanceDate);
          const currentDate = new Date();
          const daysToMaintenance = (nextMaintenanceDate - currentDate) / (1000 * 60 * 60 * 24);
          return daysToMaintenance <= 7 && vehicle.availabilityStatus === 'Disponível';
        }).length;

        setVehicleCounts({
          available,
          inUse,
          maintenance,
          pendingMaintenance,
        });
      } catch (error) {
        console.error('Erro ao buscar contagem de veículos:', error);
      }
    };

    fetchVehicleCounts();
  }, []);

  return (
    <div className={styles.vehicleSummaryContainer}>
      <div className={styles.summaryCard}>
        <h3>Disponíveis</h3>
        <p>{vehicleCounts.available} veículos</p>
      </div>
      <div className={styles.summaryCard}>
        <h3>Em Uso</h3>
        <p>{vehicleCounts.inUse} veículos</p>
      </div>
      <div className={styles.summaryCard}>
        <h3>Em Manutenção</h3>
        <p>{vehicleCounts.maintenance} veículos</p>
      </div>
      <div className={styles.summaryCard}>
        <h3>Manutenção Pendente</h3>
        <p>{vehicleCounts.pendingMaintenance} veículos</p>
      </div>
    </div>
  );
};

export default VehicleSummary;
