import React from 'react';
import '../styles/Quiz.css';
import {db, FieldValue} from '../firebase.js';
import * as constants from '../constants/Stages.js';
import { Profiles, SELECTED_PROFILE_LS_KEY } from '../constants/Profiles.js';

const ANSWER_COUNTDOWN_DURATION = 30; // in seconds, TODO make me tunable per question

function wordify(num) {
    const words = [ "Zero", "One", "Two", "Three", "Four", "Five", "Six"
                  , "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"
                  , "Thirteen", "Fourteen" ];
    return num >= words.length ? num : words[num];
}

class Quiz extends React.Component {

    state = {
        currentQuestionId: 1,
        currentQuestion: null,
        questionStage: 0,
        questions: [],
        people: {},

        // local countdown timer state
        endTime: 0, // epoch seconds
        localCountdownSeconds: -1,
        localCountdownIntervalID: -1,

        profile: null,
        selectedAnswerIdx: -1,
        results: [],

        currentStateRef: null,
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

    findQuestion(questionId) {
        for (let i = 0; i < this.state.questions.length; i++) {
            if (this.state.questions[i].id === questionId) {
                return this.state.questions[i];
            }
        }
        return null;
    }

    componentDidMount() {
        let self = this;

        const profile = JSON.parse(localStorage.getItem(SELECTED_PROFILE_LS_KEY) || null);
        self.setState({ profile: profile });

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
            self.setState({currentQuestionId : currentState.question,
                           currentQuestion   : self.findQuestion(currentState.question),
                           questionStage     : currentState.questionStage,
                           endTime           : endTime,
                           results           : [ currentState.response1
                                               , currentState.response2
                                               , currentState.response3
                                               , currentState.response4 ],
                           currentStateRef   : snapshot.ref,
            });

            if (self.state.questionStage === constants.QuestionStage.AUDIENCE_ANSWER) {
                this.setState({ selectedAnswerIdx: -1 });
                self.beginCountdown();
            } else {
                self.resetCountdown();
            }

            if (self.state.selectedAnswerIdx === -1) {
                for (let responseIdx = 0; responseIdx < self.state.results.length; responseIdx++) {
                    if (self.state.results[responseIdx].indexOf(self.state.profile.id) !== -1) {
                        self.setState({ selectedAnswerIdx: responseIdx });
                    }
                }
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

    selectAnswer(idx) {
        // you've already selected an answer
        if (this.state.selectedAnswerIdx !== -1) {
            return;
        }

        // you can no longer select an answer
        if (this.isOutOfTime()) {
            return;
        }

        this.setState({ selectedAnswerIdx: idx });
        // LOL - doing this because we can't have nested arrays in firestore
        switch (idx) {
            case 0:
                this.state.currentStateRef.update({
                    response1: FieldValue.arrayUnion(this.state.profile.id)
                });
                break;
            case 1:
                this.state.currentStateRef.update({
                    response2: FieldValue.arrayUnion(this.state.profile.id)
                });
                break;
            case 2:
                this.state.currentStateRef.update({
                    response3: FieldValue.arrayUnion(this.state.profile.id)
                });
                break;
            case 3:
                this.state.currentStateRef.update({
                    response4: FieldValue.arrayUnion(this.state.profile.id)
                });
                break;
            default:
                // unhandled!
                break;
        }
    }

    render() {
        const question = this.state.currentQuestion;
        const questionText = question ? question.name : "";
        const answers = question ? question.answers : [];

        switch (this.state.questionStage) {
            case constants.QuestionStage.READ_QUESTION:
                return (
                    <div>
                        <p className="question-count-intro title-text">Question {wordify(this.state.currentQuestionId)}</p>
                        <p className="question-intro question-text">{questionText}</p>
                    </div>
                );
            case constants.QuestionStage.AUDIENCE_ANSWER:
                // weird hack: injecting CSS variable for countdown time
                return (
                    <div>
                        <style>{`
                        :root {
                            --countdown: ${this.isCountingDown() ? ANSWER_COUNTDOWN_DURATION + "s" : "0s"};
                        }`}</style>
                        <div id="countdown-bar"></div>
                        {this.isCountingDown() ? <p className="countdown-text">{this.state.localCountdownSeconds}</p> : null}
                        {this.isOutOfTime() ? <p className="countdown-text">Yer outta time!</p> : null}
                        <p className="title-text">Question {wordify(this.state.currentQuestionId)}</p>
                        <p className="question-text">{questionText}</p>
                        {answers.map((a, idx) => (
                            <button key={idx} className={`button -quiz-answer -intro`} onClick={() => this.selectAnswer(idx)}>
                                {a}
                            </button>
                        ))}
                    </div>
                );
            case constants.QuestionStage.READ_RESULTS:
                return (
                    <div>
                        <p className="title-text">Results</p>
                        <p className="results-question-text">{questionText}</p>
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
