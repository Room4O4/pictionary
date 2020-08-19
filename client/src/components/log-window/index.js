import React, { useEffect, useRef } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Paper, Typography } from '@material-ui/core';
import './LogWindow.css';

const LogWindow = ({ messages, height }) => {
  const listRef = useRef();

  const renderRow = (message, index) => {
    const [messageType, actualMessage] = message.split('!!!');

    return (
      <ListItem alignItems="flex-start">
        <ListItemText>
          <Typography variant="body2" className={messageType}>
            {actualMessage}
          </Typography>
        </ListItemText>
      </ListItem>
    );
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView(false);
    }
  });

  if (messages && messages.length > 0) {
    return (
      <Paper className="LogWindow" elevation={3}>
        <List ref={listRef}>
          {messages.map((message, index) => {
            return renderRow(message, index);
          })}
        </List>
      </Paper>
    );
  } else {
    return null;
  }
};

export default LogWindow;
