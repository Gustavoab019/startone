import React from "react";
import styles from "./styles.module.css";

const NotificationItem = React.memo(({ 
  notification, 
  onMarkAsRead, 
  onRespondToInvitation,
  loading 
}) => {
  const { _id, message, createdAt, isRead, type, invitationStatus } = notification;
  
  const showResponseButtons = type === "invitation" && invitationStatus === "pending";

  const handleResponse = (response) => {
    const action = response === "accept" ? "aceitar" : "rejeitar";
    if (window.confirm(`Tem certeza que deseja ${action} este convite?`)) {
      onRespondToInvitation(_id, response);
    }
  };

  return (
    <div className={`${styles.notificationItem} ${isRead ? styles.read : styles.unread}`}>
      <div className={styles.notificationContent}>
        <p className={styles.notificationMessage}>{message}</p>
        <small className={styles.notificationDate}>
          {new Date(createdAt).toLocaleString()}
        </small>
      </div>

      <div className={styles.notificationActions}>
        {!isRead && (
          <button 
            onClick={() => onMarkAsRead(_id)}
            className={styles.markAsReadButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Processando...
              </>
            ) : (
              'Marcar como lida'
            )}
          </button>
        )}

        {showResponseButtons && (
          <div className={styles.responseButtons}>
            <button
              onClick={() => handleResponse("accept")}
              className={`${styles.acceptButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Processando...
                </>
              ) : (
                'Aceitar'
              )}
            </button>
            <button
              onClick={() => handleResponse("reject")}
              className={`${styles.rejectButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Processando...
                </>
              ) : (
                'Rejeitar'
              )}
            </button>
          </div>
        )}

        {type === "invitation" && invitationStatus && invitationStatus !== "pending" && (
          <div className={`${styles.responseStatus} ${styles[invitationStatus]}`}>
            {invitationStatus === "accepted" ? "Convite aceito" : "Convite rejeitado"}
          </div>
        )}
      </div>
    </div>
  );
});

export default NotificationItem;