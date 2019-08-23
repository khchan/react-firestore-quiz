import React from 'react';
import '../styles/Buttons.css';
import * as constants from '../constants/Stages.js';
import {db, FieldValue} from '../firebase.js';
import {Profiles} from '../constants/Profiles.js';

const questionList = {
    listStyle: 'none'
};

const MIN_QUESTION_STAGE = constants.QuestionStage.READ_QUESTION;
const MAX_QUESTION_STAGE = constants.QuestionStage.READ_RESULTS;
const ANSWER_COUNTDOWN_DURATION = 30; // in seconds, TODO make me tunable per question

class Admin extends React.Component {
    
    state = {
        stage: constants.SPLASH,
        stageRef: null,
        currentQuestion: 1,
        currentQuestionResults: [],
        questionStage: 0,
        currentStateRef: null,
        countdown: 0,
        questions: [],
        startTime: 0, // firebase timestamp

        // local countdown timer state
        endTime: 0, // epoch seconds
        localCountdownSeconds: -1,
        localCountdownIntervalID: -1,

        unsubscribeCallbacks: []
    }

    beginCountdown() {
        let localCountdownIntervalID = setInterval(() => {
            let now = new Date().getTime();
            let end = new Date(0);
            end.setUTCSeconds(this.state.endTime);
            let dt = end - now;
            let seconds = Math.max(0, Math.floor((dt % (1000 * 60)) / 1000));
            this.setState({ localCountdownSeconds: seconds });
            if (dt < 0) {
                this.resetCountdown();
            }
        }, 1000);

        this.setState({
            localCountdownIntervalID: localCountdownIntervalID,
        });
    }

    resetCountdown() {
        clearInterval(this.state.localCountdownIntervalID);
        this.setState({ localCountdownSeconds: -1 });
    }

    goToQuestion(questionId) {
        if (this.state.currentQuestion !== questionId) {
            this.state.currentStateRef.update({
                question: questionId, 
                questionStage: constants.QuestionStage.READ_QUESTION,
                response1: [],
                response2: [],
                response3: [],
                response4: []
            });
        }
    }

    advanceQuestionStage() {
        return () => {
            let payload = {};
            let nextQuestionStage = this.state.questionStage + 1;
            if (nextQuestionStage > MAX_QUESTION_STAGE) {
                const currentQuestion = this.state.currentQuestion;
                if (currentQuestion < this.state.questions.length) {
                    payload.question = currentQuestion + 1;
                    nextQuestionStage = MIN_QUESTION_STAGE;
                } else { // clamp nextQuestionStage
                    nextQuestionStage = MAX_QUESTION_STAGE;
                }
            } else if (nextQuestionStage === constants.QuestionStage.AUDIENCE_ANSWER) {
                // reset question results
                payload.response1 = [];
                payload.response2 = [];
                payload.response3 = [];
                payload.response4 = [];
            } else if (nextQuestionStage === constants.QuestionStage.READ_RESULTS) {
                // record question result history
                const currentQuestion = this.state.currentQuestion;
                const record = db.collection("state").doc("q" + currentQuestion);
                record.set({
                    id: currentQuestion,
                    response1: this.state.currentQuestionResults[0],
                    response2: this.state.currentQuestionResults[1],
                    response3: this.state.currentQuestionResults[2],
                    response4: this.state.currentQuestionResults[3],
                });
            }

            payload.questionStage = nextQuestionStage;

            if (nextQuestionStage === constants.QuestionStage.AUDIENCE_ANSWER) {
                payload.startTime = FieldValue.serverTimestamp();
                // use client-predicted end time until we get a
                // valid start time from the server
                let clientNow = Math.round(new Date().getTime() / 1000);
                this.setState({
                    endTime: clientNow + ANSWER_COUNTDOWN_DURATION,
                    localCountdownSeconds: ANSWER_COUNTDOWN_DURATION,
                });
                this.beginCountdown();
            } else {
                this.resetCountdown();
            }

            this.state.currentStateRef.update(payload);
        }
    }

    backtrackQuestionStage() {
        return () => {
            // we don't adjust start time when going back by design
            const currentQuestion = this.state.currentQuestion;
            let prevQuestion = currentQuestion;
            let prevQuestionStage = this.state.questionStage - 1;
            if (prevQuestionStage < MIN_QUESTION_STAGE) {
                if (currentQuestion > 1) {
                    prevQuestion = currentQuestion - 1;
                    prevQuestionStage = MAX_QUESTION_STAGE;
                } else { // clamp prevQuestionStage
                    prevQuestionStage = MIN_QUESTION_STAGE;
                }
            }

            this.state.currentStateRef.update({
                question: prevQuestion,
                questionStage: prevQuestionStage,
            });

            this.resetCountdown();
        }
    }

    resetGameState() {
        return () => {
            this.state.currentStateRef.update({
                question: 1, 
                questionStage: constants.QuestionStage.READ_QUESTION
            });
            this.state.stageRef.update({id: constants.SPLASH});
        }
    }

