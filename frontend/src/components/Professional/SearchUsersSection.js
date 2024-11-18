import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, MessageCircle, Calendar, Briefcase } from 'lucide-react';
import styles from './styles.module.css';

const ProfileCard = ({ profile, following, onFollow, onEvaluate }) => {
  const profileName = profile.userId.name || profile.username || 'User';
  const averageRating = profile.averageRating || 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.profileInfo}>
          <h2 className={styles.name}>{profileName}</h2>
          <div className={styles.rating}>
            <Star className={styles.starIcon} />
            <span>{averageRating.toFixed(1)} · Professional</span>
          </div>
        </div>
        <button
          className={`${styles.followButton} ${following[profile.userId._id] ? styles.following : ''}`}
          onClick={() => onFollow(profile.userId._id)}
        >
          {following[profile.userId._id] ? 'Following' : 'Follow'}
        </button>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <Briefcase className={styles.icon} />
            <span>{profile.experienceYears} years of experience</span>
          </div>
          <div className={styles.detailItem}>
            <Calendar className={styles.icon} />
            <span>Available for projects</span>
          </div>
          <p><strong>Location:</strong> {profile.userId.location || 'Not provided'}</p>
          <p><strong>Specialties:</strong> {profile.specialties || 'Not provided'}</p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.primaryButton}>
          <MessageCircle className={styles.icon} />
          Contact
        </button>
        <button 
          className={styles.secondaryButton}
          onClick={() => onEvaluate(profile)}
        >
          Evaluate
        </button>
      </div>
    </div>
  );
};

const EvaluationModal = ({ isOpen, onClose, projects, onSubmit }) => (
  <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2>Evaluate Professional</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <form onSubmit={onSubmit} className={styles.evaluationForm}>
        <div className={styles.formGroup}>
          <label>Select Project</label>
          <select name="projectId" required className={styles.select}>
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectTitle}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.evaluationGrid}>
          {['qualityOfWork', 'punctuality', 'communication', 'safety', 'problemSolving'].map((category) => (
            <div key={category} className={styles.formGroup}>
              <label>{category.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type="number"
                name={category}
                min="1"
                max="10"
                required
                className={styles.input}
              />
            </div>
          ))}
        </div>

        <div className={styles.formGroup}>
          <label>Feedback</label>
          <textarea 
            name="feedback" 
            required 
            className={styles.textarea}
            rows="4"
          />
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.primaryButton}>
            Submit Evaluation
          </button>
        </div>
      </form>
    </div>
  </div>
);

const SearchUsersSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [following, setFollowing] = useState({});

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated. Please log in.');

      const response = await fetch(`/api/users/professionals?username=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (response.ok) {
        setSearchResults(result);
        const followingStatus = {};
        result.forEach((user) => {
          followingStatus[user.userId._id] = user.isFollowing;
        });
        setFollowing(followingStatus);
      } else {
        throw new Error(result.message || 'Failed to fetch users.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(searchUsers, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const handleEvaluateClick = async (profile) => {
    const userId = profile.userId._id?.toString() || profile.userId.toString();
    setSelectedUserId(userId);
    setIsModalOpen(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        setProjects(result);
      } else {
        throw new Error(result.message || 'Failed to fetch projects.');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setProjects([]);
    }
  };

  const handleSubmitEvaluation = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      setErrorMessage('Please select a user to evaluate.');
      return;
    }

    const formData = new FormData(event.target);
    const evaluationData = {
      evaluated: selectedUserId,
      project: formData.get("projectId"),
      categories: {
        qualityOfWork: parseInt(formData.get("qualityOfWork"), 10),
        punctuality: parseInt(formData.get("punctuality"), 10),
        communication: parseInt(formData.get("communication"), 10),
        safety: parseInt(formData.get("safety"), 10),
        problemSolving: parseInt(formData.get("problemSolving"), 10),
      },
      feedback: formData.get("feedback"),
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(evaluationData),
      });

      if (response.ok) {
        alert('Evaluation submitted successfully.');
        setIsModalOpen(false);
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to submit evaluation.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const method = following[userId] ? 'DELETE' : 'POST';
      await fetch(`/api/users/follow/${userId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    } catch (error) {
      setErrorMessage('Failed to update follow status.');
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.searchContainer}>
        <h2 className={styles.title}>Search Professionals</h2>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by username"
            className={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : errorMessage ? (
        <div className={styles.error}>{errorMessage}</div>
      ) : (
        <div className={styles.resultsGrid}>
          {searchResults.length > 0 ? (
            searchResults.map((profile) => (
              <ProfileCard
                key={profile.userId._id || profile.userId}
                profile={profile}
                following={following}
                onFollow={handleFollow}
                onEvaluate={handleEvaluateClick}
              />
            ))
          ) : searchQuery && (
            <div className={styles.noResults}>
              No users found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}

      <EvaluationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects}
        onSubmit={handleSubmitEvaluation}
      />
    </div>
  );
};

export default SearchUsersSection;