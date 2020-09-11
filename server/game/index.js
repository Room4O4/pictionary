const datastore = require('../datastore');
const Looper = require('../game/looper');
const RoomEventBridge = require('../events');
const debug = require('debug')('pictionary.game.index');

const _roomLoopMap = {};
const _rooms = ['main'];
let _io = null;

exports.addNewRoom = async (name) => {
  // Add new rooms!
};

exports.setSocketHandle = (io) => (_io = io);

// user - user.id, user.socket
exports.addNewUser = async (userId, userSocketId, room) => {
  if (!_rooms.includes(room)) throw new Error('No such room');
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

const getRandomIndices = (word) => {
  // Random indexes to show hint letters
  const randomIndex = (arr, length) => {
    const randIndex = Math.floor(Math.random() * length);
    if (!arr.includes(randIndex)) {
      return randIndex;
    }
    return randomIndex(arr, length);
  };

  const guessWordLength = word.length;
  let randomIndices = [];

  // Show one-third of the guess word
  for (let i = 0; i < Math.ceil(guessWordLength / 3); i++) {
    randomIndices = [
      ...randomIndices,
      randomIndex(randomIndices, guessWordLength)
    ];
  }
  return randomIndices;
}

exports.getMaskedHintWord = (word) => {
  const randomIndices = getRandomIndices(word);
  let maskedWord = '';

  word.split('').forEach((letter, index) => {
    if (!randomIndices.includes(index)) {
      maskedWord += '_';
    } else {
      maskedWord += letter;
    }
  });

  return maskedWord;
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
