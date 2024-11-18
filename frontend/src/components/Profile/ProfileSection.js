import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './styles.module.css';

const ProfileDetailsCard = ({ profile }) => {
  if (profile?.type === 'professional') {
    return (
      <>
        <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
        <p><strong>Specialties:</strong> {profile.specialties?.length > 0 ? profile.specialties.join(', ') : 'Not provided'}</p>
        <p><strong>Experience:</strong> {profile.experienceYears || 'Not provided'}</p>
        <p><strong>Rating:</strong> {profile.rating || 'Not rated yet'}</p>
      </>
    );
  }

  if (profile?.type === 'client') {
    return (
      <>
        <p><strong>Hiring History:</strong> {profile.hiringHistory?.length > 0 ? profile.hiringHistory.join(', ') : 'No history'}</p>
        <p><strong>Reviews:</strong> {profile.reviewsGiven?.length > 0 ? profile.reviewsGiven.join(', ') : 'No reviews'}</p>
      </>
    );
  }

  if (profile?.type === 'company') {
    return (
      <>
        <p><strong>Location:</strong> {profile.location || 'Not provided'}</p>
        <p><strong>Services:</strong> {profile.services?.length > 0 ? profile.services.join(', ') : 'Not provided'}</p>
        <p><strong>Employees:</strong> {profile.employees?.length > 0 ? profile.employees.join(', ') : 'No employees'}</p>
      </>
    );
  }
};

const EditProfileModal = ({ profile, isSubmitting, handleInputChange, handleUpdate, onCancel }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.modalTitle}>Edit Profile</h3>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={profile?.name || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={profile?.username || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={profile?.location || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      <h4 className={styles.modalSubtitle}>Update Password</h4>
      <input
        type="password"
        name="password"
        placeholder="New Password"
        value={profile?.password || ''}
        onChange={handleInputChange}
        className={styles.input}
        autoComplete="new-password"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={profile?.confirmPassword || ''}
        onChange={handleInputChange}
        className={styles.input}
        autoComplete="new-password"
      />
      <div className={styles.buttonGroup}>
        <button 
          className={styles.primaryButton} 
          onClick={handleUpdate} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Save Changes'}
        </button>
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

const FollowersModal = ({ followers, onClose }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.modalTitle}>Followers</h3>
      <ul className={styles.followersList}>
        {followers.length > 0 ? (
          followers.map(follower => (
            <li key={follower._id} className={styles.followerItem}>
              {follower.name} ({follower.username})
            </li>
          ))
        ) : (
          <p>No followers available</p>
        )}
      </ul>
      <button className={styles.primaryButton} onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

const ProfileSection = ({
  profile,
  handleInputChange,
  updateProfile,
  isSubmitting,
  updateMessage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [originalProfile, setOriginalProfile] = useState({});
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      toast.info('Updating profile...', { autoClose: 1500 });
      await updateProfile();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile. Please try again.');
    }
  };

  const fetchFollowers = async () => {
    if (isLoadingFollowers || !profile?.userId) return;

    setIsLoadingFollowers(true);
    try {
      const response = await fetch(`/api/users/${profile.userId}/followers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setFollowers(data.followers);
      setIsFollowersModalOpen(true);
    } catch (error) {
      toast.error('Error fetching followers.');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const startEditing = () => {
    setOriginalProfile({ ...profile });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    ['name', 'username', 'location'].forEach(field => {
      handleInputChange({ target: { name: field, value: originalProfile[field] } });
    });
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <ToastContainer />

        <div className={styles.header}>
        <img
          src="" // ou outro caminho estático para imagem default
          alt="Profile" 
          className={styles.image}
          onError={(e) => {
            e.target.src = '';
            e.target.onerror = null;
          }}
        />
          <div className={styles.info}>
            <h2 className={styles.title}>
              {profile?.type === 'company' ? profile.companyName : profile.name}
            </h2>
            <p className={styles.text}>{profile?.title || 'Professional'}</p>
            <p className={styles.location}>{profile?.location}</p>
            {profile?.followersCount !== undefined && (
              <p
                className={styles.followersCount}
                onClick={() => !isFollowersModalOpen && fetchFollowers()}
              >
                {isLoadingFollowers ? 'Loading...' : `${profile.followersCount} Followers`}
              </p>
            )}
          </div>
          <button className={styles.editButton} onClick={startEditing}>
            Edit Profile
          </button>
        </div>

        <section className={styles.details}>
          <ProfileDetailsCard profile={profile} />
        </section>

        {isEditing && (
          <EditProfileModal
            profile={profile}
            isSubmitting={isSubmitting}
            handleInputChange={handleInputChange}
            handleUpdate={handleUpdateProfile}
            onCancel={cancelEditing}
          />
        )}

        {isFollowersModalOpen && (
          <FollowersModal 
            followers={followers} 
            onClose={() => setIsFollowersModalOpen(false)} 
          />
        )}

        {updateMessage && <p className={styles.message}>{updateMessage}</p>}
      </div>
    </div>
  );
};

export default ProfileSection;