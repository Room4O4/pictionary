import React, { useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { withHeight } from '../utils/WindowHeight';

const LogWindow = ({ messages, height }) => {
  const listRef = useRef();

  const renderRow = ({ data, index, style }) => {
    console.log(data);
    return <div style={{ ...style, height: 25 }}>{data[index]}</div>;
  };

  useEffect(() => {
    if (listRef.current) listRef.current.scrollToTop = listRef.current.scrollHeight;
  });

  if (messages && messages.length > 0) {
    return (
      <List height={height - 83} itemCount={messages.length} itemSize={25} itemData={messages} ref={listRef}>
        {renderRow}
      </List>
    );
  } else {
    return null;
  }
};

export default withHeight(LogWindow);
