import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import AddEmployeeModal from "./ModalEmployees/AddEmployeeModal";
import UpdateEmployeeModal from "./ModalEmployees/UpdateEmployeeModal";
import styles from "./styles.module.css";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/employee/company", getAuthConfig());
      setEmployees(data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao buscar funcionários");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = async (professionalId) => {
    try {
      await axios.post(
        "/api/employee/link-professional",
        { professionalId },
        getAuthConfig()
      );
      await fetchEmployees();
      setIsAddModalOpen(false);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Erro ao vincular profissional");
    }
  };

  const handleRemoveEmployee = async (professionalId) => {
    if (window.confirm("Deseja realmente desvincular este funcionário?")) {
      try {
        await axios.post(
          "/api/employee/unlink-professional",
          { professionalId },
          getAuthConfig()
        );
        await fetchEmployees();
      } catch (err) {
        setError(err.response?.data?.error || "Erro ao desvincular profissional");
      }
    }
  };

  const statusCounts = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return styles.statusAvailable;
      case 'Indisponível': return styles.statusUnavailable;
      case 'Férias': return styles.statusVacation;
      case 'Licença': return styles.statusLeave;
      default: return styles.statusDefault;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gerenciamento de Funcionários</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className={styles.addIcon} size={20} />
          Adicionar Funcionário
        </button>
      </div>

      <div className={styles.statusGrid}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className={`${styles.statusCard} ${getStatusColor(status)}`}>
            <h3 className={styles.statusTitle}>{status}</h3>
            <p className={styles.statusCount}>{count} funcionários</p>
          </div>
        ))}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          <button onClick={() => setError(null)} className={styles.closeError}>×</button>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Carregando funcionários...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Especialidades</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <div className={styles.employeeInfo}>
                      <span className={styles.employeeName}>{employee.userName}</span>
                      <span className={styles.employeeEmail}>{employee.userEmail}</span>
                    </div>
                  </td>
                  <td>{employee.position}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.specialtiesList}>
                      {employee.specialties?.map((specialty, index) => (
                        <span key={index} className={styles.specialtyTag}>
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEditModalOpen(true);
                        }}
                        className={styles.editButton}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleRemoveEmployee(employee.userId)}
                        className={styles.deleteButton}
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmployeeAdded={handleAddEmployee}
        />
      )}

      {isEditModalOpen && selectedEmployee && (
        <UpdateEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onEmployeeUpdated={fetchEmployees}
        />
      )}
    </div>
  );
};

export default ManageEmployees;