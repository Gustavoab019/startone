import React from 'react';

const ProfileSection = ({ profile, handleInputChange, updateProfile, isSubmitting, updateMessage }) => {
  const renderProfessionalProfile = () => (
    <>
      <p>Location: {profile.location || 'Not provided'}</p>
      <p>Specialties: {profile.specialties && profile.specialties.length > 0 ? profile.specialties.join(', ') : 'Not provided'}</p>
      <p>Years of Experience: {profile.experienceYears || 'Not provided'}</p>
      <p>Average Rating: {profile.averageRating || 'Not rated yet'}</p>
    </>
  );

  const renderClientProfile = () => (
    <>
      <p>Hiring History: {profile.hiringHistory && profile.hiringHistory.length > 0 ? profile.hiringHistory.join(', ') : 'No history available'}</p>
      <p>Reviews Given: {profile.reviewsGiven && profile.reviewsGiven.length > 0 ? profile.reviewsGiven.join(', ') : 'No reviews available'}</p>
    </>
  );

  const renderCompanyProfile = () => (
    <>
      <p>Location: {profile.companyDetails.location || 'Not provided'}</p>
      <p>Services Offered: {profile.companyDetails.services && profile.companyDetails.services.length > 0 ? profile.companyDetails.services.join(', ') : 'Not provided'}</p>
      <p>Employees: {profile.employees && profile.employees.length > 0 ? profile.employees.join(', ') : 'No employees listed'}</p>
    </>
  );

  return (
    <div className="profile-section">
      <h2>{profile.type === 'company' ? profile.companyDetails.companyName : profile.name}'s Profile</h2>
      <p>Email: {profile.email}</p>

      {profile.type === 'professional' && renderProfessionalProfile()}
      {profile.type === 'client' && renderClientProfile()}
      {profile.type === 'company' && renderCompanyProfile()}

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
};

export default ProfileSection;
