import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import UIButton from '../button';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';

import './WelcomeLayout.css';

const DEFAULT_ROOM = 'main';

const WelcomeLayout = (props) => {
  const [nickname, setNickname] = useState(null);
  const [roomname, setRoomname] = useState(DEFAULT_ROOM);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleRoomnameChange = (event) => {
    setRoomname(event.target.value);
  };

  const handlePlayClick = (event) => {
    props.onPlayClicked(nickname, roomname);
  };

  return (
    <div className="welcomeLayout">
      <TextField
        autoFocus
        margin="dense"
        id="nickname"
        label="Nickname"
        type="email"
        onChange={handleNicknameChange}
        value={nickname}
        className="welcomeLayoutChild"
      />
      <TextField
        autoFocus
        margin="dense"
        id="roomname"
        label="Room"
        type="email"
        onChange={handleRoomnameChange}
        value={roomname}
        className="welcomeLayoutChild"
      />
      <UIButton
        className="welcomeLayoutChild"
        onClick={handlePlayClick}
        startIcon={<SportsEsportsIcon/>}>
          Play
      </UIButton>
    </div>

  );
};

export default WelcomeLayout;
