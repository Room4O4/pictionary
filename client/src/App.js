import React, { useState, useEffect, useRef } from 'react';
import socket from 'socket.io-client';
import { TextField, Hidden, IconButton, Badge, Paper, Toolbar, SvgIcon } from '@material-ui/core';
import { StylesProvider } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Grid from '@material-ui/core/Grid';
import Keyboard from 'react-simple-keyboard';
import ElementResizeDetectorMaker from 'element-resize-detector';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as AppLogo } from './assets/logo.svg';

import AppBar from './components/appbar';
import AddNicknameDialog from './components/dialogs/AddNicknameDialog';
import LogWindow from './components/log-window';
import UserScoreList from './components/player-list/UserScoreList';
import PlayersIcon from './components/icons/PlayersIcon';
import UserScoreListDialog from './components/dialogs/UserScoreListDialog';
import * as GameStateConstants from './constants/AppConstants';
import GameStateDisplay from './components/game-state-display/GameStateDisplay';
import { OnScreenKeyboardLayout, OnScreenKeyboardDisplay } from './constants/KeyboardLayout';

import './App.css';
import 'react-simple-keyboard/build/css/index.css';
import CanvasToolbox from './components/toolbox';

const DEFAULT_ROOM = 'main';
const ROUND_DURATION = 60;

