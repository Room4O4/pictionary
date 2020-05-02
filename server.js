var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var datastore = require('./datastore/index');
var game = require('./game/index');

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

game.setSocketHandle(io);

io.on('connection', (socket) => {
  console.log('A user just connected');
  let interval = setInterval(() => updateServerTime(socket), 1000);
  socket.on('disconnect', () => {
    clearInterval(interval);
  });
  socket.on('C_S_LOGIN', async (user) => {
    try {
      // log in the user
      const loginResult = await datastore.login(user);
      // automatically add the user to the default room
      await game.addNewUser(user.id, socket, 'main');

      socket.emit('S_C_LOGIN', loginResult);
    } catch (error) {
      console.log('Error Logging in - ', error);
      socket.disconnect();
    }
  });
});

const updateServerTime = (socket) => {
  socket.emit('UPD_SERVER_TIME', Date.now());
};

http.listen(3001, () => {
  console.log('listening on *:3001');
});
