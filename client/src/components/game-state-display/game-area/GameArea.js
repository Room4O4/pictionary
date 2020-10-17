import React, { Fragment } from 'react';
import Canvas from './Canvas';
import FadeOutText from './anim/FadeOutText';
import ReactCountdownClock from 'react-countdown-clock';
import GameHint from './GameHint';
import './game-area.css';

const GameArea = ({ socket, liveMessage, roundDuration, canvasOptions, hintWord }) => {
  return (
    <Fragment>
      { hintWord !== '' ? <GameHint hintWord={hintWord}/> : '' }
      <Canvas io={socket} canvasOptions={canvasOptions}/>
      <div className="live-message">
        <FadeOutText text={liveMessage}></FadeOutText>
      </div>
      <div className="timer">
        <ReactCountdownClock
          className="timer"
          seconds={roundDuration}
          color="#D28152"
          weight={5}
          alpha={0.9}
          size={48}
        />{' '}
      </div>
    </Fragment>
  );
};

export default GameArea;
