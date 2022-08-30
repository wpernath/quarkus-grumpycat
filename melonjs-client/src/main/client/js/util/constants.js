import { collision, state, pool, Color } from "melonjs";

export const my_state = {
	/**
	 * Choose a game to replay menu
	 */
	REPLAY_GAME_CHOOSER: state.USER + 0,

	/**
	 * replay the game you've chosen
	 */
	REPLAY_GAME: state.USER + 1,

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

	/**
	 * The actual gaming screen
	 */
	MULTIPLAYER_PLAY: state.USER + 14,

	/**
	 * Multiplyer game over
	 */
	MULTIPLAYER_GAME_OVER: state.USER + 15,

	/** 
	 * A text screen with infos on how to play this game
	 */
	HOW_TO_PLAY: state.USER + 16,
};

export const my_collision_types = {

	/**
	 * This is a remote player in Multiplayer games
	 */
	REMOTE_PLAYER: collision.types.USER << 0,

	/**
	 * A remote bomb in multiplayer games
	 */
	REMOTE_BOMB: collision.types.USER << 1,
};

/**
 * 
 */
export const PLAYER_COLORS = [
	"#ffffff",	
	"#ffff32",
	"#32ffff",
	"#ff3232"
];

export const BARRIER_TILE = {
	light: 182,
	mid: 183,
	dark: 184,
};

// special bonus type numbers
// NOTE: those here are 1 based as Tiled counts tileIds from 1
export const BONUS_TILE = {
	bomb: 961,
	star: 962,
	cactus: 963,
	meat: 966,
	cheese: 967,
	closedChest: 970,
	openedChest: 971,
	maxEnergyAdder20: 972,
	maxEnergyAdder50: 973,
	magicBolt: 974,
	magicFirespin: 975,
	magicProtectionCircle: 976,
	magicNebula: 977,
	bomb0: 979,

	enemyEmitter: 115,
};


