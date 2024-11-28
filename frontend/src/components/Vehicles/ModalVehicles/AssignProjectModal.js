import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "./styles.module.css";

const AssignProjectModal = ({ isOpen, onClose, vehicleId, onAssign, isProcessing }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const { data } = await axios.get("/api/projects/my-projects", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(data);
        setError(null);
      } catch (err) {
        setError("Erro ao carregar projetos");
        console.error("Error fetching projects:", err);
      }
    };

    if (isOpen) {
      fetchProjects();
      setSelectedProject("");
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedProject) {
      setError("Selecione um projeto");
      return;
    }
    await onAssign(vehicleId, selectedProject);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Alocar Veículo a Projeto</h2>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.projectList}>
          {projects.map((project) => (
            <div
              key={project._id}
              className={`${styles.projectItem} ${selectedProject === project._id ? styles.selected : ""}`}
              onClick={() => !isProcessing && setSelectedProject(project._id)}
            >
              {project.projectTitle}
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button onClick={handleAssign} disabled={isProcessing || !selectedProject}>
            {isProcessing ? "Atribuindo..." : "Atribuir"}
          </button>
          <button onClick={onClose} disabled={isProcessing}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

AssignProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicleId: PropTypes.string.isRequired,
  onAssign: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool
};

export default AssignProjectModal;