function App () {
  const [socketIO, setSocketIO] = useState(null);
  const [room, setRoom] = useState(DEFAULT_ROOM);
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
  const [canvasOptions, setCanvasOptions] = useState({ color: '#000000', enabled: true });
  const [messageLog, setMessageLog] = useState([]);
  const [liveMessage, setLiveMessage] = useState('');
  const [winners, setWinners] = useState([]);

  const guessBoxRef = useRef(null);
  const keyboardRef = useRef();
  const canvasPaperRef = useRef(null);

  const isOnscreenKeyboardVisible = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (guessBoxRef && guessBoxRef.current) guessBoxRef.current.focus();
  }, [showGuessBox]);

  useEffect(() => {
    if (playerNickname) {
      const io = socket('http://192.168.1.8:3001');
      io.on('connect', () => {
        const user = {
          id: `${playerNickname}_${+new Date()}`,
          name: `${playerNickname}`,
          score: 0
        };
        console.log('Socket connected', user);

        io.emit('C_S_LOGIN', user, room);

        io.on('S_C_LOGIN', cbSCLogin);
        io.on('GE_NEW_GAME', cbNewGame);
        io.on('GE_NEW_ROUND', cbNewRound);
        io.on('GE_WAIT_FOR_NEXT_ROUND', cbWaitForNextRound);
        io.on('GE_ANNOUNCE_WINNER', cbAnnounceWinner);
        io.on('GE_NEW_WORD', cbNewWord);
        io.on('GE_UPDATE_SCORE', cbUpdateScore);
        io.on('GE_UPDATE_GUESS', cbUpdateGuess);

        io.on('disconnect', () => {
          console.log('Socket disconnected', user);
          io.removeEventListener('S_C_LOGIN', cbSCLogin);
          io.removeEventListener('GE_NEW_GAME', cbNewGame);
          io.removeEventListener('GE_NEW_ROUND', cbNewRound);
          io.removeEventListener('GE_WAIT_FOR_NEXT_ROUND', cbWaitForNextRound);
          io.removeEventListener('GE_ANNOUNCE_WINNER', cbAnnounceWinner);
          io.removeEventListener('GE_NEW_WORD', cbNewWord);
          io.removeEventListener('GE_UPDATE_SCORE', cbUpdateScore);
          io.removeEventListener('GE_UPDATE_GUESS', cbUpdateGuess);
          setCurrentUser(null);
        });
      });
      // Currently adding this line to prevent link check fails as setRoom is unused.
      // Once Rooms feature is implemented, this shall be used
      setRoom(room);

      setSocketIO(io);
    } else {
      console.log('playerNickname is null');
    }
  }, [playerNickname]);

  const cbNewWord = (word) => {
    console.log('EVENT GE_NEW_WORD');
    setLiveMessage('');
    setDrawWord(word);
    setShowGuessBox(false);
    setMessageLog((messageLog) => [
      ...messageLog,
      "msgSystemImp!!!It's your turn, Draw!"
    ]);
    setLiveMessage("msgSystemImp!!!It's your turn, Draw!");
  };

  const cbAnnounceWinner = (winners) => {
    console.log('EVENT GE_ANNOUNCE_WINNER');
    setShowGuessBox(false);
    setLiveMessage('');
    setWinners(winners);
    console.log('Announce Winner');
    setShowGuessBox(false);
    setDrawWord(null);
    setGameState(GameStateConstants.GAME_STATE_ANNOUNCE_WINNER);
    if (winners) {
      if (winners.length > 1) {
        let winnersString = '';
        winnersString = winners.reduce((accumulator, winner) => {
          if (accumulator) {
            return `${accumulator}, ${winner.name}`;
          } else {
            return winner.name;
          }
        }, '');
        console.log(winnersString);
        setMessageLog((messageLog) => [
          ...messageLog,
          `msgSystemWinner!!!Game Over, And the Winners are ${winnersString}`
        ]);
      } else {
        setMessageLog((messageLog) => [
          ...messageLog,
          `msgSystemWinner!!!Game Over, And the Winner is ${winners[0].name}`
        ]);
      }
    } else {
      setMessageLog((messageLog) => [
        ...messageLog,
        'msgSystemWinner!!!Game Over, Wait for new game!'
      ]);
    }
  };

  const cbWaitForNextRound = ({ previousWord, round, total }) => {
    console.log('EVENT GE_WAIT_FOR_NEW_ROUND');
    setShowGuessBox(false);
    setDrawWord(null);
    setLiveMessage('');
    setPreviousWord(previousWord);
    setRoundInfo({ current: total - round, total });
    setGameState(GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND);
    setMessageLog((messageLog) => [
      ...messageLog,
      'msgSystem!!!Round finished, Wait for next round...'
    ]);
  };

  const cbNewRound = ({ round, total, currentDrawingUser, startTimestamp }) => {
    console.log('EVENT GE_NEW_ROUND');
    const secondsLeft = Math.min(ROUND_DURATION - ((+new Date() - startTimestamp) / 1000), ROUND_DURATION);
    setRoundDuration(secondsLeft);
    setDrawWord(null);
    setLiveMessage('');
    setGuess('');
    setShowGuessBox(true);
    setDisableGuessBox(false);
    setPreviousWord(null);
    setRoundInfo({ current: total - round + 1, total });
    setGameState(GameStateConstants.GAME_STATE_NEW_ROUND);
    console.log(`New Round starting, Round: ${round}, Total: ${total}`);
    const innerMessage = `${currentDrawingUser.id.split('_')[0]} is drawing. Start guessing!`;
    setMessageLog((messageLog) => [
      ...messageLog,
      `msgSystem!!!New Round starting, Round: ${(total - round + 1)}, Total: ${total}`,
      `msgSystemImp!!!${innerMessage}`
    ]);
    setLiveMessage(`msgSystemImp!!!${innerMessage}`);
  };

  const cbNewGame = (roundDuration) => {
    console.log('EVENT GE_NEW_GAME');
    setRoundDuration(roundDuration / 1000);
    setCurrentUser((currentUser) => { return { ...currentUser, score: 0 }; });
    setLiveMessage('');
    setWinners([]);
    setGameState(GameStateConstants.GAME_STATE_NEW_GAME);
    setMessageLog((messageLog) => [
      ...messageLog,
      'msgSystem!!!New Game starting...'
    ]);
  };

  const cbSCLogin = (loggedInUser) => {
    console.log('EVENT S_C_LOGIN');
    setCurrentUser(loggedInUser);
    setMessageLog((messageLog) => [
      ...messageLog,
      'msgSystem!!!Logged in'
    ]);
  };

  const cbUpdateScore = (updatedUserScores) => {
    console.log('EVENT GE_UPDATE_SCORE');
    console.table(updatedUserScores);
    setUserScores(updatedUserScores);
  };

  const cbUpdateGuess = (liveMessage) => {
    console.log('EVENT GE_UPDATE_GUESS');
    let message = '';
    if (liveMessage.found) {
      const innerMessage = `${liveMessage.userName} has found the word!`;
      message = `msgSystemFoundWord!!!${innerMessage}`;
      setLiveMessage(message);
    } else {
      setCurrentUser(currentUser => {
        const innerMessage = `[${liveMessage.userName}]: ${liveMessage.guess}`;
        if (liveMessage.userName !== currentUser.name) { message = `msgSystemGuess!!!${innerMessage}`; }
        // The above check doesn't apply to the liveMessage area
        setLiveMessage(`msgSystemGuess!!!${innerMessage}`);
        return currentUser;
      });
    }
    setMessageLog((messageLog) => [...messageLog, message]);
  };

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

  const erd = ElementResizeDetectorMaker();

  useEffect(() => {
    erd.listenTo(document.getElementById('canvasContainer'), (element) => {
      console.log('Resize', element.offsetWidth, element.offsetHeight);
      canvasPaperRef.current.style.height = `${element.offsetWidth}px`;
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

  const handleColorChange = (color) => {
    setCanvasOptions({
      color: color,
      enabled: canvasOptions.enabled
    });
  };

  const handleClearCanvas = () => {
    socketIO.emit('C_S_CLEAR_CANVAS', room);
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
              liveMessage,
              roundDuration
            }}
            canvasOptions={{ color: canvasOptions.color, enabled: !!drawWord }}
          />
        );

      case GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND:
        return <GameStateDisplay gameState={{ state: gameState, roundInfo, userScores }} />;
      case GameStateConstants.GAME_STATE_ANNOUNCE_WINNER:
        return <GameStateDisplay gameState={{ state: gameState, winners }} />;
      default:
        break;
    }
  };

  const renderKeyboard = () => {
    return (
      <Hidden smUp>
        <Grid item xs={11} className="keyboardContainer">
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

  const renderCanvasToolbox = () => {
    console.log(`showGuessBox ${showGuessBox}, gamestate ${gameState}`);
    if (gameState === GameStateConstants.GAME_STATE_NEW_ROUND && !showGuessBox) {
      return (
        <Grid container>
          <Grid item xs={11} className="canvasToolboxContainer">
            <CanvasToolbox onColorChanged={handleColorChange} onClearCanvasPressed={handleClearCanvas} />
          </Grid>
        </Grid>
      );
      // return <CanvasToolbox onColorChanged={handleColorChange} onClearCanvasPressed={handleClearCanvas} />;
    } else {
      return null;
    }
  };

  const renderAppBar = () => {
    return (
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <SvgIcon fontSize="large" component={AppLogo} viewBox="0 0 48 48" width="48" height="48"/>
          </IconButton>
          <Typography variant="h6">
              Pictionary
          </Typography>
        </Toolbar>
      </AppBar>
    );
  };

  const renderLeftPane = () => {
    return (
      <Hidden mdDown>
        <Grid item lg={3}>
          <Grid container>
            <Grid item xs={10} className="userScoreGridItem">
              <Paper elevation={3} className="userScoreContainer" >
                <UserScoreList userScores={userScores} />
              </Paper>
            </Grid>
            <Grid item xs={10} className="logWindowContainer">
              <LogWindow className="logWindow" messages={messageLog}></LogWindow>
            </Grid>
          </Grid>
        </Grid>
      </Hidden>
    );
  };

  const renderBottomPane = () => {
    if (gameState === GameStateConstants.GAME_STATE_WAIT_FOR_NEXT_ROUND ||
      gameState === GameStateConstants.GAME_STATE_IDLE ||
      gameState === GameStateConstants.GAME_STATE_ANNOUNCE_WINNER) {
      return <Hidden mdUp>
        <Paper elevation={3} style={{ marginBottom: '10px', marginTop: '10px' }} >
          <UserScoreList userScores={userScores} />
        </Paper>
      </Hidden>;
    } else {
      return <div>
        {showGuessBox ? (

          <TextField
            className="guessBox"
            id="txt-guess"
            size="small"
            autoComplete="off"
            inputRef={input => input && input.focus()}
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
          <Typography variant="h5">{drawWord}</Typography>
        )}
      </div>;
    }
  };

  const renderMidPane = () => {
    return (
      <Grid item md={8} lg={6} className="midPane">
        <Grid container>
          <Grid item xs={11} md={9} lg={9} className="midPaneContainer">
            <Paper ref={canvasPaperRef} elevation={3} id="canvasContainer" className="canvasContainer">
              {renderPlayersIcon()}
              {renderGameState()}
            </Paper>
          </Grid>
          {previousWord ? (
            <Grid item xs={12}>
              <Typography variant="body1" style={{ marginTop: '10px' }}>
                  Previous word was {previousWord}
              </Typography>
            </Grid>
          ) : null}
          <Grid item xs={11} md={9} lg={9} className="inputContainer">
            {renderBottomPane()}
          </Grid>
          {renderKeyboard()}
        </Grid>
      </Grid>
    );
  };

  return (
    <StylesProvider injectFirst>
      <div className="App">
        {renderAppBar()}
        <Grid container className="layoutContainer">
          {renderLeftPane()}
          {renderMidPane()}
          <Grid item xs={12} md={4} lg={3}>
            {renderCanvasToolbox()}
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
    </StylesProvider>
  );
}

export default App;
