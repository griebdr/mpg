import React from 'react';
import './App.css';
import GameTester from './game-tester/GameTester';
import CustomComponent from './custom/CustomComponent';
import NormalComponent from './normal/NormalComponent';
import MainComponent from './main/MainComponent';

import { BrowserRouter as Router, Route } from 'react-router-dom';

class App extends React.Component {

  render() {
    return (
      <div className="Game-container">
        <Router>
          <Route exact path="/" component={MainComponent}></Route>
          <Route path="/normal" component={NormalComponent}></Route>
          <Route path="/custom" component={CustomComponent}></Route>
          <Route path="/test" component={GameTester}></Route>
        </Router>
      </div>
    );
  }
}


export default App;
