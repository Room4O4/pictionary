var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  console.log('A user just connected');
  let interval = setInterval(() => updateServerTime(socket), 1000);
  socket.on('disconnect', () => {
    clearInterval(interval);
  });
});

const updateServerTime = (socket) => {
  socket.emit('UPD_SERVER_TIME', Date.now());
};

http.listen(3001, () => {
  console.log('listening on *:3001');
});
