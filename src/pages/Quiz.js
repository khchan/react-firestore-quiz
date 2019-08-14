import React from 'react';
import {db} from '../firebase.js';
import * as constants from '../constants/Stages.js';

class Quiz extends React.Component {

    state = {
        currentQuestion: 1,
        questionStage: 0,
        questions: [],
        people: {}
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
            self.setState({currentQuestion: currentState.question});
            self.setState({questionStage: currentState.questionStage});
        });
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
                        {questionText}
                        {answers.map(a => (
                            <div>{a.displayName}</div>
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
