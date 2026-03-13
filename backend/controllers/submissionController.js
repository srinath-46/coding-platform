const Submission = require('../models/Submission');
const codeRunnerService = require('../services/codeRunnerService');
const websocketService = require('../services/websocketService');
const leaderboardService = require('../services/leaderboardService');
const Room = require('../models/Room');

const submissionController = {
  submitCode: async (req, res, next) => {
    try {
      const { problem_id, room_id, language, source_code } = req.body;
      const user_id = req.user.id;

      if (!problem_id || !language || !source_code) {
        return res.status(400).json({ success: false, message: 'Missing submission fields' });
      }

      const submissionId = await Submission.create({
        user_id,
        problem_id,
        room_id,
        language,
        source_code
      });

      // API returns immediately (Async execution pattern)
      res.status(202).json({ success: true, submissionId, status: 'pending' });

      // Run code execution in background
      Promise.resolve().then(async () => {
        try {
          const result = await codeRunnerService.processSubmission(submissionId);
          
          // Notify user of completion
          websocketService.sendToUser(user_id, 'submission-result', result);

          if (room_id) {
            // Update participant stats if in a room
            if (result.status === 'accepted') {
              await Room.updateParticipantScore(room_id, user_id, result.score, 1);
            }
            
            // Broadcast updated leaderboard to room
            const leaderboard = await leaderboardService.getRoomLeaderboard(room_id);
            websocketService.broadcastToRoom(room_id, 'leaderboard-update', leaderboard);
          }
        } catch (error) {
          console.error('Async Submission Error:', error);
        }
      });

    } catch (err) {
      next(err);
    }
  },

  getSubmissionDetails: async (req, res, next) => {
    try {
      const submission = await Submission.getById(req.params.id);
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }
      res.status(200).json({ success: true, submission });
    } catch (err) {
      next(err);
    }
  },

  getUserSubmissions: async (req, res, next) => {
    try {
      const submissions = await Submission.getByUserAndRoom(req.user.id, req.query.roomId);
      res.status(200).json({ success: true, submissions });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = submissionController;
