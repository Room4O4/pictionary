const debug = require('debug')('pictionary.game.looper');

class Looper {
  constructor(room, roomEventBridge) {
    this.ROUND_DURATION = 10000;
    this.GAME_STATE_IDLE = 0;
    this.GAME_STATE_ROUND_IN_PROGRESS = 1;
    this.GAME_STATE_ANNOUNCE_WINNER = 2;

    this._gameStarted = false;
    this._roundStarted = false;
    this._roundsLeft = 0;
    this._totalRounds = 0;
    this._room = room;
    this._users = [];
    this._gameState = this.GAME_STATE_IDLE;
    this._currentWord = null;
    this._winnerAnnouncementInProgress = false;
    this._currentUserDrawIndex = 0;
    this._roomEventBridge = roomEventBridge;
    this._roomEventBridge.broadcastRoomState('GE_IDLE');
  }

  addUser(dbUser, socket) {
    const foundUser = this._users.find((user) => dbUser.id === user.id);
    if (!foundUser) {
      this._users.push(dbUser);
    } else {
      console.log('user already in room');
    }
    this._roomEventBridge.updateUserSocket(dbUser.id, socket);
    debug('Added new user - ', dbUser);
  }

  evaluateRound() {
    // At the end of round, do _rounds--
    // Repeat till _rounds == 0
    this._roundsLeft--;
    if (this._roundsLeft == 0) {
      // Game over
      // emit game over
      this._gameStarted = false;
      this._gameState = this.GAME_STATE_ANNOUNCE_WINNER;
      debug('Game over, Announce winner');
      // announce winners
    } else {
      this.startRound();
    }
  }

  startRound() {
    debug('start new round');

    this._roundStarted = true;
    // Pick a word from dictionary
    this._currentWord = 'BANANA';

    // Assign a user to draw

    this._currentUserDrawIndex = (this._totalRounds - this._roundsLeft) % this._users.length;
    const currentDrawingUser = this._users[this._currentUserDrawIndex];
    debug('Current User Drawing - ', currentDrawingUser);

    // emit round started
    this._roomEventBridge.broadcastRoomState('GE_NEW_ROUND', this._roundsLeft, this._totalRounds);
    this._roomEventBridge.sendWordToPlayer(currentDrawingUser.id, this._currentWord);

    // Assign other users to guess

    // start Timer
    const that = this;
    setTimeout(() => that.evaluateRound(), this.ROUND_DURATION);
  }

  announceWinner() {
    debug('Winner announced!');
    this._roomEventBridge.broadcastRoomState('GE_ANNOUNCE_WINNER');
    this._roundsLeft = 0;
    this._totalRounds = 0;
    this._currentWord = null;
    this._currentUserDrawIndex = 0;
    this._winnerAnnouncementInProgress = true;
    const that = this;
    setTimeout(() => {
      that._gameState = that.GAME_STATE_IDLE;
      this._winnerAnnouncementInProgress = false;
    }, 10 * 1000);
  }

  loop() {
    debug('GAME_STATE: ', this._gameState);
    switch (this._gameState) {
      case this.GAME_STATE_IDLE:
        if (this._users.length > 1) {
          this._gameState = this.GAME_STATE_ROUND_IN_PROGRESS;
          this._roomEventBridge.broadcastRoomState('GE_NEW_GAME');
          this._roundsLeft = this._users.length;
          this._totalRounds = this._users.length;
          this.startRound();
        }
        break;
      case this.GAME_STATE_ROUND_IN_PROGRESS:
        if (this._users.length < 2) {
          this._gameState = this.GAME_STATE_ANNOUNCE_WINNER;
        }
        break;
      case this.GAME_STATE_ANNOUNCE_WINNER:
        if (!this._winnerAnnouncementInProgress) this.announceWinner();
        break;
      default:
        break;
    }
  }
}

module.exports = Looper;
