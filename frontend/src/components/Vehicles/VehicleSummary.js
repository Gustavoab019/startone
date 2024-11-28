import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const calculateVehicleStats = (vehicles) => {
  const currentDate = new Date();
  
  return vehicles.reduce(
    (stats, vehicle) => {
      const status = vehicle.availabilityStatus?.toLowerCase();
      
      switch (status) {
        case 'disponível':
          stats.available += 1;
          const nextMaintenanceDate = new Date(vehicle.nextMaintenanceDate);
          const daysToMaintenance = Math.ceil(
            (nextMaintenanceDate - currentDate) / (1000 * 60 * 60 * 24)
          );
          if (daysToMaintenance <= 7 && daysToMaintenance >= 0) {
            stats.pendingMaintenance += 1;
          }
          break;
        case 'indisponível':
          stats.inUse += 1;
          break;
        case 'manutenção':
          stats.maintenance += 1;
          break;
        default:
          console.warn(`Unknown vehicle status: ${status}`);
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

const SummaryCard = ({ title, count, type }) => (
  <div className={`${styles.summaryCard} ${styles[type]}`}>
    <h3>{title}</h3>
    <p>{count} veículos</p>
  </div>
);

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['available', 'inUse', 'maintenance', 'pending']).isRequired,
};

const VehicleSummary = ({ vehicles }) => {
  const stats = React.useMemo(
    () => calculateVehicleStats(vehicles),
    [vehicles]
  );

  const summaryData = [
    { title: 'Disponíveis', count: stats.available, type: 'available' },
    { title: 'Em Uso', count: stats.inUse, type: 'inUse' },
    { title: 'Em Manutenção', count: stats.maintenance, type: 'maintenance' },
    { title: 'Manutenção Pendente', count: stats.pendingMaintenance, type: 'pending' },
  ];

  return (
    <div className={styles.vehicleSummaryContainer}>
      {summaryData.map((data) => (
        <SummaryCard key={data.type} {...data} />
      ))}
    </div>
  );
};

VehicleSummary.propTypes = {
  vehicles: PropTypes.arrayOf(
    PropTypes.shape({
      availabilityStatus: PropTypes.string.isRequired,
      nextMaintenanceDate: PropTypes.string,
    })
  ).isRequired,
};

export default VehicleSummary;