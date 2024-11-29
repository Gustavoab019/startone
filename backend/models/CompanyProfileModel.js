const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID do administrador
    companyName: { type: String, required: true }, // Nome da empresa
    email: { type: String, required: true }, // Email de contato
    phone: { type: String }, // Telefone opcional
    location: { type: String, required: true }, // Localização (cidade/estado)
    servicesOffered: { type: [String], required: true }, // Serviços oferecidos pela empresa
    employeeList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalProfile' }], // Lista de funcionários
    companyRating: { type: Number, min: 1, max: 10, default: 5 }, // Avaliação média da empresa
    logo: { type: String }, // URL do logotipo
    description: { type: String, maxlength: 500 }, // Breve descrição da empresa
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], // Projetos associados
    reviews: [{
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 10 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }], // Histórico de avaliações
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Lista de seguidores
}, { timestamps: true });

const CompanyProfileModel = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfileModel;
