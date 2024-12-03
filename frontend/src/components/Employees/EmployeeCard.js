import React, { useState } from "react";
import PropTypes from "prop-types";
import UpdateEmployeeModal from "./ModalEmployees/UpdateEmployeeModal";
import styles from "./styles.module.css";

const EmployeeCard = ({ employee, onUpdateEmployee, onDeleteEmployee }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className={styles.employeeCard}>
      <div className={styles.employeeHeader}>
        <h3>{employee.name}</h3>
        <p className={styles.status}>{employee.status}</p>
      </div>
      
      <div className={styles.employeeInfo}>
        <p><strong>Cargo:</strong> {employee.position}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Especialidades:</strong> {employee.specialties?.join(", ") || "Não especificado"}</p>
        <p><strong>Experiência:</strong> {employee.experienceYears ? `${employee.experienceYears} anos` : "Não especificado"}</p>
        
        {employee.certifications?.length > 0 && (
          <div className={styles.certifications}>
            <strong>Certificações:</strong>
            <ul>
              {employee.certifications.map((cert, index) => (
                <li key={index}>
                  {cert.name} - {cert.institution} ({new Date(cert.dateObtained).getFullYear()})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.employeeActions}>
        <button 
          className={styles.editButton}
          onClick={() => setIsEditModalOpen(true)}
        >
          Editar
        </button>
        <button 
          className={styles.deleteButton}
          onClick={() => onDeleteEmployee(employee.userId)}
        >
          Remover
        </button>
      </div>

      {isEditModalOpen && (
        <UpdateEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employee={employee}
          onEmployeeUpdated={onUpdateEmployee}
        />
      )}
    </div>
  );
};

EmployeeCard.propTypes = {
  employee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    email: PropTypes.string,
    specialties: PropTypes.arrayOf(PropTypes.string),
    experienceYears: PropTypes.number,
    certifications: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        institution: PropTypes.string.isRequired,
        dateObtained: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  onUpdateEmployee: PropTypes.func.isRequired,
  onDeleteEmployee: PropTypes.func.isRequired
};

export default EmployeeCard;