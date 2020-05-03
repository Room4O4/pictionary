const EventEmitter = require('events');
const debug = require('debug')('pictionary.events.roomEventBridge');

class RoomEventBridge extends EventEmitter {
  constructor(io, room) {
    super();
    this._userSocketIdMap = {};
    this._io = io;
    this._room = room;
  }

  getClientSocketInRoom(socketId){
    const clients = this._io.sockets.adapter.rooms[this._room].sockets;
    if(clients){
      for (const id in clients) {
        if (id === socketId) {
          return this._io.sockets.connected[id];
        }
      }
    } 
    return null;
  } 

  // Add socket, or update socket when there is a reconnection?
  updateUserSocket(userId, socketId) {
    this._userSocketIdMap[userId] = socketId;
    let clientSocket = this.getClientSocketInRoom(socketId);
    debug('Client socket found', clientSocket.id);
    if(clientSocket){
      clientSocket.on('GE_NEW_GUESS', (args) => {
        this.emit('GE_NEW_GUESS', args.userId, args.guess);
      });
  
      clientSocket.on('C_S_LEAVE_ROOM', (args) => {
        this.emit('C_S_LEAVE_ROOM', args.userId);
      });
    } else {
      debug(`Unable to find client socket with id ${socketId} in room ${this._room}`);
    }
    
  }

  sendWordToPlayer(userId, word) {
    debug('send word to player: ', userId, word);
    const clientSocket = this.getClientSocketInRoom(this._userSocketIdMap[userId]);
    clientSocket.emit('GE_NEW_WORD', word);
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
