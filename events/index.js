const EventEmitter = require('events');
const debug = require('debug')('pictionary.events.roomEventBridge');

class RoomEventBridge extends EventEmitter {
  constructor(io) {
    super();
    this._userSocketMap = {};
    this._io = io;
  }

  // Add socket, or update socket when there is a reconnection?
  updateUserSocket(userId, socket) {
    this._userSocketMap[userId] = socket;
    socket.on('GE_NEW_GUESS', (args) => {
      this.emit('GE_NEW_GUESS', args.userId, args.guess);
    });

    socket.on('C_S_LEAVE_ROOM', (args) => {
      this.emit('C_S_LEAVE_ROOM', args.userId);
    });
  }

  sendWordToPlayer(userId, word) {
    debug('send word to player: ', userId, word);
    const socket = this._userSocketMap[userId];
    socket.emit('GE_NEW_WORD', word);
  }

  broadcastRoomState(eventName, args) {
    debug('Broadcast event: ', eventName);
    switch (eventName) {
      case 'GE_NEW_GAME':
        this._io.emit('GE_NEW_GAME');
        break;
      case 'GE_NEW_ROUND':
        this._io.emit('GE_NEW_ROUND');
        break;
      case 'GE_ANNOUNCE_WINNER':
        this._io.emit('GE_ANNOUNCE_WINNER');
        break;
      case 'GE_IDLE':
        this._io.emit('GE_IDLE');
        break;
      default:
        break;
    }
  }
}

module.exports = RoomEventBridge;
