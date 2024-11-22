import React from 'react';
import { MapPin, User, Edit2, Star } from 'lucide-react';
import styles from './styles.module.css';

const ProfileHeader = ({ profile, onEdit, onFollowToggle, isFollowing, onShowFollowers }) => {
  // Desestruturação das propriedades do perfil
  const {
    name = 'João Silva',
    location = 'São Paulo, SP',
    followersCount = 150,
    followingCount = 30,
    averageRating = 9.5,
    projectsCount = 45, // Valor padrão para evitar falhas
    image = '', // Imagem padrão caso nenhuma seja fornecida
  } = profile || {};

  return (
    <div className={styles.header}>
      {/* Foto de perfil e botão de edição */}
      <div className={styles.imageWrapper}>
        {image ? (
          <img
            src={image}
            alt="Profile"
            className={styles.image}
            onError={(e) => {
              e.target.src = ''; // Substitui por vazio caso ocorra erro no carregamento da imagem
              e.target.onerror = null;
            }}
          />
        ) : (
          <div className={styles.fallbackIcon}>
            <User size={48} />
          </div>
        )}
        <button
          className={styles.editImageButton}
          onClick={onEdit}
          aria-label="Editar Imagem"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {/* Informações do usuário */}
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        <p className={styles.location}>
          <MapPin size={16} />
          <span>{location}</span>
        </p>

        {/* Estatísticas do perfil */}
        <div className={styles.stats}>
          <span className={styles.statItem} onClick={onShowFollowers}>
            <strong>{followersCount}</strong> Seguidores
          </span>
          <span className={styles.statItem}>
            <strong>{followingCount}</strong> Seguindo
          </span>
          <span className={styles.statItem}>
            <Star size={16} className={styles.starIcon} />
            <strong>{averageRating.toFixed(1)}</strong>
          </span>
          <span className={styles.statItem}>
            <strong>{projectsCount}</strong> Projetos
          </span>
        </div>
      </div>

      {/* Botão de seguir/seguindo */}
      <button
        className={`${styles.followButton} ${isFollowing ? styles.following : ''}`}
        onClick={onFollowToggle}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
    </div>
  );
};

export default ProfileHeader;
