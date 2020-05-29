import React, { useState, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";

const LogWindow = ({ messages }) => {
  const listRef = useRef();

  const renderRow = ({ data, index }) => {
    console.log(data);
    return <div>{data[index]}</div>;
  };

  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollToTop = listRef.current.scrollHeight;
  });

  if (messages && messages.length > 0) {
    return (
      <List
        height={400}
        itemCount={messages.length}
        itemSize={10}
        itemData={messages}
        ref={listRef}
      >
        {renderRow}
      </List>
    );
  } else {
    return null;
  }
};

export default LogWindow;
