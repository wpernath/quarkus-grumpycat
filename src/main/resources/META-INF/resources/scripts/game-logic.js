// global key states
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;
let dropStonePressed = false;
let escapePressed = false;

// global game states
let onTitleScreen = true;
let titleScreenSelectedEntry = 0;
let automatedPlayMode = false;
let serverMovements = [];
let serverMovementIndex = 0;
let lastServerMovement = null;

let gamePaused = true;
let gameOver = false;
let levelWon = false;

let deviceHasTouchScreen = false;

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
let enemies;
let camera;

let serverGame;
let serverVersion;
let gameEngine;

// load images
let loader = new PxLoader(),
	catLeft = loader.addImage("images/cat_left.png"),
	catRight = loader.addImage("images/cat_right.png"),
	catLeftStatue = loader.addImage("images/grumpy_cat_right.png"),
	catRightStatue = loader.addImage("images/grumpy_cat_left.png");
	pauseImg = loader.addImage("images/pause.png"),
	gameOverImg = loader.addImage("images/gameOver.png"),
	mouseImg = loader.addImage("images/sensa_jaa.png"),
	gameOverDog = loader.addImage("images/sensa_nee.png"),
	levelWonDog = loader.addImage("images/sensa_jaa.png"),
	bombTiles = loader.addImage("/images/tilesets/BombExploding.png"),

	compassRoseImg = loader.addImage("/images/compass_rose.png"),
	touchImg = loader.addImage("/images/touch.png"),
	touchSegmentImg = loader.addImage("/images/touch_segment.png"),

	terrainTiles = loader.addImage("/images/tilesets/terrain.png");	

// This is the entry point of the game.   
function setupGame() {
	// add a completion listener to the image loader which inits the game
	console.log("setupGame() called");
	deviceHasTouchScreen = checkForTouchScreen();
	console.log("  Device has Touch Screen: " + deviceHasTouchScreen);

	loader.addCompletionListener(initGame);
	loader.start();
}

function checkForTouchScreen() {
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
	hasTouchScreen = false;
	if ("maxTouchPoints" in navigator) {
		hasTouchScreen = navigator.maxTouchPoints > 0;
	} else if ("msMaxTouchPoints" in navigator) {
		hasTouchScreen = navigator.msMaxTouchPoints > 0;
	} else {
		var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
		if (mQ && mQ.media === "(pointer:coarse)") {
			hasTouchScreen = !!mQ.matches;
		} else if ("orientation" in window) {
			hasTouchScreen = true; // deprecated, but good fallback
		} else {
			// Only as a last resort, fall back to user agent sniffing
			var UA = navigator.userAgent;
			hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
		}
	}
	deviceHasTouchScreen = hasTouchScreen;
	return hasTouchScreen;
}

// we need to get key downs / ups
function keyDownHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = true;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = true;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = true;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = true;
	if (event.code == "Space" || event.code == "Enter") spacePressed = true;
	if( event.code == "ShiftLeft" || event.code == "ShiftRight") dropStonePressed = true;
	if( event.code == "Escape") escapePressed = true;
	//console.log(event.code);
}

function keyUpHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = false;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = false;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = false;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = false;
	if (event.code == "KeyP") gamePaused = !gamePaused;
	if (event.code == "Space" || event.code == "Enter") spacePressed = false;
	if (event.code == "ShiftLeft" || event.code == "ShiftRight") dropStonePressed = false;
	if (event.code == "Escape") escapePressed = false;
}

const pointerStart = {x: 0, y:0, identifier: 0, touched: false};
const virtGamePad  = {x: 0, y:0, identifier: 0, touched: false};
const virtButtons  = {x: 0, y:0, identifier: 0, touched: false};
let displayTouched = false;

