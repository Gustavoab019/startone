import React, { useState } from 'react';
import styles from './styles.module.css';

const AddParticipantsModal = ({
  isOpen,
  onClose,
  onAddParticipant,
  isSubmittingParticipants,
  projects,
  selectedProject,
  setSelectedProject
}) => {
  const [employee, setEmployee] = useState({
    employeeId: '',
    role: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProject && employee.employeeId && employee.role) {
      onAddParticipant(employee);
      setEmployee({ employeeId: '', role: '' }); // Reset form
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add Employee to Project</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Seletor de projeto */}
          <label>
            Select Project:
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectTitle}
                </option>
              ))}
            </select>
          </label>

          {/* Campo para ID do funcionário */}
          <label>
            Employee ID:
            <input
              type="text"
              placeholder="Enter employee ID"
              value={employee.employeeId}
              onChange={(e) =>
                setEmployee({ ...employee, employeeId: e.target.value })
              }
              className={styles.input}
              required
            />
          </label>

          {/* Campo para função do funcionário */}
          <label>
            Role:
            <input
              type="text"
              placeholder="Enter employee role"
              value={employee.role}
              onChange={(e) =>
                setEmployee({ ...employee, role: e.target.value })
              }
              className={styles.input}
              required
            />
          </label>

          <button
            type="submit"
            disabled={!selectedProject || isSubmittingParticipants}
            className={styles.button}
          >
            {isSubmittingParticipants ? 'Adding...' : 'Add Employee'}
          </button>
        </form>

        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default AddParticipantsModal;