const Session = require('../models/Session');

// GET /api/sessions
const getSessions = async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.from || req.query.to) {
      query.date = {};
      if (req.query.from) query.date.$gte = new Date(req.query.from);
      if (req.query.to) query.date.$lte = new Date(req.query.to);
    }
    const sessions = await Session.find(query).sort({ date: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};

// POST /api/sessions
const addSession = async (req, res) => {
  const { date, durationMinutes, type, status, notes, doctor } = req.body; // 👈 incluye doctor
  try {
    const session = await Session.create({
      userId: req.user.id,
      date,
      durationMinutes,
      type,
      status,
      notes,
      doctor,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/sessions/:id
const updateSession = async (req, res) => {
  const { date, durationMinutes, type, status, notes, doctor } = req.body; // 👈 incluye doctor
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    session.date = date ?? session.date;
    session.durationMinutes = durationMinutes ?? session.durationMinutes;
    session.type = type ?? session.type;
    session.status = status ?? session.status;
    session.notes = notes ?? session.notes;
    session.doctor = doctor ?? session.doctor; // 👈 actualiza médico

    const updated = await session.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await session.deleteOne(); // (Mongoose 7)
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSessions, addSession, updateSession, deleteSession };
