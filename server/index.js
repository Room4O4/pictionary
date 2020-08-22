const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const datastore = require('./datastore');
const game = require('./game');
const debug = require('debug')('pictionary.server');
const path = require('path');
const DEFAULT_ROOM = 'main';

game.setSocketHandle(io);

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connection', (socket) => {
  debug('A user connected');

  const interval = setInterval(() => updateServerTime(socket), 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
  });

  socket.on('C_S_LOGIN', async (user, room) => {
    try {
      // log in the user
      await datastore.login(user);

      // Join the socket to the room
      socket.join(room || DEFAULT_ROOM);

      // automatically add the user to the default room
      await game.addNewUser(user.id, socket.id, room || DEFAULT_ROOM);

      socket.emit('S_C_LOGIN', user);
    } catch (error) {
      debug('Error Logging in - ', error);
      socket.disconnect();
    }
  });

  socket.on('C_S_CLEAR_CANVAS', async (room) => {
    try {
      debug('Received C_S_CLEAR_CANVAS');
      // Broadcast to every one in room for clearing canvas. (including the sender)
      io.in(room).emit('S_C_CLEAR_CANVAS');
    } catch (error) {
      debug('Error in handling C_S_CLEAR_CANVAS', error);
    }
  });
});

const updateServerTime = (socket) => {
  socket.emit('UPD_SERVER_TIME', Date.now());
};

http.listen(3001, () => {
  debug('listening on *:3001');
});
