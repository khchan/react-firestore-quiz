import React from 'react';
import '../styles/Leaderboard.css';
import {db, FieldValue} from '../firebase.js';
import {Profiles} from '../constants/Profiles.js';

class Leaderboard extends React.Component {
    
    state = {
        leaderboard: [],
    }

    componentWillMount() {
        let self = this;
        db.collection("questions").get()
            .then(snapshot => {
                let questions = [];
                snapshot.forEach(doc => {
                    questions.push(doc.data());
                });
                questions.sort( ( a, b ) => { return a.id - b.id } );
                self.setState({questions : questions});

                return db.collection("state").get().then(stateSnapshot => {
                    let answers = {};
                    stateSnapshot.forEach(doc => {
                        const response = doc.data();
                        answers[response.id] = response;
                    });

                    return questions.map(question => {
                        question.results = answers[question.id];
                        return question;
                    });
                });
            })
            .then(results => {
                let leaderboard = {};
                results.map(result => {
                    const correctResponses = result.results[`response${result.correct + 1}`];
                    if (correctResponses) {
                        correctResponses.forEach(respondee => {
                            leaderboard[respondee] = (leaderboard[respondee] || 0) + 1;
                        });
                    }
                });

                let keys = Object.keys(leaderboard);
                keys.sort((a, b) => { return leaderboard[b] - leaderboard[a] });

                const highScores = keys.map(key => {
                    return { 
                        score: leaderboard[key],
                        profile: Profiles.find(profile => profile.id === key)
                    };
                });

                const playersWithScores = highScores.map(player => player.profile.id);
                const playersWithoutScores = Profiles.filter(profile => !playersWithScores.includes(profile.id)).map(profile => {
                    return {
                        score: 0,
                        profile: profile
                    };
                });
                
                self.setState({leaderboard: highScores.concat(playersWithoutScores)});
            });
    }
    
    render() {

        const leaderboard = this.state.leaderboard.map((entry, idx) => {
            return (
                <tr key={entry.profile.id}>
                    <td>
                        <img src={entry.profile.img}/>
                    </td>
                    <td align='left'>
                        <h3 className='leaderboard-name'>{`#${idx + 1} ${entry.profile.firstName} ${entry.profile.lastName}`}</h3>
                    </td>
                </tr>
            );
        });

        return (
            <div id='leaderboard'>
                <h2 className='grid-item title-text'>Thank You For Participating!</h2>
                <table>
                    <tbody>
                        {leaderboard}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Leaderboard;