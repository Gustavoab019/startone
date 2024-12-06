import React from 'react';
import styles from './styles.module.css';

const AddParticipantsModal = ({
  isOpen,
  onClose,
  onAddParticipant,
  participants,
  setParticipants,
  participantMessage,
  isSubmittingParticipants,
  projects,
  selectedProject,
  setSelectedProject
}) => {
  // Se a modal não estiver aberta, não renderiza nada
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProject) {
      onAddParticipant(); // Adiciona os participantes ao projeto selecionado
    } else {
      console.error('No project selected!');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add Participants to Project</h2>

        {/* Se houver mensagem de sucesso ou erro, exibe */}
        {participantMessage && <p className={styles.success}>{participantMessage}</p>}

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

          {/* Campo para adicionar profissionais */}
          <label>
            Professionals (comma separated):
            <input
              type="text"
              placeholder="Enter professional IDs"
              value={participants.professionals}
              onChange={(e) =>
                setParticipants({ ...participants, professionals: e.target.value })
              }
              className={styles.input}
            />
          </label>

          {/* Campo para adicionar clientes */}
          <label>
            Clients (comma separated):
            <input
              type="text"
              placeholder="Enter client IDs"
              value={participants.clients}
              onChange={(e) =>
                setParticipants({ ...participants, clients: e.target.value })
              }
              className={styles.input}
            />
          </label>

          {/* Botão para enviar */}
          <button
            type="submit"
            disabled={!selectedProject || isSubmittingParticipants}
            className={styles.button}
          >
            {isSubmittingParticipants ? 'Adding...' : 'Add Participants'}
          </button>
        </form>

        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  );
};

export default AddParticipantsModal;
