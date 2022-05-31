// global key states
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;
let dropStonePressed = false;

// global game states
let gamePaused = true;
let gameOver = false;
let levelWon = false;
let catSpeed = CAT_SPEED;
let lastTimestamp = 0;
let numPoints = 0;
let currentLevel = 1;
let numLevels = 3;
let score = 0;
let maxScore = 0;
let numBombs = 5;
let bombsThrown = 0;
let ctx;
let canvas;
var gameWorld;
let enemies;
let camera;
let dirX = 0, 
	dirY = 0;



// load images
let loader = new PxLoader(),
	floorImg = loader.addImage("images/tiles/water.png"),
	wallImg = loader.addImage("images/tiles/tile_2.png"),
	catLeft = loader.addImage("images/cat_left.png"),
	catRight = loader.addImage("images/cat_right.png"),
	tenPoints = loader.addImage("images/10-points.png"),
	fivPoints = loader.addImage("images/5-points.jpg"),
	pauseImg = loader.addImage("images/pause.png"),
	gameOverImg = loader.addImage("images/gameOver.png"),
	mouseImg = loader.addImage("images/sensa_jaa.png"),
	gameOverDog = loader.addImage("images/sensa_nee.png"),
	levelWonDog = loader.addImage("images/sensa_jaa.png"),
	tilesetImage = loader.addImage("/images/tilesets/desert-water.png"),
	bombTiles = loader.addImage("/images/tilesets/BombExploding.png"),
	terrainTiles = loader.addImage("/images/tilesets/terrain.png");	

// This is the entry point of the game.   
function setupGame() {
	// add a completion listener to the image loader which inits the game
	loader.addCompletionListener(initGame);
	loader.start();
}

// we need to get key downs / ups
function keyDownHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = true;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = true;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = true;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = true;
	if (event.code == "Space") spacePressed = true;
	if( event.code == "KeyQ") dropStonePressed = true;
}

function keyUpHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = false;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = false;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = false;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = false;
	if (event.code == "KeyP") gamePaused = !gamePaused;
	if (event.code == "Space") spacePressed = false;
	if (event.code == "KeyQ") dropStonePressed = false;
}

// init game
function initGame() {
	canvas = document.getElementById("maze");
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		document.addEventListener("keydown", keyDownHandler, false);
		document.addEventListener("keyup", keyUpHandler, false);

		currentLevel = 2;
		numBombs = 5;
		maxScore = 0;
		initLevel();
	}
}

// function to load a level from server and
// initialize it to use it locally
function initLevel() {

	// download a new level
	console.log("initalizing level " + (currentLevel+1) + " / " + numLevels);
	var name = "Level" + (currentLevel+1);
	$.ajax({
		url: "/maps/" + name + ".tmj",
		contentType: "application/json",
		dataType: "json",
		context: this,

		success: function (result) {
			console.log("current level loaded: " + result);
			renderer = new TiledMapRenderer();
			renderer.parse(result);

			renderer.tilesetImage = terrainTiles;
			renderer.bombImageSet = bombTiles;
			renderer.player.image = mouseImg;

			catSpeed = CAT_SPEED;

			enemies = renderer.enemies;
			for(var i = 0; i < enemies.length; i++ ) {
				enemies[i].image = catLeft;
				enemies[i].catLeft = catLeft;
				enemies[i].catRight = catRight;
			}

			camera = renderer.camera;
			console.log(camera);
			camera.centerAround(renderer.player.x, renderer.player.y);


			numPoints = 0;
			maxScore += renderer.countMaxScore();

			bombsThrown = 0;
			gameOver = false;
			gamePaused = true;
			levelWon = false;
			dirX = 0;
			dirY = 0;
			window.requestAnimationFrame(gameLoop);
		},
	});	
}

// main game loop: move player, move enemy, update maze
function gameLoop(timestamp) {
	var elapsed = timestamp - lastTimestamp;

	if (elapsed > 100) {
		lastTimestamp = timestamp;

		if (!gamePaused && !gameOver) {
			if (--catSpeed == 0) {
				updateEnemy();
				catSpeed = CAT_SPEED;
			}
			updatePlayer();
			drawMaze();
			drawStatus();
		}

		if (gamePaused && !gameOver) {
			ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT );
			ctx.drawImage(pauseImg, (MAZE_WIDTH - pauseImg.width) / 2, (MAZE_HEIGHT - pauseImg.height) / 2);
		}

		if (gameOver) {
			drawGameOver();
		}

		if (levelWon) {
			drawLevelWon();
		}
	}
	window.requestAnimationFrame(gameLoop);
}

