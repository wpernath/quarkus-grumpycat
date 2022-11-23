import { LevelManager } from "./level";


const GlobalGameState = {
	isMultiplayerMatch: false,

	// global server state
	globalServerGame: null,
	globalServerVersion: null,

	// For replaying an allready played game
	gameToReplay: null,
	replayActions: null,

	// engine state
	screenControlsTexture: null,

	// some configs
	enemyStunnedTime: 5000, // ms
	playerInvincibleTime: 3000, // ms
	magicDurationTime: 15000,
	
	// adding score for different elements
	scoreForPills: 10,
	scoreForBombs: 50,
	scoreForMeat: 25,
	scoreForCheese: 15,
	scoreForStunningCat: 50,
	scoreForStunningGolem: 150,
	scoreForKillingSpider: 100,
	scoreForBombingRemotePlayers: 150,
	scoreForStars: 50,
	scoreForChest: 250,
	scoreForPotion: 50,

	// Amount of energy to get back
	energyForMeat: 25,
	energyForCheese: 20,

	// bombs for picking up a bomb bonus
	bombsForBombBonus: 5,
	superPowersForStarBonus: 5,
	magicForPotion: 3,

	// how much energy do you loose if
	energyLostBySpider: 25,
	energyLostByCat: 10,
	energyLostByGolem: 50,
	energyLostByRemoteBomb: 50,

	// add max energy per star
	maxEnergyForStar: 15,

	// energy on start of the game
	energyOnBegin: 100,

	// player state
	energy: 100,
	maxEnergy: 100, // default
	score: 0,
	bombs: 0,
	invincible: false,
	isGameOver: false,
	isSlowed: false,
	isHasted: false,

	magicBolts: 0,
	magicNebulas: 0,
	magicProtections: 0,
	magicFirespins: 0,

	// statistics
	placedBarriers: 0,
	usedBombs: 0,
	bittenBySpiders: 0,
	catchedByCats: 0,
	catchedByGolems: 0,
	killedSpiders: 0,
	stunnedCats: 0,
	stunnedGolems: 0,
	bonusCollected: 0,
	hitByRemotePlayerBomb: 0,
	hitByRemotePlayerMagic: 0,
	collectedChests:0,

	// reset statistics and player state
	reset: function () {
		this.energy = this.energyOnBegin;
		this.maxEnergy = this.energyOnBegin;
		LevelManager.getInstance().reset();
		this.score = 0;
		this.bombs = 0;
		this.invincible = false;
		this.isGameOver = false;
		this.placedBarriers = 0;
		this.usedBombs = 0;
		this.bittenBySpiders = 0;
		this.catchedByCats = 0;
		this.killedSpiders = 0;
		this.stunnedCats = 0;
		this.stunnedGolems = 0;
		this.catchedByGolems = 0;
		this.bonusCollected = 0;
		this.hitByRemotePlayerBomb = 0;
		this.hitByRemotePlayerMagic = 0;
		this.isMultiplayerMatch = false;
		this.collectedChests =0;
		this.isSlowed = false;
		this.isHasted = false;
		
		this.magicBolts = 0;
		this.magicNebulas = 0;
		this.magicProtections=0;
		this.magicFirespins=0;
	},
};

export default GlobalGameState;