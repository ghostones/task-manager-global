const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, default: 'medium' },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, default: 'en' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);