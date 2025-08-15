const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMoods, addMood, updateMood, deleteMood } = require('../controllers/moodController');

router.get('/', protect, getMoods);
router.post('/', protect, addMood);
router.put('/:id', protect, updateMood);
router.delete('/:id', protect, deleteMood);

module.exports = router;
