const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true }, // Nome da empresa
    servicesOffered: { type: [String], required: true }, // Serviços oferecidos pela empresa
    employeeList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProfessionalProfile' }], // Lista de funcionários (profissionais associados)
    companyRating: { type: Number, min: 1, max: 10, default: 5 } // Avaliação média da empresa
}, { timestamps: true });

const CompanyProfileModel = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfileModel;