    debugSetAllPlayerResponseTo(responseIdx) {
        return () => {
          // LOL - doing this because we can't have nested arrays in firestore
          switch (responseIdx) {
              case 0:
                  this.state.currentStateRef.update({
                      response1: Profiles.map(p => p.id)
                  });
                  break;
              case 1:
                  this.state.currentStateRef.update({
                      response2: Profiles.map(p => p.id)
                  });
                  break;
              case 2:
                  this.state.currentStateRef.update({
                      response3: Profiles.map(p => p.id)
                  });
                  break;
              case 3:
                  this.state.currentStateRef.update({
                      response4: Profiles.map(p => p.id)
                  });
                  break;
              default:
                  // unhandled!
                  break;
          }
        }
    }

    debugClearAllPlayerResponses() {
        return () => {
            this.state.currentStateRef.update({
                response1: [],
                response2: [],
                response3: [],
                response4: [],
            });
        }
    }

    componentDidMount() {
        let self = this;

        const unsubscribeQuestion = db.collection("questions").onSnapshot(snapshot => {
            let questions = [];
            snapshot.forEach(doc => {
                questions.push(doc.data());
            });
            questions.sort( ( a, b ) => { return a.id - b.id } );
            self.setState({questions : questions});
        });

        const unsubscribeState = db.collection("state").doc("current").onSnapshot(snapshot => {
            const currentState = snapshot.data();
            self.setState({
                currentQuestion: currentState.question,
                currentQuestionResults: [ currentState.response1
                                        , currentState.response2
                                        , currentState.response3
                                        , currentState.response4 ],
                questionStage: currentState.questionStage,
                currentStateRef: snapshot.ref,
                startTime: currentState.startTime,
                endTime: currentState.startTime ?
                         currentState.startTime.seconds + ANSWER_COUNTDOWN_DURATION :
                         this.state.endTime,
            });
            // if we just got here while in the answer stage, init the countdown
            if (self.state.questionStage === constants.QuestionStage.AUDIENCE_ANSWER) {
                self.beginCountdown();
            }
        });
        
        const unsubscribeStage = db.collection("state").doc("stage").onSnapshot(snapshot => {
            const currentStage = snapshot.data();
            self.setState({
                stage: currentStage.id, 
                stageRef: snapshot.ref
            });
        });
    
        self.setState({unsubscribeCallbacks: [unsubscribeQuestion, unsubscribeState, unsubscribeStage]});
    }

    componentWillUnmount() {
        this.state.unsubscribeCallbacks.forEach(cb => cb());
    }

    stageTransition(newStage) {
        return () => this.state.stageRef.update({id: newStage});
    }

    isSelected(stageId) {
        return stageId === this.state.stage ? 'selected' : 'regular';
    }

    isCountingDown() {
        return this.state.questionStage === constants.QuestionStage.AUDIENCE_ANSWER &&
               this.state.localCountdownSeconds >= 0; // don't render when our countdown is not properly initialized
    }

    isOutOfTime() {
        let now = new Date().getTime();
        let end = new Date(0);
        end.setUTCSeconds(this.state.endTime);
        return this.state.questionStage === constants.QuestionStage.AUDIENCE_ANSWER &&
               now > end;
    }
    
    render() {
        const questions = this.state.questions.map(q => {
            const isQuestionSelected = this.state.currentQuestion === q.id;
            return (
                <tr key={q.id}>
                    <td>{isQuestionSelected ? <b>{q.name}</b> : q.name}</td>
                    <td>
                        {!isQuestionSelected ? <button onClick={() => this.goToQuestion(q.id)}>Select</button> : null}
                    </td>
                </tr>
            );
        });

        return (
            <div>
                <h2>
                    Question {this.state.currentQuestion} - {constants.questionStageName(this.state.questionStage)} {this.isCountingDown() ? this.state.localCountdownSeconds : ''}
                </h2>
                {this.isOutOfTime() ? <p>OUT OF TIME</p> : null}
                <button className={`button -${this.isSelected(constants.SPLASH)}`} onClick={this.stageTransition(constants.SPLASH)}>Splash</button>
                <button className={`button -${this.isSelected(constants.CHARACTER_SELECT)}`} onClick={this.stageTransition(constants.CHARACTER_SELECT)}>Character Select</button>
                <button className={`button -${this.isSelected(constants.QUIZ)}`} onClick={this.stageTransition(constants.QUIZ)}>Quiz</button>
                <button className={`button -${this.isSelected(constants.LEADERBOARD)}`} onClick={this.stageTransition(constants.LEADERBOARD)}>Leaderboard</button>                
                <table>{questions}</table>
                <button className={`button -regular`} onClick={this.backtrackQuestionStage()}>Previous</button>
                <button className={`button -regular`} onClick={this.advanceQuestionStage()}>Next</button>
                <button className={`button -regular`} onClick={this.resetGameState()}>Reset</button>
                <h2>Danger Zone</h2>
                <button className={`button -regular`} onClick={this.debugSetAllPlayerResponseTo(0)}>Everyone Selects Response 1</button>
                <button className={`button -regular`} onClick={this.debugSetAllPlayerResponseTo(1)}>Everyone Selects Response 2</button>
                <button className={`button -regular`} onClick={this.debugSetAllPlayerResponseTo(2)}>Everyone Selects Response 3</button>
                <button className={`button -regular`} onClick={this.debugSetAllPlayerResponseTo(3)}>Everyone Selects Response 3</button>
                <button className={`button -regular`} onClick={this.debugClearAllPlayerResponses()}>Clear All Responses</button>
            </div>
        );
    }
}

export default Admin;
