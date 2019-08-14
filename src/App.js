import React from 'react';
import logo from './logo.svg';
import './App.css';
import Splash from './pages/Splash.js';
import Admin from './pages/Admin.js';
import CharacterSelect from './pages/CharacterSelect.js';
import Quiz from './pages/Quiz.js';
import Leaderboard from './pages/Leaderboard.js';
import { BrowserRouter as Router, Route } from "react-router-dom";
import {db} from './firebase.js';
import * as constants from './constants/Stages.js';

class App extends React.Component {
  
  state = {
    stage: constants.SPLASH,
    component: null
  }

  componentDidMount() {
    let self = this;
    
    db.collection("state").doc("stage").onSnapshot(snapshot => {
        const currentStage = snapshot.data();
        let component = null;
        if (currentStage.id === constants.CHARACTER_SELECT) {
          component = CharacterSelect;
        } else if (currentStage.id === constants.QUIZ) {
          component = Quiz;
        } else if (currentStage.id === constants.LEADERBOARD) {
          component = Leaderboard;
        } else {
          component = Splash;
        }
        self.setState({stage: currentStage.id, component: component});
    });
  }

  render() {    
    return (
      <Router>
        <div>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <Route path="/" exact component={this.state.component} />
              <Route path="/admin/" component={Admin} />
            </header>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
