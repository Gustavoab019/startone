import React from 'react';
import styles from './styles.module.css';

const Modal = ({ onClose, children }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <div className={styles.modalContent}>{children}</div>
    </div>
  </div>
);

export default Modal;
