import React, { Fragment } from 'react';
import Canvas from './Canvas';
import FadeOutText from './anim/FadeOutText';
import ReactCountdownClock from 'react-countdown-clock';
import './game-area.css';

const GameArea = ({ socket, lastGuess, roundDuration }) => {
  return (
    <Fragment>
      <Canvas io={socket} />
      <div className="liveMessage">
        <FadeOutText text={lastGuess}></FadeOutText>
      </div>
      <div className="timer">
        <ReactCountdownClock
          className="timer"
          seconds={roundDuration}
          color="#000"
          alpha={0.9}
          size={60}
        />{' '}
      </div>
    </Fragment>
  );
};

export default GameArea;
