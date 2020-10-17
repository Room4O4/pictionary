'use strict';


const getRandomIndices = (word) => {
    // Random indexes to show hint letters
    const randomIndex = (arr, length) => {
      const randIndex = Math.floor(Math.random() * length);
      if (!arr.includes(randIndex)) {
        return randIndex;
      }
      return randomIndex(arr, length);
    };
  
    const guessWordLength = word.length;
    let randomIndices = [];
  
    // Show one-third of the guess word
    for (let i = 0; i < Math.ceil(guessWordLength / 3); i++) {
      randomIndices = [
        ...randomIndices,
        randomIndex(randomIndices, guessWordLength)
      ];
    }
    return randomIndices;
};

const getMaskedHintWord = (word) => {
    const randomIndices = getRandomIndices(word);
    let maskedWord = '';
  
    word.split('').forEach((letter, index) => {
      if (!randomIndices.includes(index)) {
        maskedWord += '_';
      } else {
        maskedWord += letter;
      }
    });
  
    return maskedWord;
};

module.exports = {
    getMaskedHintWord,
};
