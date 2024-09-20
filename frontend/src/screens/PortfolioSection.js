import React, { useState, useEffect } from 'react';

const PortfolioSection = ({ projectMessage, handleProjectChange: parentHandleProjectChange, newProject, isSubmitting }) => {
  const [projects, setProjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(''); 
  const [participants, setParticipants] = useState({ professionals: '', clients: '' });
  const [participantMessage, setParticipantMessage] = useState('');

  // Fetch the user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Unauthorized - no token');
        }

        const response = await fetch('/api/projects/my-projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },  
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setFetchError('Error fetching projects. Please try again.');
      }
    };

    fetchProjects();
  }, []);

  // Function to handle adding a new project
  const addProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized - no token');
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Error adding project');
      }

      const data = await response.json();
      setProjects((prevProjects) => [...prevProjects, data]); // Add new project to the state
      parentHandleProjectChange({ target: { name: 'projectTitle', value: '' } }); // Reset projectTitle
      parentHandleProjectChange({ target: { name: 'description', value: '' } }); // Reset description
      parentHandleProjectChange({ target: { name: 'completionDate', value: '' } }); // Reset completionDate
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  // Function to handle adding participants to a project
const addParticipants = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Unauthorized - no token');
    }

    const response = await fetch(`/api/projects/${selectedProject}/add-participants`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        professionals: participants.professionals.split(',').map(id => id.trim()), // Split by comma, trim spaces
        clients: participants.clients.split(',').map(id => id.trim()), // Split by comma, trim spaces
      }),
    });

    if (!response.ok) {
      throw new Error('Error adding participants');
    }

    setParticipantMessage('Participants added successfully!');

    // Reset the participants fields after success
    setParticipants({ professionals: '', clients: '' });

  } catch (error) {
    setParticipantMessage('Error adding participants');
    console.error('Error:', error);
  }
};


  return (
    <div className="profile-section">
      <h3>Projects</h3>

      {/* Display error if there's an issue fetching projects */}
      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="portfolio-cards">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div key={index} className="portfolio-card">
              <h4>{project.projectTitle}</h4>
              <p>{project.description}</p>
              <p>Completion Date: {new Date(project.completionDate).toLocaleDateString()}</p>
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
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={newProject.description}
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <input
        type="date"
        name="completionDate"
        value={newProject.completionDate}
        onChange={parentHandleProjectChange}
        className="input-field"
      />
      <button type="button" onClick={addProject} disabled={isSubmitting} className="action-button">
        Add Project
      </button>

      {/* Add Participants Section */}
      <h4>Add Participants to Project</h4>
      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="select-field"
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
        name="professionals"
        placeholder="Professional IDs (comma-separated)"
        value={participants.professionals}
        onChange={(e) => setParticipants({ ...participants, professionals: e.target.value })}
        className="input-field"
      />
      <input
        type="text"
        name="clients"
        placeholder="Client IDs (comma-separated)"
        value={participants.clients}
        onChange={(e) => setParticipants({ ...participants, clients: e.target.value })}
        className="input-field"
      />
      <button type="button" onClick={addParticipants} disabled={!selectedProject} className="action-button">
        Add Participants
      </button>

      {participantMessage && <p>{participantMessage}</p>}
    </div>
  );
};

export default PortfolioSection;
