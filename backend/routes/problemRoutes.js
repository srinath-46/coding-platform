const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, adminMiddleware, problemController.createProblem);
router.post('/testcase', authMiddleware, adminMiddleware, problemController.addTestCase);

module.exports = router;
