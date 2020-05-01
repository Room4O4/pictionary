const EventEmitter = require('events');

class RoomEventBridge extends EventEmitter {
  constructor(io, socket) {
    _socket = socket;
    _userSocketMap = {};
    _io = io;
  }

  // Add socket, or update socket when there is a reconnection?
  updateUserSocket(userId, socket) {
    _userSocketMap[userId] = socket;
    socket.on('GE_NEW_GUESS', (args) => {
      this.emit('GE_NEW_GUESS', args.userId, args.guess);
    });
  }

  sendWordToPlayer(userId, word) {
    const socket = _userSocketMap[userId];
    socket.emit('GE_NEW_WORD', word);
  }

  broadcastRoomState(eventName, args) {
    switch (eventName) {
      case 'GE_NEW_GAME':
        _io.emit('GE_NEW_GAME');
        break;
      case 'GE_NEW_ROUND':
        _io.emit('GE_NEW_ROUND');
        break;
      case 'GE_ANNOUNCE_WINNER':
        _io.emit('GE_ANNOUNCE_WINNER');
        break;
      case 'GE_IDLE':
        _io.emit('GE_IDLE');
        break;
      default:
        break;
    }
  }
}

module.exports = RoomEventBridge;
