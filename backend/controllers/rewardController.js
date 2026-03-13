const Reward = require('../models/Reward');
const pool = require('../config/db');

const rewardController = {
  distributeRewards: async (req, res, next) => {
    try {
      const { tournament_id, rewards } = req.body;

      if (!rewards || !Array.isArray(rewards)) {
        return res.status(400).json({ success: false, message: 'Rewards list is required' });
      }

      for (const r of rewards) {
        await Reward.create({
          tournament_id,
          user_id: r.user_id,
          rank: r.rank,
          reward_amount: r.reward_amount
        });
      }

      res.status(201).json({ success: true, message: 'Rewards distributed successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = rewardController;
