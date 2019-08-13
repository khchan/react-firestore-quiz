import React from 'react';
import {db} from './firebase.js';

class Quiz extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentQuestion: 1,
            currentQuestionRef: null,
            questions: []
        };
    }

    navigateQuestion(next) {
        return () => {
            const currentId = this.state.currentQuestion;
            if (next ? currentId < this.state.questions.length : currentId > 1) {          
                this.state.currentQuestionRef.update({question: currentId + (next ? 1 : -1)})
            }
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
      }

    render() {
        const questions = this.state.questions
            .filter(q => this.state.currentQuestion === q.id)
            .map(q => q.name);

        return (
            <div>
                <h1>Quiz</h1>
                <p>Question: {this.state.currentQuestion}/{this.state.questions.length}</p>
                <ul>{questions}</ul>
                <button onClick={this.navigateQuestion(false)}>Previous</button>
                <button onClick={this.navigateQuestion(true)}>Next</button>
            </div>
        );
    }  
}

export default Quiz;