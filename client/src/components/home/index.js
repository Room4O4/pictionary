import React from 'react';
import { Paper } from '@material-ui/core';
import './index.css';
import WelcomeLayout from './WelcomeLayout';

const Home = () => {
  return (
    <div className="home">
      <Paper className="homeLayoutContainer" elevation={2}>
        <WelcomeLayout/>
      </Paper>
    </div>);
};

export default Home;
