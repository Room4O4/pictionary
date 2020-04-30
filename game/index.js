const datastore = require('../datastore');
const looper = require('../game/looper');
let _roomLoopMap = {};
let _rooms = ['main'];

exports.addNewRoom = async (name) => {
  // Add new rooms!
};

exports.addNewUser = async (id, room) => {
  try {
    if (!_rooms.includes(room)) throw new Error('No such room');

    const user = await datastore.getUser(id);
    if (user) {
      const looper = _roomLoopMap[room];
      if (looper) {
        await looper.AddUser(user, room);
      } else {
        _roomLoopMap[room] = new looper(room);
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
