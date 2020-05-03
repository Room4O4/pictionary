import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import socket from "socket.io-client";
import Canvas from "./components/Canvas";
function App() {
  const [socketIO, setSocketIO] = useState(null);
  useEffect(() => {
    const io = socket("http://localhost:3001");
    io.on("connect", () => {
      const user = {
        id: `tom${+new Date()}`,
        name: "tom",
      };
      io.emit("C_S_LOGIN", user);
      io.on("S_C_LOGIN", () => {
        console.log("Login success");
      });

      io.on("GE_NEW_GAME", () => {
        console.log("New Game starting...");
      });

      io.on("GE_NEW_ROUND", (roundNumber, totalRounds) => {
        console.log(
          `New Round starting, Round: ${roundNumber}, Total: ${totalRounds}`
        );
      });

      io.on("GE_ANNOUNCE_WINNER", () => {
        console.log(`Announce Winner`);
      });
    });
    setSocketIO(io);
  }, []);

  return (
    <div className="App">
      <h4>Pictionary Client</h4>
      <Canvas io={socketIO} />
    </div>
  );
}

export default App;
