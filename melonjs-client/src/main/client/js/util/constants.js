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

    /**
     * Choose a level
     */
    CHOOSE_LEVEL: state.USER + 2,

    SINGLE_PLAYER_MENU: state.USER + 3,
    /** 
     * Menu with Start MP game, Join MP game 
     */ 
    MULTIPLAYER_MENU: state.USER + 10,

    /**
     * Choose level and start the game
     */
    MULTIPLAYER_START_GAME: state.USER + 11,

    /**
     * Choose a game with open seats
     */
    MULTIPLAYER_JOIN_GAME: state.USER + 12,


    /**
     * The lobby screen where the host waits for joiners
     */
    MULTIPLAYER_LOBBY: state.USER + 13,

}