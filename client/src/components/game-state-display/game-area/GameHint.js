import React from 'react';
import './game-hint.scss';

const GameHint = ({ hintWord }) => {
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

export default GameHint;
