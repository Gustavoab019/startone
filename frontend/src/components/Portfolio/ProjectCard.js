import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Car, Users } from 'lucide-react';
import EditProjectModal from './Modals/EditProjectModal';
import styles from './styles.module.css';

const NotificationComponent = ({ notification }) => {
  return notification ? ReactDOM.createPortal(
    <div 
      className={`${styles.notification} ${styles[notification.type]}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: '4px',
        backgroundColor: notification.type === 'error' ? '#ff4444' : '#44b944',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      {notification.message}
    </div>,
    document.body
  ) : null;
};

const ProjectCard = ({ project: initialProject, setSelectedProject, onUpdateProject, onDeleteProject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [vehicleError, setVehicleError] = useState(null);
  const [employeeError, setEmployeeError] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatDate = (date) => {
    if (!date) return 'Data não informada';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('pt-BR', options);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'not_started': 'Não Iniciado',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchProjectEmployees = async () => {
      if (!initialProject?._id) return;
      
      setIsLoadingEmployees(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/projects/${initialProject._id}/employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Falha ao carregar funcionários');
        }
        
        const data = await response.json();
        setProjectEmployees(data);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        setEmployeeError('Erro ao carregar funcionários');
        setProjectEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchProjectEmployees();
  }, [initialProject?._id]);

  useEffect(() => {
    const fetchProjectVehicles = async () => {
      if (!initialProject?._id) return;

      setIsLoadingVehicles(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/vehicles/project/${initialProject._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) throw new Error('Falha ao carregar veículos');
        const data = await response.json();
        setVehicles(data);
        setVehicleError(null);
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        setVehicleError('Erro ao carregar veículos');
        setVehicles([]);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchProjectVehicles();
  }, [initialProject?._id]);

  const handleEdit = async (projectId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Error updating project.');
      }
  
      onUpdateProject?.(projectId, responseData);
      setIsEditing(false);
      showNotification('Projeto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      showNotification('Erro ao atualizar o projeto. Tente novamente.', 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja remover este projeto?')) {
      try {
        await onDeleteProject(initialProject._id);
        showNotification('Projeto removido com sucesso!');
      } catch (error) {
        showNotification('Erro ao remover o projeto. Tente novamente.', 'error');
      }
    }
  };

  const EmployeesList = () => {
    if (isLoadingEmployees) {
      return <span className={styles.loadingText}>Carregando...</span>;
    }

    if (employeeError) {
      return <span className={styles.errorText}>{employeeError}</span>;
    }

    return (
      <div className={styles.employeeCount}>
        <div className={styles.employeeHeader}>
          <Users size={16} className={styles.employeeIcon} />
          <span>{projectEmployees.length} funcionário(s)</span>
        </div>
        {projectEmployees.length > 0 && (
          <div className={styles.employeesList}>
            {projectEmployees.map(emp => (
              <div key={emp._id} className={styles.employeeItem}>
                <span className={styles.employeeName}>{emp.userName}</span>
                <span className={styles.employeePosition}>{emp.position}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const VehiclesList = () => {
    if (isLoadingVehicles) {
      return <span className={styles.loadingText}>Carregando veículos...</span>;
    }

    if (vehicleError) {
      return <span className={styles.errorText}>{vehicleError}</span>;
    }

    if (!vehicles.length) {
      return (
        <div className={styles.vehicleItem}>
          <Car size={16} className={styles.vehicleIcon} />
          <span>Sem veículos</span>
        </div>
      );
    }

    return vehicles.map((vehicle) => (
      <div key={vehicle._id} className={styles.vehicleItem}>
        <Car size={16} className={styles.vehicleIcon} />
        <span>{vehicle.name || 'Sem nome'}</span>
      </div>
    ));
  };

  const statusClass = initialProject.status
    ? `status-${initialProject.status.replace(' ', '_').toLowerCase()}`
    : '';

  return (
    <>
      <NotificationComponent notification={notification} />
      <tr>
        <td>
          <div className={styles.projectInfo}>
            <span className={styles.projectName}>{initialProject.projectTitle}</span>
            <span className={styles.projectDesc}>{initialProject.description}</span>
            <span className={styles.projectRole}>
              {initialProject.role 
                ? initialProject.role === 'Creator' 
                  ? 'Criador' 
                  : `Função: ${initialProject.role}`
                : 'Função não definida'}
            </span>
          </div>
        </td>
        <td>
          <EmployeesList />
        </td>
        <td>
          <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
            {getStatusText(initialProject.status)}
          </span>
        </td>
        <td>{formatDate(initialProject.completionDate)}</td>
        <td className={styles.vehiclesCell}>
          <VehiclesList />
        </td>
        <td className={styles.actionsCell}>
          {initialProject.role === 'Creator' && (
            <div className={styles.actions}>
              <button 
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>
              <button 
                className={styles.removeButton}
                onClick={handleDelete}
              >
                Remover
              </button>
            </div>
          )}
        </td>
      </tr>

      {isEditing && (
        <EditProjectModal
          project={initialProject}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onEdit={handleEdit}
        />
      )}
    </>
  );
};

export default ProjectCard;