const mongoose = require("mongoose");
const Notification = require("../models/NotificationModel");


// Rota: Listar notificações para o usuário logado
exports.getNotifications = async (req, res) => {
    try {
        const { _id: userId } = req.user; // Obtém o userId a partir do middleware
        const { page = 1, limit = 10, type, isRead } = req.query;

        // Configuração de consulta base
        const query = { userId };

        // Adicionar filtros opcionais
        if (type) query.type = type;
        if (isRead !== undefined) query.isRead = isRead === "true";

        // Garantir que page e limit sejam números válidos
        const pageNum = Math.max(parseInt(page), 1); // Página mínima é 1
        const limitNum = Math.max(parseInt(limit), 1); // Limite mínimo é 1

        // Buscar notificações com paginação
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 }) // Ordenar notificações mais recentes primeiro
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        // Contar o total de notificações que atendem à query
        const total = await Notification.countDocuments(query);

        // Retornar dados com sucesso
        res.status(200).json({
            status: "success",
            data: {
                notifications,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Erro ao buscar notificações:", error.message);
        res.status(500).json({
            status: "error",
            message: "Erro ao buscar notificações.",
            error: error.message,
        });
    }
};


// Marcar notificação como lida
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { _id: userId } = req.user; // Obtém o userId a partir do middleware
        const { id } = req.params; // ID da notificação

        // Verificar se o ID da notificação é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ status: "error", message: "ID inválido." });
        }

        // Buscar a notificação com base no ID e no userId
        const notification = await Notification.findOne({ _id: id, userId });

        // Verificar se a notificação foi encontrada
        if (!notification) {
            return res.status(404).json({ status: "error", message: "Notificação não encontrada." });
        }

        // Atualizar o status da notificação para lida
        notification.isRead = true;
        await notification.save();

        // Retornar resposta de sucesso
        res.status(200).json({
            status: "success",
            message: "Notificação marcada como lida.",
            data: notification,
        });
    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error.message);
        res.status(500).json({
            status: "error",
            message: "Erro ao marcar notificação como lida.",
            error: error.message,
        });
    }
};
