import React from 'react';
import {db} from '../firebase.js';
import * as constants from '../constants/Stages.js';

const ANSWER_COUNTDOWN_DURATION = 30; // in seconds, TODO make me tunable per question

class Quiz extends React.Component {

    state = {
        currentQuestion: 1,
        questionStage: 0,
        questions: [],
        people: {},

        // local countdown timer state
        endTime: 0, // epoch seconds
        localCountdownSeconds: -1,
        localCountdownIntervalID: -1,
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

    componentDidMount() {
        let self = this;
        db.collection("people").onSnapshot(snapshot => {
            let people = {};
            snapshot.forEach(doc => {
                people[doc.id] = doc.data();
            });
            self.setState({people : people});
        });

        db.collection("questions").onSnapshot(snapshot => {
            let questions = [];
            snapshot.forEach(doc => {
                questions.push(doc.data());
            });
            self.setState({questions : questions});
        });

        db.collection("state").doc("current").onSnapshot(snapshot => {
            const currentState = snapshot.data();
            const endTime = currentState.startTime ?
                            currentState.startTime.seconds + ANSWER_COUNTDOWN_DURATION :
                            -1;
            self.setState({currentQuestion : currentState.question,
                           questionStage   : currentState.questionStage,
                           endTime         : endTime,});

            if (self.state.questionStage === constants.QuestionStage.AUDIENCE_ANSWER) {
                console.log("beginning countdown");
                self.beginCountdown();
            } else {
                self.resetCountdown();
            }
        });
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
        const question = this.state.questions
            .filter(q => this.state.currentQuestion === q.id);

        const questionText = question.map(q => q.name);
        const answerKeys = question.map(q => q.answers).flat();
        const answers = answerKeys
            .map(p => this.state.people.hasOwnProperty(p) ?
                      this.state.people[p] : {displayName: "unknown"});

        switch (this.state.questionStage) {
            case constants.QuestionStage.READ_QUESTION:
                return (
                    <div>
                        <p>Question: {this.state.currentQuestion}/{this.state.questions.length}</p>
                        {questionText}
                    </div>
                );
            case constants.QuestionStage.AUDIENCE_ANSWER:
                return (
                    <div>
                        <p>Question: {this.state.currentQuestion}/{this.state.questions.length}</p>
                        {this.isCountingDown() ? <p>{this.state.localCountdownSeconds}</p> : null}
                        {this.isOutOfTime() ? <p>OUT OF TIME</p> : null}
                        {questionText}
                        {answers.map(a => (
                            <button className={`button -regular`}>{a.displayName}</button>
                        ))}
                    </div>
                );
            case constants.QuestionStage.READ_RESULTS:
                return (
                    <div>
                        <p>Results (TODO)</p>
                        {questionText}
                    </div>
                );
            default:
                return (
                    <div>
                      <p>Unhandled question stage:
                        {constants.questionStageName(this.state.questionStage)}
                      </p>
                    </div>
                );
        }
    }  
}

export default Quiz;
