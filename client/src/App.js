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

function App () {
  return (
    <StylesProvider injectFirst>
      <Router>
        <Switch>
          <Route path="/room" component={Room}/>
          <Route path="/" component={Home}/>
        </Switch>
      </Router>
    </StylesProvider>
  );
};

export default App;
