import React from 'react';
import './styles.module.css';

const ProfileDetailsCard = ({ profile }) => {
  if (profile?.type === 'professional') {
    return (
      <div>
        <p><strong>Specialties:</strong> {profile.specialties?.join(', ') || 'Not provided'}</p>
        <p><strong>Experience:</strong> {profile.experienceYears || 'Not provided'}</p>
        <p><strong>Rating:</strong> {profile.averageRating || 'Not rated yet'}</p>
      </div>
    );
  }

  if (profile?.type === 'company') {
    return (
      <div>
        <p><strong>Services:</strong> {profile.services?.join(', ') || 'Not provided'}</p>
        <p><strong>Employees:</strong> {profile.employees?.length || 0}</p>
      </div>
    );
  }

  if (profile?.type === 'client') {
    return (
      <div>
        <p><strong>Reviews Given:</strong> {profile.reviewsGiven?.length || 0}</p>
      </div>
    );
  }

  return null;
};

export default ProfileDetailsCard;
