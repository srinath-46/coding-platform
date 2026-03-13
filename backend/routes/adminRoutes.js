const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);
router.get('/submissions', authMiddleware, adminMiddleware, adminController.getSubmissions);
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.put('/users/:userId/role', authMiddleware, adminMiddleware, adminController.updateUserRole);

module.exports = router;
