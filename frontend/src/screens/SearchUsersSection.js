import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa'; // Icon for the search input
import '../styles/SearchUser.css';

const SearchUsersSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]); // Estado para armazenar os projetos

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

      const response = await fetch(`/api/users/professionals?username=${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setSearchResults(result);
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

  // Função para abrir o modal de avaliação e buscar projetos
  const handleEvaluateClick = (profile) => {
    const userId = profile.userId._id ? profile.userId._id.toString() : profile.userId.toString();
    setIsModalOpen(true); // Abre o modal

    // Busca os projetos do usuário selecionado
    fetchUserProjects(userId);
  };

  // Função para buscar os projetos do usuário
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
        setProjects([]); // Limpa os projetos caso a busca falhe
        setErrorMessage(result.message || 'Failed to fetch projects.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while fetching projects.');
      setProjects([]);
    }
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setProjects([]); // Limpa os projetos ao fechar o modal
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
        <h2>Avaliar Usuário</h2>
        <form>
          <div>
            <label>Selecione um Projeto</label>
            <select required>
              <option value="">-- Selecione um Projeto --</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectTitle}
                </option>
              ))}
            </select>
          </div>
          {/* Campos de avaliação */}
          <div>
            <label>qualityOfWork</label>
            <input type="number" min="1" max="10" required />
          </div>
          <div>
            <label>punctuality</label>
            <input type="number" min="1" max="10" required />
          </div>
          <div>
            <label>communication</label>
            <input type="number" min="1" max="10" required />
          </div>
          <div>
            <label>safety</label>
            <input type="number" min="1" max="10" required />
          </div>
          <div>
            <label>problemSolving</label>
            <input type="number" min="1" max="10" required />
          </div>
          <div>
            <label>Feedback</label>
            <textarea required />
          </div>
          <button type="submit">Enviar Avaliação</button>
          <button type="button" onClick={closeModal}>Cancelar</button>
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
