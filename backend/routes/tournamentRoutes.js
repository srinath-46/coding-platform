const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentDetails);
router.post('/', authMiddleware, adminMiddleware, tournamentController.createTournament);
router.put('/:id/status', authMiddleware, adminMiddleware, tournamentController.updateStatus);

module.exports = router;
