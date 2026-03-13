const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;