function drawLevelWon() {
	ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT+20);
	ctx.drawImage(levelWonDog, (MAZE_WIDTH - levelWonDog.width) / 2, (MAZE_HEIGHT - levelWonDog.height) / 2);

	ctx.font = "22px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	ctx.fillText("Press <space> to play next level", MAZE_WIDTH - 620, MAZE_HEIGHT);

	if (spacePressed) {
		ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT+20);
		spacePressed = false;
		gameOver = false;

		currentLevel++;
		if( currentLevel < numLevels ) {
			initLevel();
		}
		else {
			console.log("All levels played!");
			currentLevel = 0;
			initLevel();
		}
	}
}

function drawGameOver() {
	score = 0;
	maxScore = 0;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.drawImage(gameOverDog, (MAZE_WIDTH - gameOverDog.width) / 2, (MAZE_HEIGHT - gameOverDog.height) / 2);
	ctx.drawImage(gameOverImg, (MAZE_WIDTH - 620) / 2, 10, 620, 400);

	ctx.font = "22px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	ctx.fillText("Press <space> to start again", MAZE_WIDTH - 620, MAZE_HEIGHT + 8);

	if (spacePressed) {
		spacePressed = false;
		gameOver = false;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		currentLevel = 0;
		initLevel();
	}
}

// draws the currently loaded maze
function drawMaze() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	renderer.draw(ctx);	
}

function drawStatus() {
	ctx.clearRect(0, MAZE_HEIGHT, MAZE_WIDTH, 32);

	ctx.font = "20px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.fillText("SCORE: " + score + " of " + maxScore , 10, MAZE_HEIGHT + 8);
	ctx.fillText("LEVEL: " + (currentLevel + 1) + " of " + numLevels, 300, MAZE_HEIGHT + 8);
	ctx.fillText("BOMBS: " + bombsThrown + " of " + numBombs, 600, MAZE_HEIGHT + 8)
}

function updatePlayer() {
	var oldX = renderer.player.x,
		oldY = renderer.player.y;

		dirX = 0;
		dirY = 0;
	if (upPressed) {
		renderer.player.y -= 1;
		dirY = -1;
		if( renderer.player.y < 0) renderer.player.y = 0;
	}

	if (downPressed) {
		renderer.player.y += 1;
		dirY = +1;
		if (renderer.player.y > renderer.mapHeight) renderer.player.y = renderer.mapHeight;
	}

	if (leftPressed) {
		renderer.player.x -= 1;
		dirX = -1;
		if (renderer.player.x <= 0) renderer.player.x = 0;
	}

	if (rightPressed) {
		renderer.player.x += 1;
		dirX = +1;
		if (renderer.player.x >= renderer.mapWidth) renderer.player.x = renderer.player.x;
	}

	// get tile and check if it's walkable
	if( !renderer.isWalkable(renderer.player.x, renderer.player.y) ){
		// wall
		renderer.player.x = oldX;
		renderer.player.y = oldY;
	}

	camera.centerAround(renderer.player.x, renderer.player.y);

	var bonus = renderer.checkForBonus(renderer.player.x, renderer.player.y);
	if (bonus != 0) {
		score += 10;
		if( bonus == BONUS_BOMB ) {
			numBombs += 5;
		}
		
		if( score >= maxScore ) {
			levelWon = true;
		}
	}

	// check to see if player wants to place a bomb
	if( spacePressed ) {
		if( bombsThrown < numBombs ) {
			renderer.placeBomb(
				new PlacedBomb(
					renderer.player.x, 
					renderer.player.y,
					bombTiles,
					camera
				)
			);
			bombsThrown++;
		}
	}

	if( dropStonePressed ) {
		renderer.placeBarrier(renderer.player.x + dirX, renderer.player.y + dirY);
	}

	// check to see if ANY cat reached mouse
	for( var e = 0; e < enemies.length; e++) {
		if (renderer.player.x == enemies[e].catX && renderer.player.y == enemies[e].catY) {
			gameOver = true;
			break;
		}
	}
}

// calculate the next step, the cat does
function updateEnemy() {
	for( var e = 0; e < enemies.length; e++ ) {
		var enemy = enemies[e];
		enemy.calculateNextMove(renderer);
	}
}
