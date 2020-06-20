const debug = require('debug')('pictionary.game.looper');
const picWordGenerator = require('pic-word-gen');

class Looper {
  constructor(room, roomEventBridge) {
    this.ROUND_DURATION = 3000;
    this.GAME_STATE_IDLE = 0;
    this.GAME_STATE_ROUND_IN_PROGRESS = 1;
    this.GAME_STATE_WAIT_FOR_NEXT_ROUND = 2;
    this.GAME_STATE_ANNOUNCE_WINNER = 3;

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
    this._roomEventBridge.on('GE_NEW_GUESS', (userId, guess) => {
      this.evaluateGuess(userId, guess);
    });
    this._roomEventBridge.on('C_S_LEAVE_ROOM', (userId) => {
      this.removeUser(userId);
    });
  }

  addUser(dbUser, socketId) {
    const foundUser = this._users.find((user) => dbUser.id === user.id);
    if (!foundUser) {
      this._users.push({ id: dbUser.id, name: dbUser.name, score: 0 });
    } else {
      console.log('user already in room');
    }
    this._roomEventBridge.updateUserSocket(dbUser.id, socketId);
    this._roomEventBridge.broadcastScores(this._users);
    debug('Added new user - ', dbUser);
  }

  removeUser(userId) {
    // remove from _users
    const indexOfUser = this._users.map((user) => user.id).indexOf(userId);
    if (indexOfUser >= 0) {
      this._users.splice(indexOfUser, 1);
      this._roomEventBridge.broadcastScores(this._users);
    }
  }

  evaluateGuess(userId, guess) {
    if (!guess) return;
    if (guess.trim().toLowerCase() === this._currentWord.trim().toLowerCase()) {
      debug('Correct guess by user - ', userId);
      const foundUser = this._users.find((user) => userId === user.id);
      if (foundUser) {
        foundUser.score += 10;
        this._roomEventBridge.broadcastScores(this._users);
      }
    }
  }

  evaluateRound() {
    // At the end of round, do _rounds--
    // Repeat till _rounds == 0
    this._roundsLeft--;
    if (this._roundsLeft <= 0) {
      // Game over
      // emit game over
      this.stopGame();
      // announce winners
    } else {
      this._gameState = this.GAME_STATE_WAIT_FOR_NEXT_ROUND;
      this._roomEventBridge.broadcastRoomState('GE_WAIT_FOR_NEXT_ROUND', this._currentWord);
      const that = this;
      setTimeout(() => {
        debug('Users count', that._users.length);
        if(that._users.length > 1){
          that.startRound();
        } else {
          // Users have left before the next round starts.
          // Stop the game and Announce winner
          that.stopGame();
        }
      }, 5000);
    }
  }

  startRound() {
    debug('start new round');
    this._roundStarted = true;
    // Assign a user to draw
    this._currentUserDrawIndex = (this._totalRounds - this._roundsLeft) % this._users.length;
    const currentDrawingUser = this._users[this._currentUserDrawIndex];
    debug('Current User Drawing - ', currentDrawingUser);
    // Sometimes the currentDrawing user quits while its his turn to draw. SKIP the round!
    if (!currentDrawingUser) {
      this.evaluateRound();
      return;
    }

    // Pick a word using pic-word-gen library
    this._currentWord = picWordGenerator.generateWord();

    // emit round started
    this._roomEventBridge.broadcastRoomState('GE_NEW_ROUND', { round: this._roundsLeft, total: this._totalRounds, currentDrawingUser });
    this._roomEventBridge.sendWordToPlayer(currentDrawingUser.id, this._currentWord);

    // Assign other users to guess

    // start Timer
    const that = this;
    setTimeout(() => that.evaluateRound(), this.ROUND_DURATION);
  }

  _resetScores() {
    this._users.forEach((user) => {
      user.score = 0;
    });
  }

  stopGame() {
    this._gameState = this.GAME_STATE_ANNOUNCE_WINNER;
    debug('Game over, Announce winner');
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
      that._winnerAnnouncementInProgress = false;
    }, 10 * 1000);
  }

  loop() {
    debug('GAME_STATE: ', this._gameState);
    switch (this._gameState) {
      case this.GAME_STATE_IDLE:
        if (this._users.length > 1) {
          this._gameState = this.GAME_STATE_ROUND_IN_PROGRESS;
          this._resetScores();
          this._roomEventBridge.broadcastRoomState('GE_NEW_GAME', this.ROUND_DURATION);
          this._roomEventBridge.broadcastScores(this._users);
          this._roundsLeft = this._users.length;
          this._totalRounds = this._users.length;
          this.startRound();
        }
        break;
      case this.GAME_STATE_ROUND_IN_PROGRESS:
        if (this._users.length < 2) {
          this.stopGame();
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
