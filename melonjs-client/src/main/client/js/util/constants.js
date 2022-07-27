import { state } from "melonjs";

export const my_state = {
    /**
     * Choose a game to replay menu
     */
    REPLAY_GAME_CHOOSER : state.USER + 0,

    /**
     * replay the game you've chosen
     */
    REPLAY_GAME : state.USER + 1,

}