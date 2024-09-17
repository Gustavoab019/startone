import React from 'react';

const PortfolioSection = ({ profile, projectMessage, handleProjectChange, addProject, newProject, isSubmitting }) => (
  <div className="profile-section">
    <h3>Portfolio</h3>
    <div className="portfolio-cards">
      {profile.portfolio?.length > 0 ? (
        profile.portfolio.map((project, index) => (
          <div key={index} className="portfolio-card">
            <h4>{project.projectTitle}</h4>
            <p>{project.description}</p>
            <p>Completed on: {new Date(project.completionDate).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No projects added.</p>
      )}
    </div>
    <h4>Add New Project</h4>
    {projectMessage && <p className="message">{projectMessage}</p>}
    <input
      type="text"
      name="projectTitle"
      placeholder="Project Title"
      value={newProject.projectTitle}
      onChange={handleProjectChange}
    />
    <input
      type="text"
      name="description"
      placeholder="Description"
      value={newProject.description}
      onChange={handleProjectChange}
    />
    <input
      type="date"
      name="completionDate"
      value={newProject.completionDate}
      onChange={handleProjectChange}
    />
    <button type="button" onClick={addProject} disabled={isSubmitting} className="action-button">
      Add Project
    </button>
  </div>
);

export default PortfolioSection;
