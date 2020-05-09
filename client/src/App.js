import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import socket from "socket.io-client";
import Canvas from "./components/Canvas";
import { TextField } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";

function App() {
  const [socketIO, setSocketIO] = useState(null);
  const [drawWord, setDrawWord] = useState(null);
  const [showGuessBox, setShowGuessBox] = useState(false);
  const [guess, setGuess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userScores, setUserScores] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);

  useEffect(() => {
    const io = socket("http://localhost:3001");
    io.on("connect", () => {
      const user = {
        id: `player${+new Date()}`,
        name: "Player",
      };
      io.emit("C_S_LOGIN", user);
      io.on("S_C_LOGIN", () => {
        console.log("Login success");
        setCurrentUser(user);
      });

      io.on("GE_NEW_GAME", () => {
        console.log("New Game starting...");
      });

      io.on("GE_NEW_ROUND", ({ round, total }) => {
        setDrawWord(null);
        setGuess("");
        setShowGuessBox(true);
        setPreviousWord(null);
        console.log(`New Round starting, Round: ${round}, Total: ${total}`);
      });

      io.on("GE_WAIT_FOR_NEXT_ROUND", (previousWord) => {
        setShowGuessBox(false);
        setDrawWord(null);
        setPreviousWord(previousWord);
      });

      io.on("GE_ANNOUNCE_WINNER", () => {
        setShowGuessBox(false);
        setDrawWord(null);
        console.log(`Announce Winner`);
      });

      io.on("GE_NEW_WORD", (word) => {
        setDrawWord(word);
        setShowGuessBox(false);
      });

      io.on("GE_UPDATE_SCORE", (userScores) => {
        setUserScores(userScores);
        console.table(userScores);
      });
    });
    setSocketIO(io);
  }, []);

  const guessBoxPressed = (e) => {
    if (e.keyCode === 13) {
      //Enter pressed. send it to server
      setGuess("");
      console.log("New guess -", e.target.value);
      socketIO.emit("GE_NEW_GUESS", {
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
              {userScore.points}
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
        <Grid item xs={9} container>
          <Grid item xs={12}>
            <Canvas io={socketIO} />
          </Grid>
          <Grid item xs={12}>
            {showGuessBox ? (
              <TextField
                className="guessBox"
                id="txt-guess"
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
              <Typography variant="body1">
                Previous word was {previousWord}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
