import React, { useState, useEffect, useRef } from 'react';
import { Typography } from '@material-ui/core';
import './FadeOutText.css';

const FadeOutText = ({ text }) => {
  const fadeOutElem = useRef(null);

  useEffect(() => {
    console.log('text changed');
    fadeOutElem.current.classList.remove('fadeText');
    void fadeOutElem.current.offsetWidth;
    fadeOutElem.current.classList.add('fadeText');
  }, [text]);

  return (
    <div className="fadeText" ref={fadeOutElem}>
      {text}
    </div>
  );
};

export default FadeOutText;
