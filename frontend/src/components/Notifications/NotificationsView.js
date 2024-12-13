import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import NotificationList from "./NotificationList";
import styles from "./styles.module.css";
import { toast } from 'react-toastify';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const { data } = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(data.data.notifications);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error.message);
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Auto refresh a cada 30 segundos
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      toast.error("Erro ao marcar notificação como lida");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvitationResponse = async (notificationId, response) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      
      const invitation = notifications.find(n => n._id === notificationId)?.relatedEntity?.entityId;
      
      if (!invitation) {
        throw new Error("Convite não encontrado");
      }
  
      await axios.post(
        `/api/employee/invitations/${invitation}/respond`,
        { response },
        { headers: { Authorization: `Bearer ${token}` }}
      );
  
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, invitationStatus: response === "accept" ? "accepted" : "rejected" }
            : notif
        )
      );
  
      toast.success(
        response === "accept" 
          ? "Convite aceito com sucesso!" 
          : "Convite rejeitado com sucesso!"
      );

      // Recarregar notificações após resposta
      await fetchNotifications();
    } catch (error) {
      console.error("Erro ao responder convite:", error.message);
      toast.error("Erro ao responder ao convite. Tente novamente.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.spinner} />
        <p>Carregando notificações...</p>
      </div>
    );
  }

  return (
    <div className={styles.notificationsPage}>
      <div className={styles.header}>
        <h1 className={styles.notificationsTitle}>
          Notificações
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className={styles.badge}>
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </h1>
        <button 
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={refreshing || actionLoading}
        >
          {refreshing ? (
            <>
              <span className={styles.spinner} />
              Atualizando...
            </>
          ) : (
            'Atualizar'
          )}
        </button>
      </div>
      
      <NotificationList
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onRespondToInvitation={handleInvitationResponse}
        loading={actionLoading}
      />
    </div>
  );
};

export default NotificationsView;