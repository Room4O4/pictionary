import React, { useContext } from 'react';
import { Paper } from '@material-ui/core';
import WelcomeLayout from './WelcomeLayout';
import { useHistory } from 'react-router-dom';
import { PlayerContext } from '../../contexts/PlayerContext';

import './index.css';

const DEFAULT_ROOM = 'main';

const Home = (props) => {
  const history = useHistory();
  const { updatePlayerName, updateRoomName } = useContext(PlayerContext);

  const onPlayClicked = (name) => {
    openRoom(name, DEFAULT_ROOM);
  };

  const onRoomsClicked = () => {

  };

  const openRoom = (name, roomName) => {
    updatePlayerName(name);
    updateRoomName(roomName);
    history.push('/rooms');
  };

  return (
    <div className="home">
      <Paper className="homeLayoutContainer" elevation={2}>
        <WelcomeLayout
          onPlayClicked={onPlayClicked}
          onRoomsClicked={onRoomsClicked}/>
      </Paper>
    </div>);
};

export default Home;
