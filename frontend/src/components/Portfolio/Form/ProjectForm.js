import React from 'react';
import styles from './styles.module.css';

const ProjectForm = ({ newProject, setNewProject, addProject }) => (
  <form className={styles.form}>
    <input
      type="text"
      name="projectTitle"
      placeholder="Project Title"
      value={newProject.projectTitle}
      onChange={(e) =>
        setNewProject({ ...newProject, projectTitle: e.target.value })
      }
      className={styles.input}
    />
    <input
      type="text"
      name="description"
      placeholder="Description"
      value={newProject.description}
      onChange={(e) =>
        setNewProject({ ...newProject, description: e.target.value })
      }
      className={styles.input}
    />
    <input
      type="date"
      name="completionDate"
      value={newProject.completionDate}
      onChange={(e) =>
        setNewProject({ ...newProject, completionDate: e.target.value })
      }
      className={styles.input}
    />
    <button type="button" onClick={addProject} className={styles.button}>
      Add Project
    </button>
  </form>
);

export default ProjectForm;
