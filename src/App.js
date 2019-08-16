import React from 'react';
import logo from './logo.svg';
import './App.css';
import Splash from './components/Splash.js';
import Admin from './components/Admin.js';
import CharacterSelect from './components/CharacterSelect.js';
import Quiz from './components/Quiz.js';
import Leaderboard from './components/Leaderboard.js';
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
        const currentStage = snapshot.data() || {id: constants.CHARACTER_SELECT};
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
            <Route path="/" exact component={this.state.component} />
            <Route path="/admin/" component={Admin} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
