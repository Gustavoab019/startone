import React from "react";
import PropTypes from "prop-types";
import EmployeeCard from "./EmployeeCard";
import styles from "./styles.module.css";

const EmployeeList = ({ employees, onRemoveEmployee, onUpdateEmployee }) => {
  if (employees.length === 0) {
    return <p className={styles.noEmployees}>Nenhum funcionário encontrado.</p>;
  }

  return (
    <div className={styles.employeeList}>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee._id}
          employee={{
            ...employee,
            name: employee.userName, // Mapeando os novos campos
            email: employee.userEmail,
          }}
          onDeleteEmployee={onRemoveEmployee}
          onUpdateEmployee={onUpdateEmployee}
        />
      ))}
    </div>
  );
};

EmployeeList.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      userEmail: PropTypes.string,
      specialties: PropTypes.arrayOf(PropTypes.string),
      experienceYears: PropTypes.number,
      certifications: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          institution: PropTypes.string.isRequired,
          dateObtained: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  onRemoveEmployee: PropTypes.func.isRequired,
  onUpdateEmployee: PropTypes.func.isRequired
};

export default EmployeeList;