function handleTouchStart(event) {
	event.preventDefault();
	for( let i = 0; i < event.changedTouches.length; i++ ) {
		let evt = event.changedTouches[i];
		pointerStart.x = Math.round(evt.clientX - canvas.offsetLeft);
		pointerStart.y = Math.round(evt.clientY - canvas.offsetTop);
		pointerStart.identifier = evt.identifier;	

		if( pointerStart.x < (canvas.width / 2)) { // virtGamePad clicked
			virtGamePad.x = pointerStart.x;
			virtGamePad.y = pointerStart.y;
			virtGamePad.identifier = evt.identifier;
			virtGamePad.touched = true;
			displayTouched = true;
		}
		else if( pointerStart.x > (canvas.width / 2) ) {
			virtButtons.x = pointerStart.x;
			virtButtons.y = pointerStart.y;
			virtButtons.identifier = pointerStart.identifier;
			virtButtons.touched = true;
			displayTouched = true;
		}
	}
}
function handleTouchEnd(event) {
	event.preventDefault();	

	for (let i = 0; i < event.changedTouches.length; i++) {
		let evt = event.changedTouches[i];
		pointerStart.x = Math.round(evt.clientX - canvas.offsetLeft);
		pointerStart.y = Math.round(evt.clientY - canvas.offsetTop);
		pointerStart.identifier = evt.identifier;
		
		if (evt.identifier == virtGamePad.identifier) {
			// virtGamePad clicked
			virtGamePad.x = pointerStart.x;
			virtGamePad.y = pointerStart.y;			
			virtGamePad.touched = false;
			upPressed = downPressed = leftPressed = rightPressed = false;
		} 
		else if (evt.identifier == virtButtons.identifier) {
			virtButtons.x = pointerStart.x;
			virtButtons.y = pointerStart.y;			
			virtButtons.touched = false;
		}
	}

	displayTouched = false;
}
function handleTouchMove(event) {
	event.preventDefault();

	for (let i = 0; i < event.changedTouches.length; i++) {
		let evt = event.changedTouches[i];

		if( evt.identifier == virtGamePad.identifier && virtGamePad.touched ) {
			let dx = Math.round(virtGamePad.x - (evt.clientX - canvas.offsetLeft));
			let dy = Math.round(virtGamePad.y - (evt.clientY - canvas.offsetTop));

			upPressed = downPressed = leftPressed = rightPressed = false;

			if( Math.abs(dx) > 20 ) {		
				if( dx > 0 ) {
					leftPressed = true;
				}
				else if( dx < 0 ) {
					rightPressed = true;			
				}
			}

			if( Math.abs(dy) > 20) {		
				if (dy > 0) {
					upPressed = true;			
				}
				else if (dy < 0) {
					downPressed = true;			
				}
			}
			break;
		}
	}
}

// init game
function initGame() {
	console.log("initGame()");
	setupCanvas();

	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	canvas.addEventListener("touchstart", handleTouchStart);
	canvas.addEventListener("touchend", handleTouchEnd);
	canvas.addEventListener("touchmove", handleTouchMove);
	canvas.addEventListener("touchcancel", handleTouchEnd);
	window.addEventListener("resize", setupCanvas);

	// change here if you want to directly play a new level
	currentLevel = 2;
	numBombs = 1;
	maxScore = 0;

	fetch("/maps/")
		.then(function(response) {
			return response.json();
		})
		.then(function(result) {
			numLevels = result;
			return fetch("/game/version");			
		})
		.then(function(res) {
			return res.text();
		})
		.then(function(ver) {
			serverVersion = ver;
			initLevel();
		});
}


function setupCanvas() {
	console.log("setupCanvas()");
	let myDiv = document.getElementById("canvas");
	if( canvas === undefined ) {
		canvas = document.createElement("canvas");
		canvas.style.zIndex = 1;  
		myDiv.appendChild(canvas);
	}
	canvas.width = Math.floor(myDiv.clientWidth / 32)*32;
	canvas.height= Math.floor(myDiv.clientHeight / 32) * 32;

	gameEngine = new GameEngine(canvas);

	ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;
	//ctx.imageSmoothingQuality = "high";

	MAZE_HEIGHT = canvas.height - 32;
	MAZE_WIDTH = canvas.width;
	//canvas.width = canvas.clientWidth;
	//canvas.height = canvas.clientHeight;
	console.log("setupCanvas(canvas: " + MAZE_WIDTH + "/" + MAZE_HEIGHT + ")");
	alert(
		"Dimensions\n"+
		"  window: " + window.innerWidth + "x" + window.innerHeight + "\n"+
		"  canvas: " + canvas.width + "x" + canvas.height + "\n"
	);
}

