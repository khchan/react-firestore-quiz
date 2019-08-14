export const SPLASH = 0;
export const CHARACTER_SELECT = 1;
export const QUIZ = 2;
export const LEADERBOARD = 3;

export const QuestionStage = {
  READ_QUESTION: 0,
  AUDIENCE_ANSWER: 1,
  READ_RESULTS: 2,
};

export function stageName(stage) {
    switch (stage) {
        case SPLASH: return "SPLASH";
        case CHARACTER_SELECT: return "CHARACTER_SELECT";
        case QUIZ: return "QUIZ";
        case LEADERBOARD: return "LEADERBOARD";
        default: return "N/A";
    }
}

export function questionStageName(questionStage) {
    switch (questionStage) {
        case QuestionStage.READ_QUESTION:
            return "READ_QUESTION";
        case QuestionStage.AUDIENCE_ANSWER:
            return "AUDIENCE_ANSWER";
        case QuestionStage.READ_RESULTS:
            return "READ_RESULTS";
        default:
            return "UnknownQuestionStage";
    }
}
