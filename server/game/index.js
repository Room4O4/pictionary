const datastore = require('../datastore');
const Looper = require('../game/looper');
const RoomEventBridge = require('../events');
const debug = require('debug')('pictionary.game.index');

const _roomLoopMap = {};
const _rooms = ['main'];
let _io = null;

exports.setSocketHandle = (io) => (_io = io);

// user - user.id, user.socket
exports.addNewUser = async (userId, userSocketId, room) => {
  if (!_rooms.includes(room)) {
    _rooms.push(room);
  };
  const dbUser = await datastore.getUser(userId);
  if (dbUser) {
    const looper = _roomLoopMap[room];
    if (looper) {
      looper.addUser(dbUser, userSocketId);
      debug('Added user to room');
    } else {
      const roomEventBridge = new RoomEventBridge(_io, room);
      const looper = new Looper(room, roomEventBridge);
      looper.addUser(dbUser, userSocketId);
      _roomLoopMap[room] = looper;
      debug('Created Looper and add user to room');
    }
  } else {
    throw new Error('Could not find such a user in database');
  }
};

// Game loop?
setInterval(() => {
  for (const room in _roomLoopMap) {
    if (Object.prototype.hasOwnProperty.call(_roomLoopMap, room)) {
      const looper = _roomLoopMap[room];
      looper.loop();
    }
  }
}, 1000);
