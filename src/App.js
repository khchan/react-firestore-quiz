import React from 'react';
import './App.css';
import Splash from './components/Splash.js';
import Admin from './components/Admin.js';
import CharacterSelect from './components/CharacterSelect.js';
import Quiz from './components/Quiz.js';
import Leaderboard from './components/Leaderboard.js';
import { BrowserRouter as Router, Route } from "react-router-dom";
import {auth, db} from './firebase.js';
import * as constants from './constants/Stages.js';
import * as usertypes from './constants/UserTypes.js';

class App extends React.Component {
  
  state = {
    stage: constants.SPLASH,
    component: null
  }

  componentDidMount() {
    let self = this;

    auth.signInAnonymously().catch(error => {
        // unable to sign in!
        console.log(error.code);
        console.log(error.message);
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            let sessionRef = db.collection('sessions').doc(user.uid);
            sessionRef.get().then(doc => {
                if (!doc.exists) {
                    // this is a new user - setup
                    sessionRef.set({
                        type: usertypes.SPECTATOR,
                        profile: null,
                    });
                } else {
                    // this is an existing user, read persisted data
                }
            });
            // ...
        } else {
            // User is signed out.
        }
    });
    
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
