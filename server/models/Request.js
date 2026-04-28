const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  type: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  submittedDate: { type: Date, default: Date.now },
  documentUrl: { type: String, default: 'view_document.pdf' } 
});

module.exports = mongoose.model('Request', RequestSchema);