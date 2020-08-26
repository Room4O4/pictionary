import React from 'react';
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
    <Router>
      <Switch>
        <Route path="/room" component={Room}/>
        <Route path="/" component={Home}/>
      </Switch>
    </Router>
  );
};

export default App;
