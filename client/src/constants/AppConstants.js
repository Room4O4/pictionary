export const GameStates = {
  GAME_STATE_IDLE: 0,
  GAME_STATE_NEW_GAME: 1,
  GAME_STATE_NEW_ROUND: 2,
  GAME_STATE_WAIT_FOR_NEXT_ROUND: 3,
  GAME_STATE_ANNOUNCE_WINNER: 4
};

export const GameSounds = {
  NEW_GAME: 'new-game',
  NEW_ROUND: 'new-round',
  WINNER: 'winner',
  CORRECT_GUESS: 'correct-guess'
};

export const GAME_SERVER_URL = 'http://localhost:3001';
