import React, { Fragment } from 'react';
import Canvas from './Canvas';
import FadeOutText from './anim/FadeOutText';
import ReactCountdownClock from 'react-countdown-clock';
import './game-area.css';

const GameArea = ({ socket, lastGuess, roundDuration, canvasOptions }) => {
  return (
    <Fragment>
      <Canvas io={socket} canvasOptions={canvasOptions}/>
      <div className="live-message">
        <FadeOutText text={lastGuess}></FadeOutText>
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
