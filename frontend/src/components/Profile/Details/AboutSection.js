import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Loader } from 'lucide-react';
import styles from './styles.module.css';

const AboutSection = ({ about, onBioUpdate }) => {
  const { bio: initialBio = 'Nenhuma descrição disponível.' } = about || {};

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
    if (!editedBio.trim()) {
      setError('A descrição não pode estar vazia.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/users/profile/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bio: editedBio }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar a bio');
      }

      const data = await response.json();
      setBio(data.profile.bio);
      setIsEditing(false);
      
      // Se houver uma função de callback para atualização
      if (onBioUpdate) {
        onBioUpdate(data.profile.bio);
      }
    } catch (error) {
      setError('Erro ao salvar. Tente novamente.');
      console.error('Erro ao salvar a bio:', error);
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
            placeholder="Digite sua bio..."
            disabled={isSaving}
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
              disabled={isSaving || !editedBio.trim()}
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
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </section>
  );
};

export default AboutSection;