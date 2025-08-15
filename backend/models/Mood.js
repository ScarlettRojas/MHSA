const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },                 // cuándo registró el estado de ánimo
    mood: {
      type: String,
      enum: ['happy', 'neutral', 'sad', 'anxious', 'stressed'],
      required: true,
    },
    intensity: { type: Number, min: 1, max: 5, default: 3 }, // 1–5
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mood', moodSchema);
