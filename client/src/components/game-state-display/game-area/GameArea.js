import React, { Fragment } from 'react';
import Canvas from './Canvas';
import FadeOutText from './anim/FadeOutText';
import ReactCountdownClock from 'react-countdown-clock';
import './game-area.css';

class GameArea extends React.Component {
  render () {
    const {
      socket,
      liveMessage,
      roundDuration,
      canvasOptions,
      hintWord
    } = this.props;

    const GameHint = () => {
      return (
        <div className="hint-container">
          {
            hintWord.split('')
              .map((letter, index) => (
                <div className="hint-letter"
                  key = {index}>
                  <span className={letter === '_' ? 'hide' : 'show'}>
                    {letter.toUpperCase()}
                  </span>
                </div>
              ))
          }
        </div>
      );
    };

    return (
      <Fragment>
        { hintWord !== '' ? <GameHint /> : '' }
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
  }
}

export default GameArea;
