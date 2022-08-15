import { LevelManager } from "./level";


const GlobalGameState = {
	// global server state
	globalServerGame: null,
	globalServerVersion: null,

	// For replaying an allready played game
	gameToReplay: null,
	replayActions : null,

	// engine state
	screenControlsTexture: null,
	
	// some configs
	enemyStunnedTime: 5000, // ms
	playerInvincibleTime: 3000, // ms

	// adding score for different elements
	scoreForPills: 10,
	scoreForBombs: 50,
	scoreForMeat: 25,
	scoreForCheese: 15,
	scoreForStunningCat: 50,
	scoreForStunningGolem: 150,
	scoreForKillingSpider: 100,

	// Amount of energy to get back 
	energyForMeat: 10,
	energyForCheese: 5,

	// bombs for picking up a bomb bonus
	bombsForBombBonus: 5,

	// how much energy do you loose if
	energyLostBySpider: 25,
	energyLostByCat: 10,
	energyLostByGolem: 50,

	// energy on start of the game
	energyOnBegin: 100, 

	// player state
	energy: 100,
	score: 0,
	bombs: 0,
	invincible: false,
	isGameOver: false,

  // statistics
	placedBarriers: 0,
	usedBombs: 0,
  	bittenBySpiders : 0,
  	catchedByCats : 0,
	catchedByGolems: 0,
	killedSpiders: 0,
	stunnedCats: 0,
	stunnedGolems: 0,
	bonusCollected: 0,	

	// reset statistics and player state
	reset: function() {
		this.energy = this.energyOnBegin;		
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
		this.catchedByGolems=0;
		this.bonusCollected = 0;
	}
};

export default GlobalGameState;