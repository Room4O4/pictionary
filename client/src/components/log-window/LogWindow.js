import React, { useEffect, useRef } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import './LogWindow.css';

const LogWindow = ({ messages, height }) => {
  const listRef = useRef();

  const renderRow = (message, index) => {
    const [messageType, actualMessage] = message.split('!!!');

    return (
      <ListItem alignItems="flex-start">
        <ListItemText
          key={index}
          primary={actualMessage}
          className={messageType}
        />
      </ListItem>
    );
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  });

  if (messages && messages.length > 0) {
    return (
      <List className="LogWindow" ref={listRef}>
        {messages.map((message, index) => {
          return renderRow(message, index);
        })}
      </List>
    );
  } else {
    return null;
  }
};

export default LogWindow;
