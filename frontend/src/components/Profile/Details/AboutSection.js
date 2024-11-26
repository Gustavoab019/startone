import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Loader } from 'lucide-react';
import styles from '../Details/styles/about.module.css';

const AboutSection = ({ about, onBioUpdate }) => {
  // Usando um valor padrão mais profissional
  const { bio: initialBio = 'Compartilhe um pouco sobre você e sua experiência profissional.' } = about || {};

  const [bio, setBio] = useState(initialBio);
  const [editedBio, setEditedBio] = useState(initialBio);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBio(initialBio);
    setEditedBio(initialBio);
  }, [initialBio]);

  const handleSave = async () => {
    const trimmedBio = editedBio.trim();
    
    if (!trimmedBio) {
      setError('A descrição não pode estar vazia.');
      return;
    }

    if (trimmedBio === bio) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: trimmedBio }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar a bio');
      }

      const data = await response.json();
      setBio(data.profile.bio);
      setIsEditing(false);

      if (onBioUpdate) {
        onBioUpdate(data.profile.bio);
      }
    } catch (error) {
      console.error('Erro ao salvar a bio:', error);
      setError('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedBio(bio);
    setIsEditing(false);
    setError(null);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEditedBio(value);
    if (error) setError(null);
  };

  return (
    <section className={styles.aboutSection}>
      <h2 className={styles.sectionTitle}>
        Sobre
      </h2>

      {isEditing ? (
        <div className={styles.editContainer}>
          <textarea
            className={`${styles.textarea} ${error ? styles.error : ''}`}
            value={editedBio}
            onChange={handleChange}
            maxLength={500}
            placeholder="Compartilhe sua experiência profissional, habilidades e objetivos..."
            disabled={isSaving}
            autoFocus
          />

          <div className={styles.charCount}>
            {editedBio.length}/500 caracteres
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.editActions}>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={isSaving || !editedBio.trim() || editedBio.trim() === bio}
            >
              {isSaving ? (
                <>
                  <Loader className={styles.spinner} size={16} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar
                </>
              )}
            </button>
            <button
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isSaving}
              type="button"
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.bioContainer}>
          <p className={styles.bio}>
            {bio}
          </p>
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
            aria-label="Editar descrição"
            type="button"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </section>
  );
};

export default AboutSection;