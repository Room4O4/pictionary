import React, { useEffect, useRef } from 'react';
import './FadeOutText.scss';

const FadeOutText = ({ text }) => {
  const fadeOutElem = useRef(null);
  const [messageType, actualMessage] = text.split('!!!');

  useEffect(() => {
    fadeOutElem.current.classList.remove('fadeText');
    // eslint-disable-next-line no-void
    void fadeOutElem.current.offsetWidth;
    fadeOutElem.current.classList.add('fadeText');
  }, [text]);

  return (
    <div className={`fadeText msgBasic ${messageType}`} ref={fadeOutElem}>
      {actualMessage}
    </div>
  );
};

export default FadeOutText;
