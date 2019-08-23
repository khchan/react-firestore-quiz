import React from 'react';
import '../styles/Quiz.css';
import '../styles/Grid.css';
import {db, FieldValue} from '../firebase.js';
import * as constants from '../constants/Stages.js';
import {MakeUnique, IsAnonymousId, AnonymousProfile, Profiles, SELECTED_PROFILE_LS_KEY } from '../constants/Profiles.js';

const ANSWER_COUNTDOWN_DURATION = 30; // in seconds, TODO make me tunable per question

function wordify(num) {
    const words = [ "Zero", "One", "Two", "Three", "Four", "Five", "Six"
                  , "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"
                  , "Thirteen", "Fourteen" ];
    return num >= words.length ? num : words[num];
}

class Quiz extends React.Component {

    state = {
        unsubscribeCallbacks: [],
        currentQuestionId: 1,
        currentQuestion: null,
        questionStage: 0,
        questions: [],

        // local countdown timer state
        endTime: 0, // epoch seconds
        localCountdownSeconds: -1,
        localCountdownIntervalID: -1,

        profile: null,
        selectedAnswerIdx: -1,
        results: [],
        preloadedImages: {},

        currentStateRef: null,
    }

    preloadImages() {
        // all hardcoded images
        let urls = [
          "https://firebasestorage.googleapis.com/v0/b/wedding-shoe.appspot.com/o/images%2Fcarl-gym-question.jpg?alt=media&token=9a3c3c40-79cb-448e-993a-9cc990698415",
          "https://firebasestorage.googleapis.com/v0/b/wedding-shoe.appspot.com/o/images%2Fcarl_or_shaolin_master_4.jpg?alt=media&token=ac8d271a-398f-4305-81f8-a0343051186b",
          "https://firebasestorage.googleapis.com/v0/b/wedding-shoe.appspot.com/o/images%2Fcarl_or_shaolin_master_5.jpg?alt=media&token=26af9231-471a-402b-b27a-f69f8c8ab570",
          "https://firebasestorage.googleapis.com/v0/b/wedding-shoe.appspot.com/o/images%2Fcarl_or_shaolin_master_6.jpg?alt=media&token=75324ace-5c10-40da-8363-270dc51566e5",
        ];
        let preloadedImages = {};
        urls.forEach(url => {
            preloadedImages[url] = <img className="question-img" src={url} alt="preloaded"/>;
        });
        this.setState({ preloadedImages: preloadedImages });
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
            localCountdownSeconds: ANSWER_COUNTDOWN_DURATION,
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
        self.preloadImages();

        const profile = JSON.parse(localStorage.getItem(SELECTED_PROFILE_LS_KEY)) || MakeUnique(AnonymousProfile);
        self.setState({ profile: profile });

        const unsubscribeQuestions = db.collection("questions").onSnapshot(snapshot => {
            let questions = [];
            snapshot.forEach(doc => {
                questions.push(doc.data());
            });
            questions.sort( ( a, b ) => { return a.id - b.id } );
            self.setState({questions : questions});
        });

        const unsubscribeCurrentState = db.collection("state").doc("current").onSnapshot(snapshot => {
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

        this.setState({unsubscribeCallbacks: [unsubscribeQuestions, unsubscribeCurrentState]});
    }

    componentWillUnmount() {
        this.state.unsubscribeCallbacks.forEach(cb => cb());
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

    selectAnswer(idx, questionStage) {
        // you can no longer select an answer
        if (this.isOutOfTime() || questionStage === constants.QuestionStage.READ_RESULTS) {
            return;
        }

        this.setState({ selectedAnswerIdx: idx });
        // LOL - doing this because we can't have nested arrays in firestore
        switch (idx) {
            case 0:
                this.state.currentStateRef.update({
                    response1: FieldValue.arrayUnion(this.state.profile.id),
                    response2: FieldValue.arrayRemove(this.state.profile.id),
                    response3: FieldValue.arrayRemove(this.state.profile.id),
                    response4: FieldValue.arrayRemove(this.state.profile.id),
                });
                break;
            case 1:
                this.state.currentStateRef.update({
                    response1: FieldValue.arrayRemove(this.state.profile.id),
                    response2: FieldValue.arrayUnion(this.state.profile.id),
                    response3: FieldValue.arrayRemove(this.state.profile.id),
                    response4: FieldValue.arrayRemove(this.state.profile.id),
                });
                break;
            case 2:
                this.state.currentStateRef.update({
                    response1: FieldValue.arrayRemove(this.state.profile.id),
                    response2: FieldValue.arrayRemove(this.state.profile.id),
                    response3: FieldValue.arrayUnion(this.state.profile.id),
                    response4: FieldValue.arrayRemove(this.state.profile.id),
                });
                break;
            case 3:
                this.state.currentStateRef.update({
                    response1: FieldValue.arrayRemove(this.state.profile.id),
                    response2: FieldValue.arrayRemove(this.state.profile.id),
                    response3: FieldValue.arrayRemove(this.state.profile.id),
                    response4: FieldValue.arrayUnion(this.state.profile.id),
                });
                break;
            default:
                // unhandled!
                break;
        }
    }

    renderPlayerCard(profileKey) {
        let profile = null;
        if (IsAnonymousId(profileKey)) {
            profile = AnonymousProfile;
        } else {
            for (let i = 0; i < Profiles.length; i++) {
                if (Profiles[i].id === profileKey) {
                    profile = Profiles[i];
                }
            }
        }
        if (profile === null) {
            return null;
        }
        const profileName = `${profile.firstName}-${profile.lastName}`;
        return (
            <div key={profileName} >
                <img className="results-profile-thumbnail" alt='Avatar' src={profile.img}></img>
            </div>
        );
    }

    renderProfilesForResult(idx) {
      return (
          <div className="profile-grid-row">
              {this.state.results[idx].map(
                  (profileKey, i) => <div key={`profile-key-${i}`} className="profile-grid-item">{this.renderPlayerCard(profileKey)}</div>
              )}
          </div>
      );
    }

    renderAnswer(a, idx, questionStage, question) {
        const buttonAnimate = questionStage === constants.QuestionStage.AUDIENCE_ANSWER
                            ? '-quiz-answer -intro -seq' + idx : '-quiz-answer';
        const isAnswerSelected =
          questionStage === constants.QuestionStage.AUDIENCE_ANSWER && this.state.selectedAnswerIdx === idx
          ? '-selected' : '';
        const isAnswerCorrect =
          questionStage === constants.QuestionStage.READ_RESULTS && (idx === question.correct || question.correct === -1)
          ? '-correct' : '';
        return (
          <button className={`button ${buttonAnimate} ${isAnswerSelected} ${isAnswerCorrect}`}
                  onClick={() => this.selectAnswer(idx, questionStage)}>{a}</button>
        );
    }

    renderAnswers(answers, questionStage, question) {
        if (!answers || answers.length === 0) {
            return null;
        }
        const showResults = questionStage === constants.QuestionStage.READ_RESULTS;
        let rendered = [];
        for (let i = 0; i < answers.length; i++) {
            rendered.push(
                <div className="answer-grid-item" key={i}>
                    {this.renderAnswer(answers[i], i, questionStage, question)}
                    {showResults ? this.renderProfilesForResult(i) : null}
                </div>
            );
            // show an interstitial when there are only 2 choices,
            // but don't show it in the results section, because it looks weird when
            // veritcally centered
            if (!showResults && answers.length === 2 && i === 0) {
                rendered.push(
                    <div className="answer-grid-item or-interstitial" key="or">
                        <p>or</p>
                    </div>
                );
            }
        }
        return (
            <div className={showResults ? "answer-grid-row" : "answer-grid-row -intro"}>
                {rendered}
            </div>
        );
    }

    getQuestionImg(question) {
       if (question && question.img) {
          if (this.state.preloadedImages[question.img]) {
              return this.state.preloadedImages[question.img];
          } else {
              return <img className="question-img" src={question.img} alt="postloaded" />;
          }
       }
       return null;
    }

    render() {
        const question = this.state.currentQuestion;
        const questionText = question ? question.name : "";
        const answers = question ? question.answers : [];
        const questionImg = this.getQuestionImg(question);
        const questionImgMaskSize = question && question.maskSize ? question.maskSize : "15%";
        const questionImgMaskX = question && question.maskX ? question.maskX : "50%";
        const questionImgMaskY = question && question.maskY ? question.maskY : "50%";

        switch (this.state.questionStage) {
            case constants.QuestionStage.READ_QUESTION:
                return (
                    <div>
                        <style>{`
                        :root {
                            --maskSize: ${questionImgMaskSize};
                            --maskX: ${questionImgMaskX};
                            --maskY: ${questionImgMaskY};
                        }`}</style>
                        <p className="question-count-intro title-text">Question {wordify(this.state.currentQuestionId)}</p>
                        <p className="question-intro question-text">{questionText}</p>
                        {questionImg}
                    </div>
                );
            case constants.QuestionStage.AUDIENCE_ANSWER:
                return (
                    <div>
                        <style>{`
                        :root {
                            --countdown: ${this.isCountingDown() ? ANSWER_COUNTDOWN_DURATION + "s" : "0s"};
                            --maskSize: ${questionImgMaskSize};
                            --maskX: ${questionImgMaskX};
                            --maskY: ${questionImgMaskY};
                        }`}</style>
                        <p className="title-text">Question {wordify(this.state.currentQuestionId)}</p>
                        <p className="question-text">{questionText}</p>
                        {questionImg}
                        {this.renderAnswers(answers, this.state.questionStage, question)}
                        <div id="countdown-bar"></div>
                        {this.isCountingDown() ? <p className="countdown-text">{this.state.localCountdownSeconds}</p> : null}
                        {this.isOutOfTime() ? <p className="countdown-text">Yer outta time!</p> : null}
                    </div>
                );
            case constants.QuestionStage.READ_RESULTS:
                const questionImgReveal = question && question.img ? <img className='question-img-animate' src={question.img} alt="reveal" /> : null;
                return (
                    <div>
                        <style>{`
                        :root {
                            --maskSize: ${questionImgMaskSize};
                            --maskX: ${questionImgMaskX};
                            --maskY: ${questionImgMaskY};
                        }`}</style>
                        <p className="title-text">Results</p>
                        <p className="question-text">{questionText}</p>
                        {questionImgReveal}
                        {this.renderAnswers(answers, this.state.questionStage, question)}
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
