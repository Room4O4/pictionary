import React, { Fragment } from 'react';
import { Typography } from '@material-ui/core';
import { GameStates } from '../../constants/AppConstants';
import GameArea from './game-area/GameArea';
import './game-state-display.css';

const GameStateDisplay = ({ gameState, canvasOptions, hintWord }) => {
  const renderWinnerString = (winners) => {
    if (winners && winners.length > 0) {
      if (winners.length > 1) {
        let winnersString = '';
        winnersString = winners.reduce((accumulator, winner) => {
          if (accumulator) {
            return `${accumulator}, ${winner.name}`;
          } else {
            return winner.name;
          }
        }, '');
        console.log(winnersString);
        return `And the winners are ${winnersString}!`;
      } else {
        return `And the winner is ${winners[0].name}!`;
      }
    } else {
      return 'Game Over, Wait For New Game!';
    }
  };

  const renderGameState = () => {
    switch (gameState.state) {
      case GameStates.GAME_STATE_IDLE:
        return (
          <Typography className="message-banner" variant="h4">
            Waiting for your friends...
          </Typography>
        );
      case GameStates.GAME_STATE_NEW_ROUND:
        return (
          <GameArea
            socket={gameState.socket}
            liveMessage={gameState.liveMessage}
            roundDuration={gameState.roundDuration}
            canvasOptions={canvasOptions}
            hintWord={gameState.hintWord}
          />
        );
      case GameStates.GAME_STATE_WAIT_FOR_NEXT_ROUND:
        return (
          <Typography className="message-banner" variant="h5">
            That was Round {gameState.roundInfo.current} of{' '}
            {gameState.roundInfo.total}. Wait for next round.
          </Typography>
        );
      case GameStates.GAME_STATE_ANNOUNCE_WINNER:
      {
        return (
          <Typography className="message-banner" variant="h4">
            {renderWinnerString(gameState.winners)}
          </Typography>
        );
      }

      default:
        break;
    }
  };
  return <Fragment>{renderGameState()}</Fragment>;
};

export default GameStateDisplay;
