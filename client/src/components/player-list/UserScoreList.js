import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from 'react-avatar';
import { Typography } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import './UserScoreList.css';

const buildUserList = (userScores) => {
  if (!userScores) return null;
  const renderUsers = userScores.map((userScore) => {
    const usernameListClass = userScore.roundInfo.foundWord ? 'userFoundWord userHighlight' : (userScore.roundInfo.isDrawing ? 'userHighlight' : '');
    return (
      <ListItem
        id={userScore.id}
        key={userScore.id}
        className="userScoreListItem"
      >
        <ListItemAvatar>
          {!userScore.roundInfo.isDrawing ? <Avatar
            name={userScore.name}
            round={true}
            size="30"
            textSizeRatio={1.75}
          /> : <CreateIcon />}

        </ListItemAvatar>
        <ListItemText>
          <Typography variant="body1" className="userScoreListItemId">
            <span className={`${usernameListClass}`}>{userScore.name}</span>
          </Typography>
        </ListItemText>
        <ListItemText className="userScoreListItemPoints">
          <Typography variant="body1" >
            <span className={`${usernameListClass}`}>{userScore.score}</span>
          </Typography>
        </ListItemText>
      </ListItem>
    );
  });
  return renderUsers;
};

const sortArray = (array, key) => {
  if (array) {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  } else {
    return null;
  }
};

const UserScoreList = ({ userScores }) => {
  console.log(userScores);
  const sortedScores = sortArray(userScores, 'score');
  return (
    <List className="userScoreList" component="nav">{buildUserList(sortedScores)}</List>
  );
};

export default UserScoreList;
