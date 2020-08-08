import React, { useState, useEffect, useRef } from 'react';
import socket from 'socket.io-client';
import { TextField, Hidden, IconButton, Badge, Paper, Toolbar } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Grid from '@material-ui/core/Grid';
import Keyboard from 'react-simple-keyboard';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';

import AppBar from './components/appbar/PictionaryAppBar';
import AddNicknameDialog from './components/dialogs/AddNicknameDialog';
import LogWindow from './components/log-window/LogWindow';
import UserScoreList from './components/player-list/UserScoreList';
import PlayersIcon from './components/icons/PlayersIcon';
import UserScoreListDialog from './components/dialogs/UserScoreListDialog';
import * as GameStateConstants from './constants/AppConstants';
import GameStateDisplay from './components/game-state-display/GameStateDisplay';
import { OnScreenKeyboardLayout, OnScreenKeyboardDisplay } from './constants/KeyboardLayout';

import './App.css';
import 'react-simple-keyboard/build/css/index.css';

function App () {
  const [socketIO, setSocketIO] = useState(null);
  const [drawWord, setDrawWord] = useState(null);
  const [playerNickname, setPlayerNickname] = useState(null);
  const [shouldShowPlayersList, setShouldShowPlayersList] = useState(false);
  const [layoutName, setLayoutName] = useState('default');
  const [showGuessBox, setShowGuessBox] = useState(false);
  const [disableGuessBox, setDisableGuessBox] = useState(true);
  const [guess, setGuess] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userScores, setUserScores] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);
  const [roundDuration, setRoundDuration] = useState(0);
  const [roundInfo, setRoundInfo] = useState({ current: 0, total: 0 });
  const [gameState, setGameState] = useState(
    GameStateConstants.GAME_STATE_IDLE
  );
  const [messageLog, setMessageLog] = useState([]);
  const [lastGuess, setLastGuess] = useState('');

  const guessBoxRef = useRef(null);
  const keyboardRef = useRef();

  const isOnscreenKeyboardVisible = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (guessBoxRef && guessBoxRef.current) guessBoxRef.current.focus();
  }, [showGuessBox]);

  useEffect(() => {
    if (playerNickname) {
      const io = socket('http://192.168.1.6:3001');
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
          setGameState(GameStateConstants.GAME_STATE_NEW_GAME);
          setMessageLog((messageLog) => [
            ...messageLog,
            'msgSystem!!!New Game starting...'
          ]);
        });

        io.on('GE_NEW_ROUND', ({ round, total }) => {
          setDrawWord(null);
          setGuess('');
          setShowGuessBox(true);
          setDisableGuessBox(false);
          setPreviousWord(null);
          setRoundInfo({ current: total - round + 1, total });
          setGameState(GameStateConstants.GAME_STATE_NEW_ROUND);
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
          setGameState(GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND);
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
          setGameState(GameStateConstants.GAME_STATE_ANNOUNCE_WINNER);
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

        io.on('GE_UPDATE_GUESS', (lastGuess) => {
          let message = '';
          if (lastGuess.found) {
            message = `${lastGuess.userName} has found the word!`;
          } else {
            message = `${lastGuess.userName} guessed ${lastGuess.guess}`;
          }
          setMessageLog((messageLog) => [...messageLog, message]);
          setLastGuess(message);
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
        setDisableGuessBox(true);
        currentUser.score = latestUserScore;
      }
    }
  }, [userScores, currentUser]);

  useEffect(() => {
    document.body.addEventListener('touchmove', function (e) {
      // e.preventDefault();
    });
  }, []);

  const guessBoxPressed = (e) => {
    if (e.keyCode === 13) {
      // Enter pressed. send it to server
      const currentGuess = e.target.value;
      sendGuessToServer();
      resetGuess();
      setMessageLog((messageLog) => [
        ...messageLog,
        `msgUserGuess!!!${currentUser.name}: ${currentGuess}`
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
    if (keyboardRef.current) {
      keyboardRef.current.setInput('');
    }
  };

  const onNicknameAdded = (nickname) => {
    setPlayerNickname(nickname);
  };

  const onKeyboardInputChange = (input) => {
    setGuess(input);
  };

  const onKeyPress = (button) => {
    if (button === '{ent}') {
      sendGuessToServer();
      resetGuess();
    } else if (button === '{shift}' || button === '{lock}') {
      handleShift();
    } else if (button === '{numbers}' || button === '{abc}') {
      handleNumbers();
    }
  };

  const handleShift = () => {
    setLayoutName(layoutName === 'default' ? 'shift' : 'default');
  };

  const handleNumbers = () => {
    setLayoutName(layoutName === 'default' ? 'numbers' : 'default');
  };

  const renderPlayersIcon = () => {
    return (
      <Hidden smUp>
        <div className="playersIconContainer">
          <IconButton className="playersIconButton" aria-label="players" onClick={() => {
            setShouldShowPlayersList(true);
          }}>
            <Badge badgeContent={userScores ? userScores.length : 0} color="secondary">
              <PlayersIcon className="playersIcon" />
            </Badge>
          </IconButton>
        </div>
      </Hidden>
    );
  };

  const renderGameState = () => {
    switch (gameState) {
      case GameStateConstants.GAME_STATE_IDLE:
        return <GameStateDisplay gameState={{ state: gameState }} />;
      case GameStateConstants.GAME_STATE_NEW_ROUND:
        return (
          <GameStateDisplay
            gameState={{
              state: gameState,
              socket: socketIO,
              lastGuess,
              roundDuration
            }}
          />
        );
      case GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND:
        return <GameStateDisplay gameState={{ state: gameState, roundInfo }} />;
      case GameStateConstants.GAME_STATE_ANNOUNCE_WINNER:
        return <GameStateDisplay gameState={{ state: gameState }} />;
      default:
        break;
    }
  };

  const renderKeyboard = () => {
    return (
      <Hidden smUp>
        <Grid item xs={12} className="keyboardContainer">
          {showGuessBox ? (
            <Keyboard
              keyboardRef={(r) => (keyboardRef.current = r)}
              onChange={onKeyboardInputChange}
              onKeyPress={onKeyPress}
              autoUseTouchEvents={true}
              mergeDisplay={true}
              layoutName={layoutName}
              layout={OnScreenKeyboardLayout}
              display= {OnScreenKeyboardDisplay}
            />
          ) : null}
        </Grid>
      </Hidden>
    );
  };

  return (
    <div className="App">
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
              Pictionary
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container className="layoutContainer">
        <Hidden mdDown>
          <Grid item md={3} lg={4}>
            <UserScoreList userScores={userScores} />
            <LogWindow className="logWindow" messages={messageLog}></LogWindow>
          </Grid>
        </Hidden>
        <Grid item md={12} lg={8}>
          <Grid container>
            <Grid item xs={12}>
              <Paper elevation={3} className="canvasContainer">
                {renderPlayersIcon()}
                {renderGameState()}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <div className="inputContainer">
                {showGuessBox ? (
                  <TextField
                    className="guessBox"
                    id="txt-guess"
                    size="small"
                    ref={guessBoxRef}
                    disabled={disableGuessBox || isOnscreenKeyboardVisible}
                    label="Guess!"
                    value={guess}
                    variant="outlined"
                    onKeyDown={(e) => guessBoxPressed(e)}
                    onChange={(e) => {
                      setGuess(e.target.value);
                      if (keyboardRef.current) {
                        keyboardRef.current.setInput(e.target.value);
                      }
                    }}
                  />
                ) : (
                  <Typography variant="h3">{drawWord}</Typography>
                )}
              </div>
            </Grid>
            {renderKeyboard()}
            {previousWord ? (
              <Grid item xs={12}>
                <Typography variant="body1">
                  Previous word was {previousWord}
                </Typography>
              </Grid>
            ) : null}
          </Grid>
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
      </Grid>
    </div>
  );
}

export default App;
