import React from "react";
import NotificationItem from "./NotificationItem";
import styles from "./styles.module.css";

const NotificationList = React.memo(({ 
  notifications, 
  onMarkAsRead,
  onRespondToInvitation,
  loading 
}) => {
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nenhuma notificação encontrada.</p>
      </div>
    );
  }

  return (
    <div className={styles.notificationList}>
      {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
        <div key={date} className={styles.notificationGroup}>
          <div className={styles.dateHeader}>{date}</div>
          {dateNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onRespondToInvitation={onRespondToInvitation}
              loading={loading}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

export default NotificationList;