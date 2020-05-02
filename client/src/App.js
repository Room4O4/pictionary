import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import socket from 'socket.io-client';
function App() {
  useEffect(() => {
    const io = socket('http://localhost:3001');
    io.on('connect', () => {
      const user = {
        id: `tom${+new Date()}`,
        name: 'tom',
      };
      io.emit('C_S_LOGIN', user);
      io.on('S_C_LOGIN', () => {
        console.log('Login success');
      });

      io.on('GE_NEW_GAME', () => {
        console.log('New Game starting...');
      });

      io.on('GE_NEW_ROUND', (roundNumber, totalRounds) => {
        console.log(`New Round starting, Round: ${roundNumber}, Total: ${totalRounds}`);
      });

      io.on('GE_ANNOUNCE_WINNER', () => {
        console.log(`Announce Winner`);
      });
    });
  }, []);

  return (
    <div className="App">
      <h4>Pictionary Client</h4>
    </div>
  );
}

export default App;
