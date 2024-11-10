import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa'; // Icon for the search input
import '../styles/SearchUser.css';

const SearchUsersSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [following, setFollowing] = useState({}); // Armazena o estado de seguir de cada usuário

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const searchUsers = useCallback(async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('User is not authenticated. Please log in.');
        setIsLoading(false);
        return;
      }

      // Fetch users based on the search query
      const response = await fetch(`/api/users/professionals?username=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setSearchResults(result);

        // Verifica se o usuário está seguindo cada perfil retornado
        const followingStatus = {};
        result.forEach((user) => {
          followingStatus[user.userId._id] = user.isFollowing; // 'isFollowing' vem do backend
        });
        setFollowing(followingStatus);

      } else {
        setErrorMessage(result.message || 'Failed to fetch users.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while searching for users.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const handleEvaluateClick = (profile) => {
    const userId = profile.userId._id ? profile.userId._id.toString() : profile.userId.toString();
    setSelectedUserId(userId);
    setIsModalOpen(true);

    fetchUserProjects(userId);
  };

  const fetchUserProjects = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated. Please log in.');

      const response = await fetch(`/api/projects/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setProjects(result);
      } else {
        setProjects([]);
        setErrorMessage(result.message || 'Failed to fetch projects.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while fetching projects.');
      setProjects([]);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjects([]);
    setSelectedUserId(null);
  };

  const handleSubmitEvaluation = async (event) => {
    event.preventDefault();
  
    if (!selectedUserId) {
      setErrorMessage('User ID is not selected. Please select a user to evaluate.');
      return;
    }
  
    const formData = new FormData(event.target);
    const evaluationData = {
      evaluated: selectedUserId,
      project: formData.get("projectId"), // Ensure this captures the project ID
      categories: {
        qualityOfWork: parseInt(formData.get("qualityOfWork"), 10),
        punctuality: parseInt(formData.get("punctuality"), 10),
        communication: parseInt(formData.get("communication"), 10),
        safety: parseInt(formData.get("safety"), 10),
        problemSolving: parseInt(formData.get("problemSolving"), 10),
      },
      feedback: formData.get("feedback"),
    };
  
    console.log("Submitting Evaluation Data:", evaluationData); // Debugging line
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated. Please log in.');
  
      const response = await fetch(`/api/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(evaluationData),
      });
  
      if (response.ok) {
        alert('Evaluation submitted successfully.');
        closeModal();
      } else {
        const result = await response.json();
        console.error("Server Error:", result); // Debugging line
        setErrorMessage(result.message || 'Failed to submit evaluation.');
      }
    } catch (error) {
      console.error("Submission Error:", error); // Debugging line
      setErrorMessage('An error occurred while submitting the evaluation.');
    }
  };
  
  

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const method = following[userId] ? 'DELETE' : 'POST';
      await fetch(`/api/users/follow/${userId}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      setFollowing((prev) => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error) {
      console.error('Erro ao seguir/desseguir o usuário:', error);
    }
  };
  

  const renderProfile = (profile) => {
    const profileName = profile.userId.name || profile.username || 'User';

    return (
      <div key={profile.userId._id || profile.userId} className="user-result">
        <h2>{profileName}'s Profile</h2>
        <p><strong>Email:</strong> {profile.userId.email || 'Not provided'}</p>
        <p><strong>Location:</strong> {profile.userId.location || 'Not provided'}</p>
        <p><strong>Specialties:</strong> {profile.specialties || 'Not provided'}</p>
        <p><strong>Years of Experience:</strong> {profile.experienceYears || 'Not provided'}</p>
        <button onClick={() => handleEvaluateClick(profile)}>Evaluate</button>
        <button onClick={() => handleFollow(profile.userId._id)}>
          {following[profile.userId._id] ? 'Unfollow' : 'Follow'}
        </button>

        {profile.type === 'professional' && (
          <>
            <p><strong>Average Rating:</strong> {profile.averageRating || 'Not rated yet'}</p>
          </>
        )}
      </div>
    );
  };

  const renderEvaluationModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Evaluate User</h2>
        <form onSubmit={handleSubmitEvaluation}>
          <div>
            <label>Select a Project</label>
            <select name="projectId" required>
              <option value="">-- Select a Project --</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectTitle}
                </option>
              ))}
            </select>
          </div>
          {/* Evaluation Fields */}
          <div className="form-group">
            <div className="half-width">
              <label>Quality of Work</label>
              <input type="number" name="qualityOfWork" min="1" max="10" required />
            </div>
            <div className="half-width">
              <label>Punctuality</label>
              <input type="number" name="punctuality" min="1" max="10" required />
            </div>
          </div>
          <div className="form-group">
            <div className="half-width">
              <label>Communication</label>
              <input type="number" name="communication" min="1" max="10" required />
            </div>
            <div className="half-width">
              <label>Safety</label>
              <input type="number" name="safety" min="1" max="10" required />
            </div>
          </div>
          <div className="form-group">
            <div className="half-width">
              <label>Problem Solving</label>
              <input type="number" name="problemSolving" min="1" max="10" required />
            </div>
            <div className="half-width">
              <label>Feedback</label>
              <textarea name="feedback" required />
            </div>
          </div>
          <button type="submit">Submit Evaluation</button>
          <button type="button" onClick={closeModal}>Cancel</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="search-users-section">
      <h3>Search Users</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by username"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
          aria-label="Search for users by username"
        />
        <FaSearch className="search-icon" />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : errorMessage ? (
        <p className="error-message">{errorMessage}</p>
      ) : (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((profile) => renderProfile(profile))
          ) : (
            <p>No users found matching "{searchQuery}".</p>
          )}
        </div>
      )}

      {/* Renderiza o modal se estiver aberto */}
      {isModalOpen && renderEvaluationModal()}
    </div>
  );
};

export default SearchUsersSection;