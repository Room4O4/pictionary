class Looper {
  constructor(room) {
    _gameStarted = false;
    _roundStarted = false;
    _rounds = 0;
    _room = room;
    _users = [];
    ROUND_DURATION = 60;
  }

  addUser(user) {
    const foundUser = _users.find((user) => user.id === user.id);
    if (!foundUser) {
      _users.push(user);
    } else {
      console.log('user already in room');
    }
  }

  startRound() {
    _roundStarted = true;
    // Pick a word from dictionary
    // Assign a user to draw
    // Assign other users to guess
    // start Timer
    // At the end of round, do _rounds--
    // Repeat till _rounds == 0
    if (_rounds > 0) setTimeout(startRound, ROUND_DURATION);
    else {
      _roundStarted = false;
      // announce game winners! Show winning banner for 10 secs and start next game
    }
  }
  loop() {
    // we need a min of 2 users to start a game
    if (!_gameStarted && _users.length > 1) {
      // reset scores
      // start game
      // emit game started
      _gameStarted = true;
      _rounds = _users.length;
      // check if round is in progress else start round
      // if round is in progress, wait for round to finish and update _rounds--
      this.startRound();
    } else if (_gameStarted && _users.length < 2) {
      // stop game
      // compute scores
      // emit winner
      _gameStarted = false;
      _roundStarted = false;
      _rounds = 0;
    } else if (_gameStarted) {
      // Eval guesses
      // Keep updating scores
    }
  }
}

module.exports = Looper;
