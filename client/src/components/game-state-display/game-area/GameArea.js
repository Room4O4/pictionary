import React, { Fragment } from 'react';
import Canvas from './Canvas';
import FadeOutText from './anim/FadeOutText';
import ReactCountdownClock from 'react-countdown-clock';
import './game-area.css';

class GameArea extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentTime: 1,
      displayHints: false,
      hintFrom: 25, // Show hint from `nth` second
      randomIndexes: []
    };
  }

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
                  <span className={this.state.randomIndexes.includes(index) ? 'show' : 'hide'}>
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
        { liveMessage !== "It's your turn, Draw!" && this.state.displayHints ? <GameHint /> : '' }
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

  setRandomIndexes = () => {
    // Random indexes to show hint letters
    const randomIndex = (arr, length) => {
      const randIndex = Math.floor(Math.random() * length);
      if (!arr.includes(randIndex)) {
        return randIndex;
      }
      return randomIndex(arr, length);
    };

    const guessWordLength = this.props.hintWord.length;
    let randomIndexes = [];

    // Show one-third of the guess word
    for (let i = 0; i < Math.ceil(guessWordLength / 3); i++) {
      randomIndexes = [
        ...randomIndexes,
        randomIndex(randomIndexes, guessWordLength)
      ];
    }

    this.setState({ randomIndexes });
  }

  componentDidMount () {
    setInterval(() => {
      if (this.state.currentTime === this.state.hintFrom) {
        this.setState({ displayHints: true });
        this.setRandomIndexes();
      }

      this.setState({ currentTime: this.state.currentTime + 1 });
    }, 1000);
  }
}

export default GameArea;
