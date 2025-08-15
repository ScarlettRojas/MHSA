const Mood = require('../models/Mood');

// GET /api/moods
const getMoods = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }
    const moods = await Mood.find(query).sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/moods
const addMood = async (req, res) => {
  const { date, mood, intensity, notes } = req.body;
  try {
    const doc = await Mood.create({
      userId: req.user.id,
      date,
      mood,
      intensity,
      notes,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/moods/:id
const updateMood = async (req, res) => {
  const { date, mood, intensity, notes } = req.body;
  try {
    const doc = await Mood.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Mood not found' });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    doc.date = date ?? doc.date;
    doc.mood = mood ?? doc.mood;
    doc.intensity = intensity ?? doc.intensity;
    doc.notes = notes ?? doc.notes;

    const updated = await doc.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/moods/:id
const deleteMood = async (req, res) => {
  try {
    const doc = await Mood.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Mood not found' });
    if (doc.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await doc.deleteOne();
    res.json({ message: 'Mood deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMoods, addMood, updateMood, deleteMood };
