import React from 'react';
import styles from './styles.module.css'; // CSS do componente

// Função para calcular as estatísticas dos veículos
const calculateVehicleStats = (vehicles) => {
  const currentDate = new Date();

  return vehicles.reduce(
    (stats, vehicle) => {
      if (vehicle.availabilityStatus === 'Disponível') {
        stats.available += 1;

        // Verifica se a manutenção está pendente (7 dias ou menos para a próxima manutenção)
        const nextMaintenanceDate = new Date(vehicle.nextMaintenanceDate);
        const daysToMaintenance = (nextMaintenanceDate - currentDate) / (1000 * 60 * 60 * 24);
        if (daysToMaintenance <= 7) {
          stats.pendingMaintenance += 1;
        }
      } else if (vehicle.availabilityStatus === 'Indisponível') {
        stats.inUse += 1;
      } else if (vehicle.availabilityStatus === 'Manutenção') {
        stats.maintenance += 1;
      }
      return stats;
    },
    {
      available: 0,
      inUse: 0,
      maintenance: 0,
      pendingMaintenance: 0,
    }
  );
};

// Componente para exibir o resumo dos veículos
const VehicleSummary = ({ vehicles }) => {
  // Calcula as estatísticas dos veículos
  const { available, inUse, maintenance, pendingMaintenance } = React.useMemo(
    () => calculateVehicleStats(vehicles),
    [vehicles]
  );

  return (
    <div className={styles.vehicleSummaryContainer}>
      <div className={`${styles.summaryCard} ${styles.available}`}>
        <h3>Disponíveis</h3>
        <p>{available} veículos</p>
      </div>
      <div className={`${styles.summaryCard} ${styles.inUse}`}>
        <h3>Em Uso</h3>
        <p>{inUse} veículos</p>
      </div>
      <div className={`${styles.summaryCard} ${styles.maintenance}`}>
        <h3>Em Manutenção</h3>
        <p>{maintenance} veículos</p>
      </div>
      <div className={`${styles.summaryCard} ${styles.pending}`}>
        <h3>Manutenção Pendente</h3>
        <p>{pendingMaintenance} veículos</p>
      </div>
    </div>
  );
};

export default VehicleSummary;
