const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/room/:id', leaderboardController.getRoomLeaderboard);
router.get('/global', leaderboardController.getGlobalLeaderboard);

module.exports = router;
