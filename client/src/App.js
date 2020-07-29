import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import socket from 'socket.io-client';
import Canvas from './components/Canvas';
import { TextField, Hidden } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import Typography from '@material-ui/core/Typography';
import ReactCountdownClock from 'react-countdown-clock';
import AddNicknameDialog from './components/dialogs/AddNicknameDialog';
import LogWindow from './components/log-window/LogWindow';
import UserScoreList from './components/player-list/UserScoreList';
import PlayersIcon from './components/icons/PlayersIcon';
import UserScoreListDialog from './components/dialogs/UserScoreListDialog';

function App () {
  const [socketIO, setSocketIO] = useState(null);
  const [drawWord, setDrawWord] = useState(null);

  const [playerNickname, setPlayerNickname] = useState(null);

  const [shouldShowPlayersList, setShouldShowPlayersList] = useState(false);

  const [showGuessBox, setShowGuessBox] = useState(false);
  const [enableGuessBox, setEnableGuessBox] = useState(false);

  const [guess, setGuess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userScores, setUserScores] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);
  const guessBoxRef = useRef(null);
  const keyboardRef = useRef();
  const [roundDuration, setRoundDuration] = useState(0);

  const GAME_STATE_IDLE = 0;
  const GAME_STATE_NEW_GAME = 1;
  const GAME_STATE_NEW_ROUND = 2;
  const GAME_STATE_WAIT_FOR_NEXT_ROUND = 3;
  const GAME_STATE_ANNOUNCE_WINNER = 4;

  const [gameState, setGameState] = useState(GAME_STATE_IDLE);

  const [messageLog, setMessageLog] = useState([]);

  useEffect(() => {
    if (guessBoxRef && guessBoxRef.current) guessBoxRef.current.focus();
  }, [showGuessBox]);

  useEffect(() => {
    if (playerNickname) {
      const io = socket('http://localhost:3001');
      io.on('connect', () => {
        const user = {
          id: `${playerNickname}_${+new Date()}`,
          name: `${playerNickname}`,
          score: 0
        };
        io.emit('C_S_LOGIN', user);
        io.on('S_C_LOGIN', () => {
          console.log('Login success');
          setCurrentUser(user);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystem!!!Logged in'
          ]);
        });

        io.on('GE_NEW_GAME', (roundDuration) => {
          console.log('New Game starting...');
          setRoundDuration(roundDuration / 1000);
          setCurrentUser({ ...user, score: 0 });
          setGameState(GAME_STATE_NEW_GAME);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystem!!!New Game starting...'
          ]);
        });

        io.on('GE_NEW_ROUND', ({ round, total }) => {
          setDrawWord(null);
          setGuess('');
          setShowGuessBox(true);
          setEnableGuessBox(true);
          setPreviousWord(null);
          setGameState(GAME_STATE_NEW_ROUND);
          console.log(`New Round starting, Round: ${round}, Total: ${total}`);
          setMessageLog((messageLog) => [
            ...messageLog,
            `msgSystem!!!New Round starting, Round: ${round}, Total: ${total}`
          ]);
        });

        io.on('GE_WAIT_FOR_NEXT_ROUND', (previousWord) => {
          setShowGuessBox(false);
          setDrawWord(null);
          setPreviousWord(previousWord);
          setGameState(GAME_STATE_WAIT_FOR_NEXT_ROUND);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystem!!!Round finished, Wait for next round...'
          ]);
        });

        io.on('GE_ANNOUNCE_WINNER', () => {
          setShowGuessBox(false);
          setDrawWord(null);
          console.log('Announce Winner');
          setShowGuessBox(false);
          setDrawWord(null);
          setGameState(GAME_STATE_ANNOUNCE_WINNER);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystemWinner!!!Game Over, And the Winner is...'
          ]);
        });

        io.on('GE_NEW_WORD', (word) => {
          setDrawWord(word);
          setShowGuessBox(false);
          setMessageLog((messageLog) => [
            ...messageLog,
            "msgSystem!!!It's your turn, Draw!"
          ]);
        });

        io.on('GE_UPDATE_SCORE', (userScores) => {
          console.table(userScores);
          setUserScores(userScores);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystem!!!Scores updated!'
          ]);
        });
      });
      setSocketIO(io);
    } else {
      console.log('playerNickname is null');
    }
  }, [playerNickname]);

  useEffect(() => {
    if (userScores && currentUser) {
      console.log(currentUser);
      const latestUserScore = userScores.find(
        (user) => user.id === currentUser.id
      ).score;
      if (latestUserScore > currentUser.score) {
        console.log('Disable guess box');
        // disable guess box if guess is right
        setEnableGuessBox(false);
        currentUser.score = latestUserScore;
      }
    }
  }, [userScores, currentUser]);

  const guessBoxPressed = (e) => {
    if (e.keyCode === 13) {
      // Enter pressed. send it to server
      const currentGuess = e.target.value;
      sendGuessToServer();
      resetGuess();
      setMessageLog((messageLog) => [
        ...messageLog,
        `msgUserGuess!!!${currentUser.id}: ${currentGuess}`
      ]);
    }
  };

  const sendGuessToServer = () => {
    console.log('New guess -', currentUser.id, guess);
    socketIO.emit('GE_NEW_GUESS', {
      userId: currentUser.id,
      guess: guess
    });
  };

  const resetGuess = () => {
    setGuess('');
    keyboardRef.current.setInput('');
  };

  useEffect(() => {
    document.body.addEventListener('touchmove', function (e) {
      // e.preventDefault();
    });
  }, []);

  const onNicknameAdded = (nickname) => {
    setPlayerNickname(nickname);
  };

  const onKeyboardInputChange = (input) => {
    console.log('Input changed', input);
    setGuess(input);
  };

  const onKeyPress = (button) => {
    console.log('Button pressed', button);
    if (button === '{enter}') {
      sendGuessToServer();
      resetGuess();
    }
  };

  return (
    <div className="App">
      <h4>Pictionary</h4>
      <Grid container className="layoutContainer">
        <Hidden smDown>
          <Grid item md={3}>
            <UserScoreList userScores={userScores} />
          </Grid>
        </Hidden>
        <Grid item md={6} xs={12}>
          <Grid item xs={12} className="canvasContainer">
            <Canvas io={socketIO} />
            {gameState === GAME_STATE_NEW_ROUND ? (
              <div className="timer">
                <ReactCountdownClock
                  className="timer"
                  seconds={roundDuration}
                  color="#000"
                  alpha={0.9}
                  size={60}
                />{' '}
              </div>
            ) : null}
            <Hidden smUp>
              <PlayersIcon
                onClick={() => {
                  setShouldShowPlayersList(true);
                }}
                className="playersIcon"
              />
            </Hidden>
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
                onChange={(e) => {
                  setGuess(e.target.value);
                  keyboardRef.current.setInput(e.target.value);
                }}
              />
            ) : (
              <Typography variant="h3">{drawWord}</Typography>
            )}
          </Grid>
          <Grid item xs={12} className="keyboardContainer">
            {showGuessBox ? (
              <Keyboard
                keyboardRef={(r) => (keyboardRef.current = r)}
                onChange={onKeyboardInputChange}
                onKeyPress={onKeyPress}
                layout={{
                  default: [
                    'q w e r t y u i o p',
                    'a s d f g h k l {enter}',
                    'z x c v b n m'
                  ]
                }}
              />
            ) : null}
          </Grid>
          {previousWord ? (
            <Grid item xs={12}>
              <Typography variant="body1">
                Previous word was {previousWord}
              </Typography>
            </Grid>
          ) : null}
        </Grid>

        <Hidden smDown>
          <Grid item md={3}>
            <LogWindow className="logWindow" messages={messageLog}></LogWindow>
          </Grid>
        </Hidden>
      </Grid>
      {!playerNickname && (
        <AddNicknameDialog onNicknameAdded={onNicknameAdded} />
      )}

      {shouldShowPlayersList && (
        <UserScoreListDialog
          userScores={userScores}
          handleDone={() => {
            setShouldShowPlayersList(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
