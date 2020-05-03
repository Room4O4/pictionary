const datastore = require('../datastore');
const Looper = require('../game/looper');
const RoomEventBridge = require('../events');
const debug = require('debug')('pictionary.game.index');

let _roomLoopMap = {};
let _rooms = ['main'];
let _io = null;

exports.addNewRoom = async (name) => {
  // Add new rooms!
};

exports.setSocketHandle = (io) => (_io = io);

//user - user.id, user.socket
exports.addNewUser = async (userId, userSocketId, room) => {
  try {
    if (!_rooms.includes(room)) throw new Error('No such room');

    const dbUser = await datastore.getUser(userId);
    if (dbUser) {
      const looper = _roomLoopMap[room];
      if (looper) {
        await looper.addUser(dbUser, userSocketId);
        debug('Added user to room');
      } else {
        const roomEventBridge = new RoomEventBridge(_io, room);
        const looper = new Looper(room, roomEventBridge);
        await looper.addUser(dbUser, userSocketId);
        _roomLoopMap[room] = looper;
        debug('Created Looper and add user to room');
      }
    } else {
      throw new Error('Could not find such a user in database');
    }
  } catch (error) {
    throw error;
  }
};

// Game loop?
setInterval(() => {
  for (const [room, looper] of Object.entries(_roomLoopMap)) {
    // Game Loop in each room
    looper.loop();
  }
}, 1000);
