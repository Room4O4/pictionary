import React, { useState, useEffect, useRef } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import "./LogWindow.css";

const LogWindow = ({ messages, height }) => {
  const listRef = useRef();
  const MSG_CLASS_SYSTEM = "msgSystem!!!";
  const MSG_CLASS_USER_GUESS = "msgUserGuess!!!";
  const MSG_CLASS_USER_CORRECT_GUESS = "msgUserCorrectGuess!!!";
  const MSG_CLASS_SYSTEM_WINNER = "msgSystemWinner!!!";

  const renderRow = (message, index) => {
    const [messageType, actualMessage] = message.split("!!!");

    return (
      <ListItem alignItems="flex-start">
        <ListItemText key={index} primary={actualMessage} className={messageType} />
      </ListItem>
    );
  };

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
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
