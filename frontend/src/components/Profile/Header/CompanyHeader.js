import React from 'react';
import { MapPin, User, Star, Briefcase, Loader2 } from 'lucide-react';
import styles from './styles.module.css';

const LoadingSpinner = () => (
  <div className={styles.spinnerContainer}>
    <Loader2 className={styles.spinner} />
  </div>
);

const CompanyHeader = ({ profile, isLoading = false }) => {
  const {
    name = 'Nome da empresa não disponível',
    location = 'Localização não informada',
    followersCount = 0,
    followingCount = 0,
    employeeList = 0,
    servicesOffered = [],
    companyRating = 0,
  } = profile || {};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              {isLoading ? (
                <div className={styles.fallbackIcon}>
                  <LoadingSpinner />
                </div>
              ) : (
                <div className={styles.fallbackIcon}>
                  <User size={48} />
                </div>
              )}
            </div>
          </div>

          <div className={styles.mainInfo}>
            <div className={styles.nameContainer}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <h1 className={styles.name}>{name}</h1>
              )}
            </div>

            <div className={styles.locationContainer}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <MapPin size={16} />
                  <span>{location}</span>
                </>
              )}
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : servicesOffered.length > 0 ? (
              <div className={styles.specialties}>
                {servicesOffered.map((service, index) => (
                  <span key={index} className={styles.specialty}>
                    <Briefcase size={14} /> {service}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.statsSection}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className={styles.rating}>
                <Star className={styles.starIcon} size={20} />
                <span className={styles.ratingValue}>
                  {Number(companyRating).toFixed(1)}
                </span>
              </div>

              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {isLoading ? '...' : followersCount}
                  </span>
                  <span className={styles.statLabel}>Seguidores</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {isLoading ? '...' : followingCount}
                  </span>
                  <span className={styles.statLabel}>Seguindo</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {isLoading ? '...' : employeeList.length}
                  </span>
                  <span className={styles.statLabel}>Funcionários</span>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  );
};

export default CompanyHeader;