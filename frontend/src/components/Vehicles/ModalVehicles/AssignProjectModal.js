import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";

const AssignProjectModal = ({ isOpen, onClose, vehicleId, onAssign }) => {
  const [projects, setProjects] = useState([]); // Lista de projetos disponíveis
  const [selectedProject, setSelectedProject] = useState(""); // Projeto selecionado

  // Carregar a lista de projetos ao abrir o modal
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Usuário não autenticado. Token não encontrado.");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get("/api/projects/my-projects", config);
        console.log("Projetos retornados:", response.data); // Debug para verificar a API
        setProjects(response.data); // Atualiza a lista de projetos
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    if (isOpen) {
      fetchProjects(); // Carrega os projetos quando o modal é aberto
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (!selectedProject) {
      alert("Por favor, selecione um projeto.");
      return;
    }

    // Chama a função de atribuição passada pelo pai
    onAssign(vehicleId, selectedProject);
    onClose(); // Fecha o modal
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Alocar Veículo a Projeto</h2>
        <p>Selecione um projeto ao qual deseja associar o veículo:</p>
        <ul className={styles.projectList}>
          {projects.map((project) => (
            <li
              key={project._id}
              className={`${styles.projectItem} ${
                selectedProject === project._id ? styles.selected : ""
              }`}
              onClick={() => setSelectedProject(project._id)}
            >
              {project.projectTitle || "Projeto sem nome"}
            </li>
          ))}
        </ul>
        <div className={styles.modalActions}>
          <button onClick={handleAssign}>Atribuir</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectModal;
