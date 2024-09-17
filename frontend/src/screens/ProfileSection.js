import React from 'react';

const ProfileSection = ({ profile, handleInputChange, updateProfile, isSubmitting, updateMessage }) => (
  <div className="profile-section">
    <h2>{profile.name}'s Profile</h2>
    <p>Email: {profile.email}</p>
    
    <h3>Update Password</h3>
    <input
      type="password"
      name="password"
      placeholder="New Password"
      value={profile.password || ''}
      onChange={handleInputChange}
    />
    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm Password"
      value={profile.confirmPassword || ''}
      onChange={handleInputChange}
    />
    <button className="action-button" onClick={updateProfile} disabled={isSubmitting}>
      Update Profile
    </button>
    {updateMessage && <p className="message">{updateMessage}</p>}
  </div>
);

export default ProfileSection;
