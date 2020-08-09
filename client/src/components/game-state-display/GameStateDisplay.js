import React, { Fragment } from 'react';
import { Typography } from '@material-ui/core';
import * as GameStateConstants from '../../constants/AppConstants';
import GameArea from './game-area/GameArea';
import './game-state-display.css';

const GameStateDisplay = ({ gameState, canvasOptions }) => {
  const renderGameState = () => {
    switch (gameState.state) {
      case GameStateConstants.GAME_STATE_IDLE:
        return (
          <Typography className="message-banner" variant="h4">
            Waiting for your friends...
          </Typography>
        );
      case GameStateConstants.GAME_STATE_NEW_ROUND:
        return (
          <GameArea
            socket={gameState.socket}
            lastGuess={gameState.lastGuess}
            roundDuration={gameState.roundDuration}
            canvasOptions={canvasOptions}
          />
        );
      case GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND:
        return (
          <Typography className="message-banner" variant="h5">
            That was Round {gameState.roundInfo.current} of{' '}
            {gameState.roundInfo.total}. Wait for next round.
          </Typography>
        );
      case GameStateConstants.GAME_STATE_ANNOUNCE_WINNER:
        return (
          <Typography className="message-banner" variant="h4">
            And the Winner is ___
          </Typography>
        );

      default:
        break;
    }
  };
  return <Fragment>{renderGameState()}</Fragment>;
};

export default GameStateDisplay;
