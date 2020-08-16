import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from 'react-avatar';
import { Typography } from '@material-ui/core';

import './UserScoreList.css';

const buildUserList = (userScores) => {
  if (!userScores) return null;
  const renderUsers = userScores.map((userScore) => {
    return (
      <ListItem
        id={userScore.id}
        key={userScore.id}
        className="userScoreListItem"
      >
        <ListItemAvatar>
          <Avatar
            name={userScore.name}
            round={true}
            size="30"
            textSizeRatio={1.75}
          />
        </ListItemAvatar>
        <ListItemText>
          <Typography variant="body1" className="userScoreListItemId">
            {userScore.name}
          </Typography>
        </ListItemText>
        <ListItemText>
          <Typography variant="body1" className="userScoreListItemPoints">
            {userScore.score}
          </Typography>
        </ListItemText>
      </ListItem>
    );
  });
  return renderUsers;
};

const UserScoreList = ({ userScores }) => {
  console.log(userScores);
  return (
    <List className="userScoreList" component="nav">{buildUserList(userScores)}</List>
  );
};

export default UserScoreList;
