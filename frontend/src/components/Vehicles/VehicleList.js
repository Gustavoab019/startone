import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const VehicleList = ({ onEditVehicle, onDeleteVehicle, onAssignVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('Usuário não autenticado. Token não encontrado.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('/api/vehicles', config);
        setVehicles(response.data);
      } catch (error) {
        console.error('Erro ao buscar veículos:', error);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'Todos') return true;
    return vehicle.availabilityStatus === filter;
  });

  return (
    <div className={styles.vehicleListContainer}>
      <div className={styles.filters}>
        <button onClick={() => setFilter('Todos')}>Todos os Veículos</button>
        <button onClick={() => setFilter('Disponível')}>Disponíveis</button>
        <button onClick={() => setFilter('Indisponível')}>Em Uso</button>
        <button onClick={() => setFilter('Manutenção')}>Em Manutenção</button>
      </div>
      <table className={styles.vehicleTable}>
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Status</th>
            <th>Projeto</th>
            <th>Próx. Manutenção</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map(vehicle => (
            <tr key={vehicle._id}>
              <td>{vehicle.name} ({vehicle.type})</td>
              <td>{vehicle.plate}</td>
              <td>{vehicle.availabilityStatus}</td>
              <td>{vehicle.projectAssociated ? vehicle.projectAssociated.name : '-'}</td>
              <td>{new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}</td>
              <td>
                <button onClick={() => onEditVehicle(vehicle)}>Editar</button>
                <button onClick={() => onAssignVehicle(vehicle)}>Atribuir a Projeto</button>
                <button onClick={() => onDeleteVehicle(vehicle._id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
