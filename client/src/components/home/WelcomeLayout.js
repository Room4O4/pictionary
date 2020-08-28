import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import UIButton from '../button';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

import './WelcomeLayout.css';

const WelcomeLayout = () => {
  const [nickname, setNickname] = useState(null);

  const handleInputChange = (event) => {
    setNickname(event.target.value);
  };

  const handlePlayClick = (event) => {

  };

  const handleRoomsClick = (event) => {

  };

  return (
    <div className="welcomeLayout">
      <TextField
        autoFocus
        margin="dense"
        id="nickname"
        label="Nickname"
        type="email"
        onChange={handleInputChange}
        value={nickname}
        className="welcomeLayoutChild"
      />
      <UIButton
        className="welcomeLayoutChild"
        onClick={handlePlayClick}
        startIcon={<SportsEsportsIcon/>}>
          Play
      </UIButton>
      <UIButton
        className="welcomeLayoutChild"
        onClick={handleRoomsClick}
        startIcon={<MeetingRoomIcon/>}>
          Rooms
      </UIButton>
    </div>

  );
};

export default WelcomeLayout;
