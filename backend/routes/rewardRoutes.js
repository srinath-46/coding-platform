const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/distribute', authMiddleware, adminMiddleware, rewardController.distributeRewards);

module.exports = router;
