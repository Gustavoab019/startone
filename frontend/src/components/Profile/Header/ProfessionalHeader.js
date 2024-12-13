import React from 'react';
import { MapPin, User, Edit2, Star, BadgeCheck, Loader2 } from 'lucide-react';
import styles from './styles.module.css';

// Componente de carregamento
const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <Loader2 className={styles.spinner} />
  </div>
);

const ProfileHeader = ({
  profile = {},
  onEdit,
  onFollowToggle,
  isFollowing = false,
  onShowFollowers,
  isLoading = false,
}) => {
  // Desestruturação com valores padrão para evitar erros
  const {
    name = 'Usuário sem nome',
    location = 'Local não especificado',
    followersCount = 0,
    followingCount = 0,
    averageRating = 0,
    projectsCount = 0,
    specialties = [],
    companyLink = { companyName: 'Nenhuma empresa vinculada' },
    experience = 0,
    verified = false,
    image = null,
  } = profile;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {/* Seção de perfil */}
        <div className={styles.profileSection}>
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

          <div className={styles.mainInfo}>
            <div className={styles.nameContainer}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <h1 className={styles.name}>{name}</h1>
                  {verified && (
                    <span className={styles.verifiedTag}>
                      <BadgeCheck size={14} />
                      Profissional Verificado
                    </span>
                  )}
                </>
              )}
            </div>

            <div className={styles.locationContainer}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MapPin size={16} />
                  <span>{location}</span>
                  {experience > 0 && (
                    <>
                      <span className={styles.dot}>•</span>
                      <span>{experience} anos de experiência</span>
                    </>
                  )}
                </>
              )}
            </div>

            {specialties.length > 0 && (
              <div className={styles.specialties}>
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  specialties.map((specialty, index) => (
                    <span key={index} className={styles.specialty}>
                      {specialty}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Seção de estatísticas */}
        <div className={styles.statsSection}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
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

              <div className={styles.companyInfo}>
                <span className={styles.companyName}>{companyLink.companyName}</span>
                <span className={styles.companyLabel}>Empresa Vinculada</span>
              </div>
            </>
          )}
        </div>

        {/* Botão de seguir */}
        <button
          className={`${styles.followButton} ${
            isFollowing ? styles.following : ''
          }`}
          onClick={onFollowToggle}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner /> : isFollowing ? 'Seguindo' : 'Seguir'}
        </button>
      </header>
    </div>
  );
};

export default ProfileHeader;
