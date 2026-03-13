const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const websocketService = require('../services/websocketService');

const roomController = {
  createRoom: async (req, res, next) => {
    try {
      const { tournamentId, maxPlayers } = req.body;
      const roomId = uuidv4();
      
      await Room.create(roomId, tournamentId, maxPlayers);
      await Room.addParticipant(roomId, req.user.id);

      res.status(201).json({ success: true, roomId });
    } catch (err) {
      next(err);
    }
  },

  joinRoom: async (req, res, next) => {
    try {
      const id = req.params.id;
      let room = await Room.getById(id);
      
      if (!room) {
        // Check if the ID is a Tournament ID to auto-create a room
        const Tournament = require('../models/Tournament');
        const tournament = await Tournament.getById(id);
        if (tournament) {
          try {
            await Room.create(id, id, 100);
            room = await Room.getById(id);
          } catch (createErr) {
            // Room might have been created by another request simultaneously
            room = await Room.getById(id);
          }
        }
      }

      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }

      await Room.addParticipant(roomId, req.user.id);
      
      websocketService.broadcastToRoom(roomId, 'player-joined', { 
        userId: req.user.id, 
        username: req.user.username 
      });

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  getRoomDetails: async (req, res, next) => {
    try {
      const room = await Room.getById(req.params.id);
      if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }

      const participants = await Room.getParticipants(req.params.id);
      res.status(200).json({ success: true, room, participants });
    } catch (err) {
      next(err);
    }
  },

  startMatch: async (req, res, next) => {
    try {
      const roomId = req.params.id;
      await Room.updateStatus(roomId, 'active');
      
      websocketService.broadcastToRoom(roomId, 'match-started', { roomId, startTime: new Date() });
      
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = roomController;
