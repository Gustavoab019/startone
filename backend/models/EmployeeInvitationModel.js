const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeInvitationSchema = new Schema({
  professionalId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  position: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  invitedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índice composto para evitar convites duplicados pendentes
EmployeeInvitationSchema.index(
  { professionalId: 1, companyId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('EmployeeInvitation', EmployeeInvitationSchema);