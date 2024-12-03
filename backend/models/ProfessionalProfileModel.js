const mongoose = require('mongoose');

const professionalProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialties: { type: [String], required: true }, // Especialidades do profissional
    certifications: [
        {
            name: { type: String, required: true },           // Nome da Certificação
            institution: { type: String, required: true },    // Instituição emissora
            dateObtained: { type: Date, required: true },     // Data de obtenção
        }
    ], // Certificações obtidas
    portfolio: [
        {
            projectTitle: { type: String, required: true },   // Título do projeto
            description: { type: String, required: true },    // Descrição do projeto
            images: [String], // URLs das imagens do projeto
            completionDate: { type: Date, required: true }    // Data de conclusão do projeto
        }
    ], // Portfólio de trabalhos
    projectsCompleted: { type: Number, default: 0 }, // Número de projetos concluídos
    experienceYears: { type: Number, required: false }, // Anos de experiência
    workHours: { type: String, required: false }, // Horário de trabalho
    availability: { type: Boolean, default: true }, // Disponibilidade do profissional
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProfile',
        default: null, // Pode ser nulo se o profissional não estiver vinculado a nenhuma empresa
      }
      
}, { timestamps: true });

const ProfessionalProfileModel = mongoose.model('ProfessionalProfile', professionalProfileSchema);

module.exports = ProfessionalProfileModel;
