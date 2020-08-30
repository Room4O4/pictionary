import React, { createContext, useState } from 'react';

const PlayerContext = createContext({});

const PlayerContextProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState(null);
  const [roomName, setRoomName] = useState(null);

  const updatePlayerName = (name) => {
    setPlayerName(name);
  };

  const updateRoomName = (room) => {
    setRoomName(room);
  };

  return (
    <PlayerContext.Provider value={{ playerName, roomName, updatePlayerName, updateRoomName }}>
      {children}
    </PlayerContext.Provider>
  );
};

export { PlayerContext, PlayerContextProvider };
