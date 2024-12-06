import React from 'react';
import styles from './styles.module.css';

const ParticipantForm = ({
  projects,
  selectedProject,
  setSelectedProject,
  participants,
  setParticipants,
  participantMessage,
  addParticipants,
  isSubmittingParticipants,
}) => (
  <form className={styles.form}>
    <select
      value={selectedProject}
      onChange={(e) => setSelectedProject(e.target.value)}
      className={styles.select}
    >
      <option value="">Select Project</option>
      {projects.map((project) => (
        <option key={project._id} value={project._id}>
          {project.projectTitle}
        </option>
      ))}
    </select>
    <input
      type="text"
      placeholder="Professional IDs (comma-separated)"
      value={participants.professionals}
      onChange={(e) =>
        setParticipants({ ...participants, professionals: e.target.value })
      }
      className={styles.input}
    />
    <input
      type="text"
      placeholder="Client IDs (comma-separated)"
      value={participants.clients}
      onChange={(e) =>
        setParticipants({ ...participants, clients: e.target.value })
      }
      className={styles.input}
    />
    <button
      type="button"
      onClick={addParticipants}
      disabled={!selectedProject || isSubmittingParticipants}
      className={styles.button}
    >
      {isSubmittingParticipants ? 'Adding...' : 'Add Participants'}
    </button>
    {participantMessage && <p className={styles.success}>{participantMessage}</p>}
  </form>
);

export default ParticipantForm;
