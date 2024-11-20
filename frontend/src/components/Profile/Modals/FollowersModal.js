import React from 'react';
import styles from './styles.module.css';

const FollowersModal = ({ followers, onClose }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h3 className={styles.modalTitle}>Followers</h3>
      <ul className={styles.followersList}>
        {followers.length > 0 ? (
          followers.map(follower => (
            <li key={follower._id} className={styles.followerItem}>
              {follower.name} ({follower.username})
            </li>
          ))
        ) : (
          <p>No followers available</p>
        )}
      </ul>
      <button className={styles.primaryButton} onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

export default FollowersModal;
