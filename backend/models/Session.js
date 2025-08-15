// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date:   { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15, max: 240 },
    type:   { type: String, trim: true }, // ej: 'counselling', 'follow-up'
    status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
    notes:  { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
