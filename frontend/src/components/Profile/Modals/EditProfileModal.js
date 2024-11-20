import React from 'react';
import styles from './styles.module.css';

const EditProfileModal = ({ profile, isSubmitting, handleInputChange, handleUpdate, onCancel }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.modalTitle}>Edit Profile</h3>
      
      {/* Campo para Nome */}
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={profile?.name || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      
      {/* Campo para Username */}
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={profile?.username || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      
      {/* Campo para Localização */}
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={profile?.location || ''}
        onChange={handleInputChange}
        className={styles.input}
      />
      
      {/* Campo para Atualizar Senha */}
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
      
      {/* Botões de Ação */}
      <div className={styles.buttonGroup}>
        <button 
          className={styles.primaryButton} 
          onClick={handleUpdate} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Save Changes'}
        </button>
        <button 
          className={styles.cancelButton} 
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default EditProfileModal;
