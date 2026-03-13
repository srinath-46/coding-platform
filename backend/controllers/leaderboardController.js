const leaderboardService = require('../services/leaderboardService');

const leaderboardController = {
  getRoomLeaderboard: async (req, res, next) => {
    try {
      const leaderboard = await leaderboardService.getRoomLeaderboard(req.params.id);
      res.status(200).json({ success: true, leaderboard });
    } catch (err) {
      next(err);
    }
  },

  getGlobalLeaderboard: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);
      res.status(200).json({ success: true, leaderboard });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = leaderboardController;
