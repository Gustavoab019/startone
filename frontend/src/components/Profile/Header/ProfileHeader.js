import React from 'react';
import { MapPin, User, Edit2, Star, BadgeCheck } from 'lucide-react';
import styles from './styles.module.css';

const ProfileHeader = ({
  profile = {},
  onEdit,
  onFollowToggle,
  isFollowing = false,
  onShowFollowers,
}) => {
  const {
    name = 'João Silva',
    location = 'São Paulo, SP',
    followersCount = 0,
    followingCount = 0,
    averageRating = 0,
    projectsCount = 0,
    specialties = [],
    experience = 0,
    verified = false,
    image = '',
  } = profile;

  return (
    <header className={styles.header}>
      {/* Container da Imagem */}
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          {image ? (
            <img
              src={image}
              alt={`${name}'s profile`}
              className={styles.image}
              onError={(e) => {
                e.target.src = '';
                e.target.onerror = null;
              }}
            />
          ) : (
            <div className={styles.fallbackIcon}>
              <User size={48} />
            </div>
          )}
          {verified && (
            <div className={styles.verifiedBadge}>
              <BadgeCheck size={16} />
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
      </div>

      {/* Container das Informações */}
      <div className={styles.info}>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{name}</h1>
          {verified && (
            <span className={styles.verifiedTag}>
              <BadgeCheck size={14} />
              Profissional Verificado
            </span>
          )}
        </div>

        <div className={styles.locationContainer}>
          <MapPin size={16} />
          <span>{location}</span>
          {experience > 0 && (
            <>
              <span className={styles.dot}>•</span>
              <span>{experience} anos de experiência</span>
            </>
          )}
        </div>

        {specialties.length > 0 && (
          <div className={styles.specialties}>
            {specialties.map((specialty, index) => (
              <span key={index} className={styles.specialty}>
                {specialty}
              </span>
            ))}
          </div>
        )}

        <div className={styles.metrics}>
          <div className={styles.rating}>
            <Star size={20} className={styles.starIcon} />
            <span className={styles.ratingValue}>
              {averageRating.toFixed(1)}
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{followersCount}</span>
              <span className={styles.statLabel}>Seguidores</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{followingCount}</span>
              <span className={styles.statLabel}>Seguindo</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{projectsCount}</span>
              <span className={styles.statLabel}>Projetos</span>
            </div>
          </div>
        </div>
      </div>

      <button
        className={`${styles.followButton} ${
          isFollowing ? styles.following : ''
        }`}
        onClick={onFollowToggle}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
    </header>
  );
};

export default ProfileHeader;