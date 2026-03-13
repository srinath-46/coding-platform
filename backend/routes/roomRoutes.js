const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, roomController.createRoom);
router.get('/:id', authMiddleware, roomController.getRoomDetails);
router.post('/:id/join', authMiddleware, roomController.joinRoom);
router.post('/:id/start', authMiddleware, roomController.startMatch);

module.exports = router;
