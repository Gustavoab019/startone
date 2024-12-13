const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
 {
   userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true,
   },
   type: {
     type: String,
     enum: ["important", "informative", "invitation"],
     default: "informative",
   },
   message: {
     type: String,
     required: true,
   },
   invitationStatus: { // Novo campo
     type: String,
     enum: ["pending", "accepted", "rejected"],
     default: "pending"
   },
   relatedEntity: {
     entityId: {
       type: mongoose.Schema.Types.ObjectId,
       required: false,
     },
     entityType: {
       type: String,
       enum: ["project", "company", "employee", "user", "invitation"],
       required: false,
     },
   },
   isRead: {
     type: Boolean,
     default: false,
   },
   metadata: {
     key: { type: String },
     value: { type: mongoose.Schema.Types.Mixed },
   },
   createdAt: { type: Date, default: Date.now },
   updatedAt: { type: Date, default: Date.now },
 },
 {
   timestamps: true,
 }
);

// Verificar se o modelo já existe antes de registrá-lo
const Notification =
 mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

module.exports = Notification;