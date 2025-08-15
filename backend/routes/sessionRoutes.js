const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSessions, addSession, updateSession, deleteSession } = require('../controllers/sessionController');

router.get('/', protect, getSessions);
router.post('/', protect, addSession);
router.put('/:id', protect, updateSession);
router.delete('/:id', protect, deleteSession);

module.exports = router;
