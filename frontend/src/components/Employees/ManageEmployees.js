import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import AddEmployeeModal from "./ModalEmployees/AddEmployeeModal";
import UpdateEmployeeModal from "./ModalEmployees/UpdateEmployeeModal";
import AssignProjectModal from "./ModalEmployees/AssignProjectModal"; // Importar AssignProjectModal
import styles from "./styles.module.css";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // Estado para modal de atribuição
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForProject, setSelectedEmployeeForProject] = useState(null); // Estado para atribuição de projeto
  const [projectDetails, setProjectDetails] = useState({});

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const fetchProjectDetails = useCallback(async (employeeId) => {
    if (!employeeId) return;
    try {
      const { data } = await axios.get(
        `/api/employee/${employeeId}/project`,
        getAuthConfig()
      );
      setProjectDetails((prev) => ({
        ...prev,
        [employeeId]: data.project,
      }));
    } catch (err) {
      console.error("Erro ao buscar detalhes do projeto:", err);
    }
  }, [getAuthConfig]);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/employee/company", getAuthConfig());
      setEmployees(data || []);

      const projectPromises = data
        .filter((employee) => employee.status === "Em Projeto")
        .map((employee) => fetchProjectDetails(employee._id));
      await Promise.all(projectPromises);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao buscar funcionários");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthConfig, fetchProjectDetails]);

  useEffect(() => {
    let isSubscribed = true;
    const fetch = async () => {
      if (isSubscribed) {
        setIsLoading(true);
        setError(null);
        await fetchEmployees();
      }
    };
    fetch();
    return () => {
      isSubscribed = false;
    };
  }, [fetchEmployees]);

  const handleAddEmployee = async (professionalEmail, position) => {
    if (!professionalEmail) {
      setError("Email profissional é obrigatório");
      return;
    }
   
    if (!position) {
      setError("Cargo é obrigatório");
      return;
    }
   
    setActionLoading(true);
    try {
      await axios.post(
        "/api/employee/invite", 
        { 
          professionalEmail,
          position 
        },
        getAuthConfig()
      );
   
      await fetchEmployees();
      setIsAddModalOpen(false);
      showSuccess("Convite enviado com sucesso");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao enviar convite para o profissional");
    } finally {
      setActionLoading(false);
    }
   };

  const handleAssignProject = async (employeeId, projectId, role) => {
    if (!employeeId || !projectId || !role) {
      setError("Todos os campos são obrigatórios");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axios.post(
        `/api/projects/${projectId}/employees`,
        { employeeId, role },
        getAuthConfig()
      );
      
      if (response.data) {
        await fetchEmployees();
        setIsAssignModalOpen(false);
        setSelectedEmployeeForProject(null);
        showSuccess("Funcionário atribuído ao projeto com sucesso");
      }
    } catch (err) {
      console.error('Assignment error:', err.response?.data);
      setError(err.response?.data?.message || "Erro ao atribuir funcionário ao projeto");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployee = async (employeeId, data) => {
    if (!employeeId || !data) {
      setError("Dados inválidos para atualização");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`/api/employee/${employeeId}`, data, getAuthConfig());
      await fetchEmployees();
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      showSuccess("Funcionário atualizado com sucesso");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao atualizar funcionário");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveEmployee = async (professionalId) => {
    if (!professionalId) {
      setError("ID do profissional é obrigatório");
      return;
    }
    if (window.confirm("Deseja realmente desvincular este funcionário?")) {
      setActionLoading(true);
      try {
        await axios.post(
          "/api/employee/unlink-professional",
          { professionalId },
          getAuthConfig()
        );
        await fetchEmployees();
        showSuccess("Funcionário desvinculado com sucesso");
      } catch (err) {
        setError(err.response?.data?.error || "Erro ao desvincular profissional");
      } finally {
        setActionLoading(false);
      }
    }
  };


  const handleRemoveFromProject = async (projectId, employeeId) => {
    if (!projectId || !employeeId) {
      setError("Dados inválidos para remoção do projeto");
      return;
    }

    setActionLoading(true);
    try {
      if (window.confirm("Deseja realmente remover este funcionário do projeto?")) {
        console.log('Removing:', { projectId, employeeId }); // Debug
        
        await axios.delete(
          `/api/projects/${projectId}/employees/${employeeId}`, // Note: 'projects' plural
          getAuthConfig()
        );
        
        await fetchEmployees();
        showSuccess("Funcionário removido do projeto com sucesso");
      }
    } catch (err) {
      console.error('Error details:', err.response);
      setError(err.response?.data?.error || "Erro ao remover do projeto");
    } finally {
      setActionLoading(false);
    }
  };

  const statusCounts = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case "Disponível":
        return styles.statusAvailable;
      case "Em Projeto":
        return styles.statusProject;
      case "Férias":
        return styles.statusVacation;
      case "Indisponível":
        return styles.statusUnavailable;
      default:
        return styles.statusDefault;
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Carregando funcionários...</div>;
  }

  // Adicione este console.log antes do return do componente
    console.log("Dados brutos:", employees);
    console.log("Status counts:", statusCounts);
    console.log("Funcionários em projeto:", employees.filter(emp => emp.status === "Em Projeto").length);

  return (
    <div className={styles.container}>
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeAlert}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className={styles.header}>
        <h1>Gerenciamento de Funcionários</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
          disabled={actionLoading}
        >
          <Plus className={styles.addIcon} size={20} />
          Adicionar Funcionário
        </button>
      </div>

      <div className={styles.statusGrid}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`${styles.statusCard} ${getStatusColor(status)}`}
          >
            <h3 className={styles.statusTitle}>{status}</h3>
            <p className={styles.statusCount}>{count} funcionários</p>
          </div>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Projeto Atual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>
                  <div className={styles.employeeInfo}>
                    <span className={styles.employeeName}>
                      {employee.userName}
                    </span>
                    <span className={styles.employeeEmail}>
                      {employee.userEmail}
                    </span>
                  </div>
                </td>
                <td>{employee.position}</td>
                <td>
                  <span
                    className={`${styles.badge} ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td>
                  {employee.status === "Em Projeto" && projectDetails[employee._id]?.projectTitle ? (
                    <div className={styles.projectInfo}>
                      <span>{projectDetails[employee._id].projectTitle}</span>
                      <span className={styles.projectRole}>{employee.currentProjectRole}</span>
                      <button
                        onClick={() => handleRemoveFromProject(projectDetails[employee._id]._id, employee._id)}
                        className={styles.removeFromProject}
                        disabled={actionLoading}
                      >
                        Remover do Projeto
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setIsEditModalOpen(true);
                      }}
                      className={styles.editButton}
                      disabled={actionLoading}
                    >
                      Editar
                    </button>
                    {employee.status === "Disponível" && (
                      <button
                        onClick={() => {
                          setSelectedEmployeeForProject(employee);
                          setIsAssignModalOpen(true);
                        }}
                        className={styles.assignButton}
                        disabled={actionLoading}
                      >
                        Atribuir Projeto
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveEmployee(employee.userId)}
                      className={styles.deleteButton}
                      disabled={actionLoading}
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

      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmployeeAdded={handleAddEmployee}
          isLoading={actionLoading}
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
          onEmployeeUpdated={handleUpdateEmployee}
          isLoading={actionLoading}
        />
      )}

      {isAssignModalOpen && selectedEmployeeForProject && (
        <AssignProjectModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedEmployeeForProject(null);
          }}
          employee={selectedEmployeeForProject}
          onAssignProject={handleAssignProject}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default ManageEmployees;