async function createGameOnServer(level) {
	let resp = await fetch("/faker");
	let name = await resp.text();

	let req = {
		name: name,
		level: level,
		player: {
			name: name
		}
	};

	resp = await fetch("/game", {
		method: 'POST',
		headers: {
			'Content-type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(req)
	});

	serverGame = await resp.json();
	console.log("  New game '" + serverGame.name + "' for player '" + serverGame.player.id + "' initialized. ID =  " + serverGame.id);

} 

// function to load a level from server and
function loadAndInitializeLevel(currentLevel) {
	let name = "Level " + (currentLevel + 1);
	fetch("/maps/" + currentLevel)
		.then(function (response) {
			if (!response.ok) {
				throw new Error("Could not load map file /maps/" + name + ".tmj");
			}
			return response.json();
		})
		.then(function (result) {
			console.log("current level loaded: " + name);
			renderer = new TiledMapRenderer();
			renderer.parse(result);

			renderer.player.image = mouseImg;

			catSpeed = CAT_SPEED;

			enemies = renderer.enemies;
			for (let i = 0; i < enemies.length; i++) {
				enemies[i].image = catLeft;
				enemies[i].catLeft = catLeft;
				enemies[i].catRight = catRight;
			}

			camera = renderer.camera;
			console.log(camera);
			camera.centerAround(renderer.player.x, renderer.player.y);

			numPoints = 0;
			maxScore += renderer.countMaxScore();

			window.requestAnimationFrame(gameLoop);
		})
		.catch(function (error) {
			console.log("Error loading game map: " + error);
		});
	
}

// initialize it to use it locally
function initLevel() {
	// download a new level
	console.log("initalizing level " + (currentLevel + 1) + " / " + numLevels);

	bombsThrown = 0;
	gameOver = false;
	gamePaused = true;
	levelWon = false;
	automatedPlayMode = false;

	// call server to generate a Game and a Player
	createGameOnServer(currentLevel).then(function () {
		loadAndInitializeLevel(currentLevel);		
	});
}

// main game loop: move player, move enemy, update maze
function gameLoop(timestamp) {
	let elapsed = Math.round(timestamp - lastTimestamp);

	if( escapePressed ) {
		onTitleScreen = true;
		score = 0;
		maxScore = 0;
		currentLevel =0;
		bombsThrown = 0;
		automatedPlayMode = false;
		levelWon = false;
		gameOver = false;
	}

	if( !automatedPlayMode ) {
		if (elapsed > 80) {
			lastTimestamp = timestamp;

			if (!gamePaused && !gameOver && !onTitleScreen) {
				if (--catSpeed == 0) {
					updateEnemy();
					catSpeed = CAT_SPEED;
				}
				updatePlayer();
				updateMap();
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

			if( onTitleScreen ) {
				drawTitleScreen();
			}
			drawTouchControls(timestamp);
		}
	}
	else { // automated play mode
		replayAction(timestamp);		
	}
	
	window.requestAnimationFrame(gameLoop);
}

function drawTouchControls(timestamp) {

	if( deviceHasTouchScreen ) {
		ctx.drawImage(compassRoseImg, virtGamePad.x - compassRoseImg.width / 2, virtGamePad.y - compassRoseImg.height / 2);
		// draw the compass_rose if left side was touched
		if( virtGamePad.touched ) {					
			let img = touchImg;
			let x = virtGamePad.x - (img.width / 2);
			let y = virtGamePad.y - (img.height / 2);

			if( leftPressed)  x -= img.width / 2;
			if( rightPressed) x += img.width / 2;
			if( upPressed )   y -= img.height /2;
			if( downPressed)  y += img.height / 2;

			ctx.drawImage(img, x, y);
		}

		// right side
		ctx.drawImage(touchImg, canvas.width - touchImg.width - 130, canvas.height - touchImg.height - 40);

		if( !automatedPlayMode && !gameOver && !levelWon && !gamePaused ) {
			ctx.drawImage(touchImg, canvas.width - touchImg.width - 30, canvas.height - touchImg.height - 100);
			ctx.drawImage(
				bombTiles, 
				0,
				32,
				32,
				32,
				canvas.width - touchImg.width - 120, canvas.height - touchImg.height - 30, 64, 64
			);
		}

	}

}

let lastMovementTime = 0;
function replayAction(timestamp) {
	let elapsed = Math.round(timestamp - lastTimestamp);
	let movementElapsed = Math.round(timestamp - lastMovementTime);

	if (spacePressed || escapePressed) {
		console.log("closing replay.");
		onTitleScreen = true;
		automatedPlayMode = false;
		currentLevel = 0;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		return;
	}

	if (serverMovementIndex >= serverMovements.length) {
		console.log("closing replay.");
		onTitleScreen = true;
		automatedPlayMode = false;
		currentLevel = 0;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

	}
	else {
		// update movement
		const movement = serverMovements[serverMovementIndex];
		let shouldElapsed = Date.parse(movement.time) - ((lastServerMovement != null) ? Date.parse(lastServerMovement.time) : 0);

		if (lastServerMovement == null || movementElapsed >= shouldElapsed) {
			//console.log("Elapsed time: " + elapsed + " / " + shouldElapsed);
			lastServerMovement = movement;
			lastMovementTime = timestamp;
			serverMovementIndex++;

			renderer.player.x = movement.x;
			renderer.player.y = movement.y;

			if (movement.gutterThrown) {
				console.log("Barrier placed at (" + (movement.x + movement.dx) + "/" + (movement.y + movement.dy));
				renderer.placeBarrier(
					renderer.player.x + movement.dx,
					renderer.player.y + movement.dy
				);
			}
			else if (movement.bombPlaced) {
				console.log("Bomb placed at (" + renderer.player.x + "/" + renderer.player.y);
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

			camera.centerAround(renderer.player.x, renderer.player.y);

			let bonus = renderer.checkForBonus(renderer.player.x, renderer.player.y);
			if (bonus != 0) {
				score += 10;
				if (bonus == BONUS_BOMB) {
					numBombs += 5;
				}
			}
		}

		// update enemy the same as in orginal gameplay
		if (elapsed > 80) {
			lastTimestamp = timestamp;
			if (--catSpeed <= 0) {
				updateEnemy();
				catSpeed = CAT_SPEED;
			}

			updateMap();
			drawStatus();
		}
	}
}

function drawCenteredText(text, y) {
	gameEngine.drawCenteredText(text, y);
}

let titleScreenDrawn =0;
let currentSelectedMenueEntryColor = "#1259A5";
function drawTitleScreen() {
	let menueEntries = [
		{
			title: "New Game",
			action: initGame,
		},
		{
			title: "Replay Last Game",
			action: playLastRun,
		},
		{
			title: "Highscores",
			action: showHighscores,
		},
	];

	if (upPressed) {
		titleScreenSelectedEntry -= 1;
		if (titleScreenSelectedEntry < 0) titleScreenSelectedEntry = menueEntries.length - 1;
		currentSelectedMenueEntryColor = "#1259A5";
		titleScreenDrawn = 0;
	}
	if (downPressed) {
		titleScreenSelectedEntry += 1;
		if (titleScreenSelectedEntry >= menueEntries.length) titleScreenSelectedEntry = 0;
		currentSelectedMenueEntryColor = "#1259A5";
		titleScreenDrawn = 0;
	}

	gameEngine.clearScreen();

	let y = 220;
	let h = 100;
	if( gameEngine.getDeviceType() === DEVICE_TYPE.SMALL ) {
		y = 120;
		h = 50;
	}

	ctx.save();
	ctx.font = gameEngine.getHeadlineFont().size + "px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.shadowBlur = 15;
	ctx.shadowColor = "#ff0000";
	ctx.fillStyle = "#aaf000";


	drawCenteredText("Quarkus Grumpy Cat", 20);
	ctx.font = gameEngine.getSmallFont().size + "px Arial";
	ctx.shadowBlur = 0;
	ctx.fillStyle = "white";
	drawCenteredText("Server version: " + serverVersion, 24 + gameEngine.getHeadlineFont().size );


	ctx.font = gameEngine.getMenuFont().size + "px Arial";
	ctx.shadowBlur = 10;
	ctx.shadowColor = "red";
	ctx.fillStyle = "white";

	titleScreenDrawn += 1;
	if (titleScreenDrawn > 8) {
		currentSelectedMenueEntryColor = currentSelectedMenueEntryColor === "#1259A5" ? "white" : "#1259A5";
		titleScreenDrawn = 0;
	}

	for(let i = 0; i < menueEntries.length; i++ ) {
		if( titleScreenSelectedEntry === i ) {
			ctx.fillStyle = currentSelectedMenueEntryColor;
		}
		else {
			ctx.fillStyle = "white";
		}
		let x = drawCenteredText(menueEntries[i].title, y);
		y+=h;
	}

	ctx.restore();

	ctx.drawImage(catLeftStatue, 12, canvas.height - 280, 160, 250);
	ctx.drawImage(catRightStatue, canvas.width - 180, canvas.height - 280, 160, 250);
	if( spacePressed ) {
		spacePressed = false;
		gameOver = false;
		onTitleScreen = false;
		currentLevel = 0;
		gameEngine.clearScreen();

		menueEntries[titleScreenSelectedEntry].action();
	}
}

function showHighscores() {
	console.log("Showing highscores");
}


async function loadStoredGame() {
	let res = await fetch("/game");
	const games = await res.json();
	let movements = [];
	for( let i = 0; i < games.length; i++ ) {
		console.log("trying to use game to replay " + games[i].name);
		res = await fetch("/movement/" + games[i].id + "/" + games[i].player.id);
		movements = await res.json();

		if (movements.length < 200) {
			console.log("  cant use this game");
		}
		else {
			serverGame = games[i];
			break;
		}
	}
	return movements;
}

function playLastRun() {
	console.log("playing last run");

	loadStoredGame().then(function(movements) {
		serverMovements = movements;
		console.log("  Loaded " + movements.length + " movements from server");
		serverMovementIndex = 0;
		lastServerMovement = null;
		automatedPlayMode = true;
		loadAndInitializeLevel(serverGame.level);
	})
}

function drawLevelWon() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(levelWonDog, (canvas.width - levelWonDog.width) / 2, (canvas.height - levelWonDog.height) / 2);

	ctx.font = "22px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	drawCenteredText("Press <space> to play next level", MAZE_HEIGHT);

	if (spacePressed) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
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

	ctx.drawImage(gameOverDog, (canvas.width - gameOverDog.width) / 2, (canvas.height - gameOverDog.height) / 2);
	ctx.drawImage(gameOverImg, (canvas.width - 620) / 2, 10, 620, 400);

	ctx.font = "22px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	drawCenteredText("Press <space> to start again", MAZE_HEIGHT + 8);

	if (spacePressed) {
		spacePressed = false;
		gameOver = false;
		onTitleScreen = true;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		currentLevel = 0;
		//initLevel();
	}
}

// draws the currently loaded map
function updateMap() {
	let time = new Date().getMilliseconds();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	renderer.draw(ctx);	
	let elapsed = new Date().getMilliseconds() - time;
	//console.log("time to draw: " + elapsed);
}

function drawStatus() {
	ctx.clearRect(0, MAZE_HEIGHT, MAZE_WIDTH, 32);
	ctx.save();
	ctx.font = "20px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.shadowBlur = 15;
	ctx.shadowColor = "blue";
	ctx.fillText("SCORE: " + score + " of " + maxScore , 10, MAZE_HEIGHT + 8);
	ctx.fillText("LEVEL: " + (currentLevel + 1) + " of " + numLevels, 300, MAZE_HEIGHT + 8);
	ctx.fillText("BOMBS: " + bombsThrown + " of " + numBombs, 600, MAZE_HEIGHT + 8);

	ctx.font = "32px Arial";
	ctx.shadowColor = "black";		
	if( automatedPlayMode ) {		
		drawCenteredText("Replay of: " + serverGame.name, 4);
	}
	else {
		drawCenteredText("Player: " + serverGame.name, 4);
	}
	ctx.restore();
}

function updatePlayer() {
	let oldX = renderer.player.x,
		oldY = renderer.player.y;

	const action = {
		playerId: serverGame.player.id,
		gameId: serverGame.id,
		dx: 0,
		dy: 0,
		x: 0,
		y: 0,
		bombPlaced: false,
		gutterThrown: false,
		gameOver: false,
		gameWon: false,
		score: score,
		time: Date.now()
	};

	if( !dropStonePressed ) {
		if (upPressed) {
			renderer.player.y -= 1;
			action.dy = -1;
			if( renderer.player.y < 0) {
				renderer.player.y = 0;
				action.dy = 0;
			}
		}

		if (downPressed) {
			renderer.player.y += 1;
			action.dy = +1;
			if (renderer.player.y > renderer.mapHeight) {
				renderer.player.y = renderer.mapHeight;
				action.dy = 0;
			}
		}

		if (leftPressed) {
			renderer.player.x -= 1;
			action.dx = -1;
			if (renderer.player.x <= 0) {
				renderer.player.x = 0;
				action.dx = 0;
			}
		}

		if (rightPressed) {
			renderer.player.x += 1;
			action.dx = +1;
			if (renderer.player.x >= renderer.mapWidth) {
				renderer.player.x = renderer.mapWidth;
				action.dx = 0;
			}
		}

		// get tile and check if it's walkable
		if( !renderer.isWalkable(renderer.player.x, renderer.player.y) ){
			// wall
			renderer.player.x = oldX;
			renderer.player.y = oldY;
			action.dx = 0;
			action.dy = 0;
		}

		action.x = renderer.player.x;
		action.y = renderer.player.y;
		camera.centerAround(renderer.player.x, renderer.player.y);
	

		let bonus = renderer.checkForBonus(renderer.player.x, renderer.player.y);
		if (bonus != 0) {
			score += 10;
			if( bonus == BONUS_BOMB ) {
				numBombs += 5;
			}
			
			if( score >= maxScore ) {
				levelWon = true;
				action.gameWon = true;
			}
			action.score = score;
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
				action.bombPlaced = true;
			}
		}
	}
	else {
		let dirX = 0, dirY = 0;
		if( leftPressed ) dirX =-1;
		if( rightPressed) dirX =+1;
		if( upPressed)	  dirY =-1;
		if( downPressed)  dirY =+1;
		if( dirX != 0 || dirY != 0 ) {
			renderer.placeBarrier(renderer.player.x + dirX, renderer.player.y + dirY);
			action.gutterThrown = true;
			action.dx = dirX;
			action.dy = dirY;
			action.x = renderer.player.x;
			action.y = renderer.player.y;
		}
	}

	// check to see if ANY cat reached mouse
	for( let e = 0; e < enemies.length; e++) {
		if (renderer.player.x == enemies[e].catX && renderer.player.y == enemies[e].catY) {
			gameOver = true;
			action.gameOver = true;
			break;
		}
	}

	// only update server if anything has changed!
	if( action.dx != 0 || action.dy != 0 || action.gutterThrown || action.bombPlaced || action.gameOver || action.gameWon) {
		updateGameServer(action);
	}
}

async function updateGameServer(action) {
	let resp = await fetch("/movement", {			
		method: 'POST',
		headers: {
			'Content-type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify(action)
	});

	if( !resp.ok) console.log("  could not update player action on server!");
}

// calculate the next step, the cat does
function updateEnemy() {
	for( let e = 0; e < enemies.length; e++ ) {
		let enemy = enemies[e];
		enemy.calculateNextMove(renderer);
	}
}
