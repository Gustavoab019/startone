const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true }, // Nome completo do cliente
    email: { type: String, required: true }, // E-mail do cliente
    hiringHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // Histórico de contratações
    reviewsGiven: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] // Avaliações fornecidas pelo cliente
}, { timestamps: true });

const ClientProfileModel = mongoose.model('ClientProfile', clientProfileSchema);

module.exports = ClientProfileModel;
