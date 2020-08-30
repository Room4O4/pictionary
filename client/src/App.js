import React from 'react';
import { StylesProvider } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import './App.css';

import Home from './components/home';
import Room from './components/room';
import { PlayerContextProvider } from './contexts/PlayerContext';

function App () {
  return (
    <StylesProvider injectFirst>
      <PlayerContextProvider>
        <Router>
          <Switch>
            <Route path="/rooms" component={Room}/>
            <Route path="/" component={Home}/>
          </Switch>
        </Router>
      </PlayerContextProvider>
    </StylesProvider>
  );
};

export default App;
