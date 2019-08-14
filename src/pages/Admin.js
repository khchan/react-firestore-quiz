import React from 'react';
import * as constants from '../constants/Stages.js';
import {db} from '../firebase.js';

const questionList = {
    listStyle: 'none'
};

class Admin extends React.Component {
    
    state = {
        stage: constants.SPLASH,
        stageRef: null,
        currentQuestion: 1,
        currentQuestionRef: null,
        questions: []
    }

    advanceQuestionStage() {
        return () => {
            const currentQuestion = this.state.currentQuestion;
            if (currentQuestion < this.state.questions.length) {
                this.state.currentQuestionRef.update({question: currentQuestion + 1});
            }
        }
    }

    backtrackQuestionStage() {
        return () => {
            const currentQuestion = this.state.currentQuestion;
            if (currentQuestion > 1) {
                this.state.currentQuestionRef.update({question: currentQuestion - 1});
            }
        }
    }

    resetGameState() {
        return () => {
            this.state.currentQuestionRef.update({question: 1});
            this.state.stageRef.update({id: constants.SPLASH});
        }
    }

    componentDidMount() {
        let self = this;

        db.collection("questions").onSnapshot(snapshot => {
            let questions = [];
            snapshot.forEach(doc => {
                questions.push(doc.data());
            });
            self.setState({questions : questions});
        });

        db.collection("state").doc("current").onSnapshot(snapshot => {
            const currentState = snapshot.data();
            self.setState({
                currentQuestion: currentState.question,
                currentQuestionRef: snapshot.ref
            });
        });
        
        db.collection("state").doc("stage").onSnapshot(snapshot => {
            const currentStage = snapshot.data();
            self.setState({
                stage: currentStage.id, 
                stageRef: snapshot.ref
            });
        });
    }

    stageTransition(newStage) {
        return () => this.state.stageRef.update({id: newStage});
    }
    
    render() {
        const questions = this.state.questions.map(q => {
            return <li key={q.id}>{this.state.currentQuestion === q.id ? <b>{q.name}</b> : q.name}</li>;
        });

        return (
            <div>
                <h1>Current Stage: {constants.stageName(this.state.stage)}</h1>
                <button onClick={this.stageTransition(constants.SPLASH)}>Splash</button>
                <button onClick={this.stageTransition(constants.CHARACTER_SELECT)}>Character Select</button>
                <button onClick={this.stageTransition(constants.QUIZ)}>Quiz</button>
                <button onClick={this.stageTransition(constants.LEADERBOARD)}>Leaderboard</button>                
                <ul style={questionList}>{questions}</ul>
                <button onClick={this.backtrackQuestionStage()}>Previous</button>
                <button onClick={this.advanceQuestionStage()}>Next</button>
                <button onClick={this.resetGameState()}>Reset</button>
            </div>
        );
    }
}

export default Admin;
