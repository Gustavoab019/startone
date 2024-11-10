import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/profileSection.css';

const ProfileSection = ({ 
  profile, 
  handleInputChange, 
  updateProfile, 
  isSubmitting, 
  updateMessage 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleUpdateProfile = async () => {
    try {
      toast.info('Updating profile...', { autoClose: 1500 });
      await updateProfile();
      toast.success('Profile updated successfully!', { autoClose: 3000 });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile. Please try again.', { autoClose: 3000 });
    }
  };

  const fetchFollowers = async () => {
    if (isLoadingFollowers) return;

    setIsLoadingFollowers(true);
    try {
      if (!profile?.userId) {
        throw new Error('Profile ID is undefined');
      }

      const response = await fetch(`${API_URL}/users/${profile.userId}/followers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFollowers(data.followers);
      setIsFollowersModalOpen(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('An error occurred while fetching followers.');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const getProfileImageUrl = () => {
    return profile?.profileImage 
      ? `/assets/images/${profile.profileImage}` 
      : '';
  };

  const startEditing = () => {
    setOriginalProfile({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    handleInputChange({ target: { name: 'name', value: originalProfile.name } });
    handleInputChange({ target: { name: 'username', value: originalProfile.username } });
    handleInputChange({ target: { name: 'location', value: originalProfile.location } });
    setIsEditing(false);
  };

  const renderProfessionalProfile = () => (
    <>
      <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
      <p><strong>Specialties:</strong> {profile.specialties?.length > 0 
        ? profile.specialties.join(', ') 
        : 'Not provided'}
      </p>
      <p><strong>Years of Experience:</strong> {profile.experienceYears || 'Not provided'}</p>
      <p><strong>Average Rating:</strong> {profile.rating || 'Not rated yet'}</p>
    </>
  );

  const renderClientProfile = () => (
    <>
      <p><strong>Hiring History:</strong> {profile.hiringHistory?.length > 0 
        ? profile.hiringHistory.join(', ') 
        : 'No history available'}</p>
      <p><strong>Reviews Given:</strong> {profile.reviewsGiven?.length > 0 
        ? profile.reviewsGiven.join(', ') 
        : 'No reviews available'}</p>
    </>
  );

  const renderCompanyProfile = () => (
    <>
      <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
      <p><strong>Services Offered:</strong> {profile.services?.length > 0 
        ? profile.services.join(', ') 
        : 'Not provided'}</p>
      <p><strong>Employees:</strong> {profile.employees?.length > 0 
        ? profile.employees.join(', ') 
        : 'No employees listed'}</p>
    </>
  );

  return (
    <div className="profile-section">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <div className="profile-header">
        <img 
          src={getProfileImageUrl()} 
          alt="Profile" 
          className="profile-image"
          onError={(e) => {
            e.target.src = '../'; //Corrigir importação de img
            e.target.onerror = null;
          }}
        />
        <div className="profile-info">
          <h2>{profile?.type === 'company' ? profile.companyName : profile.name}</h2>
          <p>{profile?.title || 'Professional'}</p>
          <p className="location">{profile?.location}</p>
          {profile?.followersCount !== undefined && (
            <p 
              className="followers-count" 
              onClick={() => !isFollowersModalOpen && fetchFollowers()} 
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLoadingFollowers ? 'Loading...' : `${profile.followersCount} Followers`}
            </p>
          )}
        </div>
        <button className="edit-button" onClick={startEditing}>Edit Profile</button>
      </div>

      <section className="profile-details">
        {profile?.type === 'professional' && renderProfessionalProfile()}
        {profile?.type === 'client' && renderClientProfile()}
        {profile?.type === 'company' && renderCompanyProfile()}
      </section>

      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={profile?.name || ''}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={profile?.username || ''}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={profile?.location || ''}
              onChange={handleInputChange}
            />
            <h4>Update Password</h4>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={profile?.password || ''}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={profile?.confirmPassword || ''}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            <div className="modal-buttons">
              <button className="action-button" onClick={handleUpdateProfile} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
              <button className="cancel-button" onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isFollowersModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Followers</h3>
            <ul>
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <li key={follower._id}>
                    {follower.name} ({follower.username})
                  </li>
                ))
              ) : (
                <p>No followers available</p>
              )}
            </ul>
            <button className="action-button" onClick={() => setIsFollowersModalOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {updateMessage && <p className="message">{updateMessage}</p>}
    </div>
  );
};

export default ProfileSection;
