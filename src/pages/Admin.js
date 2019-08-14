import React from 'react';
import * as constants from '../constants/Stages.js';
import {db} from '../firebase.js';

const questionList = {
    listStyle: 'none'
};

const MIN_QUESTION_STAGE = constants.QuestionStage.READ_QUESTION;
const MAX_QUESTION_STAGE = constants.QuestionStage.READ_RESULTS;

class Admin extends React.Component {
    
    state = {
        stage: constants.SPLASH,
        stageRef: null,
        currentQuestion: 1,
        currentQuestionStage: 0,
        currentQuestionRef: null,
        questions: []
    }

    advanceQuestionStage() {
        return () => {
            const currentQuestion = this.state.currentQuestion;
            let nextQuestion = currentQuestion;
            let nextQuestionStage = this.state.currentQuestionStage + 1;
            if (nextQuestionStage > MAX_QUESTION_STAGE) {
                if (currentQuestion < this.state.questions.length) {
                    nextQuestion = currentQuestion + 1;
                    nextQuestionStage = MIN_QUESTION_STAGE;
                } else { // clamp nextQuestionStage
                    nextQuestionStage = MAX_QUESTION_STAGE;
                }
            }

            this.state.currentQuestionRef.update({
                question: nextQuestion,
                questionStage: nextQuestionStage,
            });
        }
    }

    backtrackQuestionStage() {
        return () => {
            const currentQuestion = this.state.currentQuestion;
            let prevQuestion = currentQuestion;
            let prevQuestionStage = this.state.currentQuestionStage - 1;
            if (prevQuestionStage < MIN_QUESTION_STAGE) {
                if (currentQuestion > 1) {
                    prevQuestion = currentQuestion - 1;
                    prevQuestionStage = MAX_QUESTION_STAGE;
                } else { // clamp prevQuestionStage
                    prevQuestionStage = MIN_QUESTION_STAGE;
                }
            }

            this.state.currentQuestionRef.update({
                question: prevQuestion,
                questionStage: prevQuestionStage,
            });
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
                currentQuestionStage: currentState.questionStage,
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
                <h1>Question Stage: {constants.questionStageName(this.state.currentQuestionStage)}</h1>
                <p>Master Stage: {constants.stageName(this.state.stage)}</p>
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
