const EventEmitter = require('events');
const debug = require('debug')('pictionary.events.roomEventBridge');

class RoomEventBridge extends EventEmitter {
  constructor(io, room) {
    super();
    this._userSocketIdMap = {};
    this._io = io;
    this._room = room;
  }

  setIO(io) {
    this._io = io;
  }

  getClientSocketInRoom(socketId) {
    if (!this._io || !this._io.sockets.adapter.rooms[this._room]) return null;

    const clients = this._io.sockets.adapter.rooms[this._room].sockets;
    if (clients) {
      for (const id in clients) {
        if (id === socketId) {
          return this._io.sockets.connected[id];
        }
      }
    }
    return null;
  }

  _getUser(socketId) {
    return Object.keys(this._userSocketIdMap).find((key) => this._userSocketIdMap[key] === socketId);
  }

  // Add socket, or update socket when there is a reconnection?
  updateUserSocket(userId, socketId) {
    this._userSocketIdMap[userId] = socketId;
    let clientSocket = this.getClientSocketInRoom(socketId);
    debug('Client socket found', clientSocket.id);
    if (clientSocket) {
      clientSocket.on('GE_NEW_GUESS', (args) => {
        this.emit('GE_NEW_GUESS', args.userId, args.guess);
      });

      clientSocket.on('disconnect', (args) => {
        debug('User disconnected');
        const userId = this._getUser(clientSocket.id);
        delete this._userSocketIdMap[clientSocket.id];
        this.emit('C_S_LEAVE_ROOM', userId);
      });

      clientSocket.on('C_S_DRAW', (data) => {
        clientSocket.to(this._room).emit('S_C_DRAW', data);
      });
    } else {
      debug(`Unable to find client socket with id ${socketId} in room ${this._room}`);
    }
  }

  broadcastScores(userScores) {
    this._io.emit('GE_UPDATE_SCORE', userScores);
  }

  sendWordToPlayer(userId, word) {
    debug('send word to player: ', userId, word);
    const clientSocket = this.getClientSocketInRoom(this._userSocketIdMap[userId]);
    if (clientSocket) clientSocket.emit('GE_NEW_WORD', word);
  }

  broadcastRoomState(eventName, args) {
    debug('Broadcast event: ', eventName);
    switch (eventName) {
      case 'GE_NEW_GAME':
        this._io.emit('GE_NEW_GAME', args);
        break;
      case 'GE_NEW_ROUND':
        this._io.emit('GE_NEW_ROUND', args);
        break;
      case 'GE_ANNOUNCE_WINNER':
        this._io.emit('GE_ANNOUNCE_WINNER');
        break;
      case 'GE_IDLE':
        this._io.emit('GE_IDLE');
        break;
      case 'GE_WAIT_FOR_NEXT_ROUND':
        this._io.emit('GE_WAIT_FOR_NEXT_ROUND', args);
        break;
      default:
        break;
    }
  }
}

module.exports = RoomEventBridge;
