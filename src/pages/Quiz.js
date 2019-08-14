import React from 'react';
import {db} from '../firebase.js';

class Quiz extends React.Component {

    state = {
        currentQuestion: 1,
        questions: []
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
            self.setState({currentQuestion: currentState.question});
        });
      }

    render() {
        const question = this.state.questions
            .filter(q => this.state.currentQuestion === q.id)
            .map(q => q.name);

        return (
            <div>
                <h1>Quiz</h1>
                <p>Question: {this.state.currentQuestion}/{this.state.questions.length}</p>
                {question}
            </div>
        );
    }  
}

export default Quiz;