import React from 'react';
import { Button } from '@material-ui/core';
import './button.css';

const UIButton = (props) => {
  const { className, ...otherProps } = props;
  return <Button className={`${className} button`} {...otherProps}/>;
};

export default UIButton;
