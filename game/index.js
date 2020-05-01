const datastore = require('../datastore');
const Looper = require('../game/looper');
const RoomEventBridge = require('../events');

let _roomLoopMap = {};
let _rooms = ['main'];
let _io = null;

exports.addNewRoom = async (name) => {
  // Add new rooms!
};

exports.setSocketHandle = (io) => (_io = io);

//user - user.id, user.socket
exports.addNewUser = async (user, room) => {
  try {
    if (!_rooms.includes(room)) throw new Error('No such room');

    const dbUser = await datastore.getUser(user.id);
    if (dbUser) {
      const looper = _roomLoopMap[room];
      if (looper) {
        await looper.AddUser(dbUser, room);
      } else {
        const roomEventBridge = new RoomEventBridge(io, user.socket);
        _roomLoopMap[room] = new Looper(room, roomEventBridge);
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
