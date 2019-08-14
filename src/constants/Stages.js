export const SPLASH = 0;
export const CHARACTER_SELECT = 1;
export const QUIZ = 2;
export const LEADERBOARD = 3;

export function stageName(stage) {
    switch (stage) {
        case SPLASH: return "SPLASH";
        case CHARACTER_SELECT: return "CHARACTER_SELECT";
        case QUIZ: return "QUIZ";
        case LEADERBOARD: return "LEADERBOARD";
        default: return "N/A";
    }
}