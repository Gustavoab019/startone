import React from 'react';

const ProfileSection = ({ 
  profile, 
  handleInputChange, 
  updateProfile, 
  isSubmitting, 
  updateMessage 
}) => {

  // Renderiza o perfil do profissional
  const renderProfessionalProfile = () => (
    <>
      <p>Location: {profile.location || 'Not provided'}</p>
      <p>Specialties: {profile.specialties && profile.specialties.length > 0 
        ? profile.specialties.join(', ') 
        : 'Not provided'}
      </p>
      <p>Years of Experience: {profile.experienceYears || 'Not provided'}</p>
      <p>Average Rating: {profile.rating || 'Not rated yet'}</p>
    </>
  );

  // Renderiza o perfil do cliente
  const renderClientProfile = () => (
    <>
      <p>Hiring History: {profile.hiringHistory && profile.hiringHistory.length > 0 
        ? profile.hiringHistory.join(', ') 
        : 'No history available'}
      </p>
      <p>Reviews Given: {profile.reviewsGiven && profile.reviewsGiven.length > 0 
        ? profile.reviewsGiven.join(', ') 
        : 'No reviews available'}
      </p>
    </>
  );

  // Renderiza o perfil da empresa
  const renderCompanyProfile = () => (
    <>
      <p>Location: {profile.location || 'Not provided'}</p>
      <p>Services Offered: {profile.services && profile.services.length > 0 
        ? profile.services.join(', ') 
        : 'Not provided'}
      </p>
      <p>Employees: {profile.employees && profile.employees.length > 0 
        ? profile.employees.join(', ') 
        : 'No employees listed'}
      </p>
    </>
  );

  return (
    <div className="profile-section">
      {/* Verifica o tipo de perfil para exibir o nome correto */}
      <h2>{profile.type === 'company' ? profile.companyName : profile.name}'s Profile</h2>
      <p>Email: {profile.email}</p>

      {/* Exibe o número de seguidores, se estiver disponível */}
      {profile.followersCount !== undefined && (
        <p>Followers: {profile.followersCount}</p>
      )}

      {/* Renderiza o perfil conforme o tipo de usuário */}
      {profile.type === 'professional' && renderProfessionalProfile()}
      {profile.type === 'client' && renderClientProfile()}
      {profile.type === 'company' && renderCompanyProfile()}

      {/* Seção de atualização de senha */}
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
        {isSubmitting ? 'Updating...' : 'Update Profile'}
      </button>

      {/* Mensagem de atualização */}
      {updateMessage && <p className="message">{updateMessage}</p>}
    </div>
  );
};

export default ProfileSection;
