class Looper {
  constructor(room, roomEventBridge) {
    _gameStarted = false;
    _roundStarted = false;
    _roundsLeft = 0;
    _totalRounds = 0;
    _room = room;
    _users = [];
    _gameState = GAME_STATE_IDLE;
    _currentWord = null;

    _roomEventBridge = roomEventBridge;
    _roomEventBridge.updateRoomState('GE_IDLE');

    ROUND_DURATION = 60000;
    GAME_STATE_IDLE = 0;
    GAME_STATE_ROUND_IN_PROGRESS = 1;
    GAME_STATE_ANNOUNCE_WINNER = 2;
  }

  addUser(user, socket) {
    const foundUser = _users.find((user) => user.id === user.id);
    if (!foundUser) {
      _users.push(user);
    } else {
      console.log('user already in room');
    }
    _roomEventBridge.updateUserSocket(user.id, socket);
  }

  evaluateRound() {
    rounds--;
    if (rounds == 0) {
      // Game over
      // emit game over
      _gameStarted = false;
      // announce winners
    } else {
      this.startRound();
    }
  }

  startRound() {
    _roundStarted = true;
    // emit round started
    // Pick a word from dictionary
    _currentWord = 'BANANA';
    _roomEvent.updateRoomState('GE_NEW_ROUND', _roundsLeft, _totalRounds, _currentWord);

    // Assign a user to draw
    // Assign other users to guess
    // start Timer
    // At the end of round, do _rounds--
    // Repeat till _rounds == 0
    setTimeout(evaluateRound, ROUND_DURATION);
  }

  announceWinner() {
    console.log('Winner announced!');
    _roomEvent.updateRoomState('GE_ANNOUNCE_WINNER');
    _roundsLeft = 0;
    _totalRounds = 0;
    _currentWord = null;
    setTimeout(() => (_gameState = GAME_STATE_IDLE), 10 * 1000);
  }

  loop() {
    switch (_gameState) {
      case GAME_STATE_IDLE:
        if (_users.length > 1) {
          _gameState = GAME_STATE_ROUND_IN_PROGRESS;
          _roomEvent.updateRoomState('GE_NEW_GAME');
          _roundsLeft = _users.length;
          _totalRounds = users.length;
          this.startRound();
        }
        break;
      case GAME_STATE_ROUND_IN_PROGRESS:
        if (_users.length < 2) {
          _gameState = GAME_STATE_ANNOUNCE_WINNER;
        }
        break;
      case GAME_STATE_ANNOUNCE_WINNER:
        this.announceWinner();
        break;
      default:
        break;
    }
  }
}

module.exports = Looper;
