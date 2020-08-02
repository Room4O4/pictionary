import React from 'react';
import { ReactComponent as UsersIcon } from '../../assets/group-white-48dp.svg';
const { SvgIcon } = require('@material-ui/core');

function PlayersIcon (props) {
  return (
    <SvgIcon component={UsersIcon} {...props}/>
  );
}

export default PlayersIcon;
