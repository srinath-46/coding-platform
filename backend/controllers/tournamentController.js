const Tournament = require('../models/Tournament');
const Problem = require('../models/Problem');

const tournamentController = {
  createTournament: async (req, res, next) => {
    try {
      const { title, description, entry_fee, prize_pool, start_time, end_time, max_participants } = req.body;
      
      const tournamentId = await Tournament.create({
        title, 
        description, 
        entry_fee: entry_fee || 0, 
        prize_pool: prize_pool || 0, 
        start_time, 
        end_time, 
        max_participants: max_participants || 100, 
        created_by: req.user.id
      });

      res.status(201).json({ success: true, tournamentId });
    } catch (err) {
      next(err);
    }
  },

  getAllTournaments: async (req, res, next) => {
    try {
      const tournaments = await Tournament.getAll();
      res.status(200).json({ success: true, tournaments });
    } catch (err) {
      next(err);
    }
  },

  getTournamentDetails: async (req, res, next) => {
    try {
      const tournament = await Tournament.getById(req.params.id);
      if (!tournament) {
        return res.status(404).json({ success: false, message: 'Tournament not found' });
      }

      const problems = await Problem.getByTournamentId(req.params.id);
      res.status(200).json({ success: true, tournament, problems });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      await Tournament.updateStatus(req.params.id, status);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = tournamentController;
