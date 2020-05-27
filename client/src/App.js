import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import socket from 'socket.io-client';
import Canvas from './components/Canvas';
import { TextField } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ReactCountdownClock from 'react-countdown-clock';

function App() {
  const [socketIO, setSocketIO] = useState(null);
  const [drawWord, setDrawWord] = useState(null);

  const [showGuessBox, setShowGuessBox] = useState(false);
  const [enableGuessBox, setEnableGuessBox] = useState(false);

  const [guess, setGuess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userScores, setUserScores] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);
  const guessBoxRef = useRef(null);
  const [roundDuration, setRoundDuration] = useState(0);

  const GAME_STATE_IDLE = 0;
  const GAME_STATE_NEW_GAME = 1;
  const GAME_STATE_NEW_ROUND = 2;
  const GAME_STATE_WAIT_FOR_NEXT_ROUND = 3;
  const GAME_STATE_ANNOUNCE_WINNER = 4;
  const [gameState, setGameState] = useState(GAME_STATE_IDLE);

  useEffect(() => {
    if (guessBoxRef && guessBoxRef.current) guessBoxRef.current.focus();
  }, [showGuessBox]);

  useEffect(() => {
    document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
  }, []);
  
  useEffect(() => {
    const io = socket('http://localhost:3001');
    io.on('connect', () => {
      const user = {
        id: `player${+new Date()}`,
        name: 'Player',
        score: 0,
      };
      io.emit('C_S_LOGIN', user);
      io.on('S_C_LOGIN', () => {
        console.log('Login success');
        setCurrentUser(user);
      });

      io.on('GE_NEW_GAME', (roundDuration) => {
        console.log('New Game starting...');
        setRoundDuration(roundDuration / 1000);
        setCurrentUser({ ...user, score: 0 });
        setGameState(GAME_STATE_NEW_GAME);
      });

      io.on('GE_NEW_ROUND', ({ round, total }) => {
        setDrawWord(null);
        setGuess('');
        setShowGuessBox(true);
        setEnableGuessBox(true);
        setPreviousWord(null);
        setGameState(GAME_STATE_NEW_ROUND);
        console.log(`New Round starting, Round: ${round}, Total: ${total}`);
      });

      io.on('GE_WAIT_FOR_NEXT_ROUND', (previousWord) => {
        setShowGuessBox(false);
        setDrawWord(null);
        setPreviousWord(previousWord);
        setGameState(GAME_STATE_WAIT_FOR_NEXT_ROUND);
      });

      io.on('GE_ANNOUNCE_WINNER', () => {
        setShowGuessBox(false);
        setDrawWord(null);
        console.log(`Announce Winner`);
        setShowGuessBox(false);
        setDrawWord(null);
        setGameState(GAME_STATE_ANNOUNCE_WINNER);
      });

      io.on('GE_NEW_WORD', (word) => {
        setDrawWord(word);
        setShowGuessBox(false);
      });

      io.on('GE_UPDATE_SCORE', (userScores) => {
        console.table(userScores);
        setUserScores(userScores);
      });
    });
    setSocketIO(io);
  }, []);

  useEffect(() => {
    if (userScores && currentUser) {
      console.log(currentUser);
      const latestUserScore = userScores.find((user) => user.id === currentUser.id).score;
      if (latestUserScore > currentUser.score) {
        console.log('Disable guess box');
        //disable guess box if guess is right
        setEnableGuessBox(false);
        currentUser.score = latestUserScore;
      }
    }
  }, [userScores]);

  const guessBoxPressed = (e) => {
    if (e.keyCode === 13) {
      //Enter pressed. send it to server
      setGuess('');
      console.log('New guess -', currentUser.id, e.target.value);
      socketIO.emit('GE_NEW_GUESS', {
        userId: currentUser.id,
        guess: e.target.value,
      });
    }
  };

  const buildUserList = () => {
    if (!userScores) return null;
    const renderUsers = userScores.map((userScore) => {
      return (
        <ListItem id={userScore.id} className="userScoreListItem">
          <ListItemText>
            <Typography variant="body1" className="userScoreListItemId">
              {userScore.id}
            </Typography>
          </ListItemText>

          <ListItemText>
            <Typography variant="body1" className="userScoreListItemPoints">
              {userScore.score}
            </Typography>
          </ListItemText>
        </ListItem>
      );
    });
    return renderUsers;
  };

  return (
    <div className="App">
      <h4>Pictionary</h4>
      <Grid container className="layoutContainer">
        <Grid item xs={3}>
          <List component="nav" className="userScoreList">
            {buildUserList()}
          </List>
        </Grid>
        <Grid item xs={9}>
          <Grid item xs={12} className="canvasContainer">
            <Canvas io={socketIO} />
            {gameState === GAME_STATE_NEW_ROUND ? (
              <div className="timer">
                <ReactCountdownClock className="timer" seconds={roundDuration} color="#000" alpha={0.9} size={60} />{' '}
              </div>
            ) : null}
          </Grid>
          <Grid item xs={12} className="inputContainer">
            {showGuessBox ? (
              <TextField
                className="guessBox"
                id="txt-guess"
                ref={guessBoxRef}
                disabled={!enableGuessBox}
                label="Guess!"
                value={guess}
                variant="outlined"
                onKeyDown={(e) => guessBoxPressed(e)}
                onChange={(e) => setGuess(e.target.value)}
              />
            ) : (
              <Typography variant="h3">{drawWord}</Typography>
            )}
          </Grid>
          {previousWord ? (
            <Grid item xs={12}>
              <Typography variant="body1">Previous word was {previousWord}</Typography>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
