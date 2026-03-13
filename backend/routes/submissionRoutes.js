const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submissionController.submitCode);
router.get('/user', authMiddleware, submissionController.getUserSubmissions);
router.get('/:id', authMiddleware, submissionController.getSubmissionDetails);

module.exports = router;
