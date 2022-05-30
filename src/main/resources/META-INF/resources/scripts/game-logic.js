// global key states
let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;

// global game states
let gamePaused = true;
let gameOver = false;
let levelWon = false;
let catSpeed = CAT_SPEED;
let lastTimestamp = 0;
let numPoints = 0;
let currentLevel = 0;
let numLevels = 2;
let score = 0;
let maxScore = 0;
let numBombs = 10;
let bombsThrown = 0;
let ctx;
let canvas;
var gameWorld;
let enemies;
let camera;


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
	terrainTiles = loader.addImage("/images/tilesets/terrain.png"),
	catImg = catLeft;

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
}

function keyUpHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = false;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = false;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = false;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = false;
	if (event.code == "KeyP") gamePaused = !gamePaused;
	if (event.code == "Space") spacePressed = false;
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

		currentLevel = 0;
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
			mouseX = renderer.player.x
			mouseY = renderer.player.y;

			catSpeed = CAT_SPEED;

			enemies = renderer.enemies;
			for(var i = 0; i < enemies; i++ ) {
				enemies[i].image = catLeft;
			}

			camera = renderer.camera;
			console.log(camera);
			camera.centerAround(mouseX, mouseY);


			numPoints = 0;
			maxScore = renderer.countMaxScore();

			numBombs = 15;
			bombsThrown = 0;
			gameOver = false;
			gamePaused = true;
			levelWon = false;
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
	ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT+20);

	ctx.drawImage(gameOverDog, (MAZE_WIDTH - gameOverDog.width) / 2, (MAZE_HEIGHT - gameOverDog.height) / 2);
	ctx.drawImage(gameOverImg, (MAZE_WIDTH - 620) / 2, 10, 620, 400);

	ctx.font = "22px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";

	ctx.fillText("Press <space> to start again", MAZE_WIDTH - 620, MAZE_HEIGHT);

	if (spacePressed) {
		ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT+20);
		currentLevel = 0;
		initLevel();
		spacePressed = false;
		gameOver = false;
	}
}

// draws the currently loaded maze
function drawMaze() {
	ctx.clearRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT + 20);
	renderer.draw(ctx);	
}

function drawStatus() {
	ctx.clearRect(0, MAZE_HEIGHT, MAZE_WIDTH, 32);

	ctx.font = "20px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "white";
	ctx.fillText("SCORE: " + score + " of " + maxScore , 10, MAZE_HEIGHT + 8);
	ctx.fillText("LEVEL: " + (currentLevel + 1), 300, MAZE_HEIGHT + 8);
	ctx.fillText("BOMBS: " + bombsThrown + " of " + numBombs, 600, MAZE_HEIGHT + 8)
}

function updatePlayer() {
	var oldX = renderer.player.x,
		oldY = renderer.player.y,
		dirX = 0,
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

	if (!renderer.checkPositionVisitedAndChange(renderer.player.x, renderer.player.y)) {
		score += 10;
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
	var mouseX = renderer.player.x;
	var mouseY = renderer.player.y;
	var dirs = [new Direction(-1, 0), new Direction(0, -1), new Direction(0, +1), new Direction(+1, 0), new Direction(-1,-1), new Direction(+1,+1), new Direction(+1,-1), new Direction(-1,+1)];

	for( var e = 0; e < enemies.length; e++ ) {
		enemies[e].nextPositionFound = false;
		if(!enemies[e].stunned ) {
			var catX = enemies[e].catX;
			var catY = enemies[e].catY;
		
			var queue = new Queue();

			// prepare discovered places
			var discovered = new Array(renderer.mapHeight);
			for (var y = 0; y < renderer.mapHeight; y++) {
				discovered[y] = new Array(renderer.mapWidth);
				for (var x = 0; x < renderer.mapWidth; x++) {
					discovered[y][x] = false;
				}
			}
			// mark the current pos as visited
			discovered[catY][catX] = true;

			queue.enqueue(new Node(catX, catY, null));
			while (!queue.isEmpty) {
				var node = queue.dequeue();

				for (var d = 0; d < dirs.length; d++) {
					var dir = dirs[d];
					var newX = node.x + dir.dx;
					var newY = node.y + dir.dy;
					var newDir = node.initialDir == null ? dir : node.initialDir;

					// found mouse
					if (newX == mouseX && newY == mouseY) {
						catX = catX + newDir.dx;
						catY = catY + newDir.dy;

						enemies[e].catX = catX;
						enemies[e].catY = catY;
						if( newDir.dx < 0 )    enemies[e].image=catLeft;
						else if( newDir.dx > 0)enemies[e].image=catRight;

						queue = new Queue();
						enemies[e].nextPositionFound = true;
						break;
					}

					if (renderer.isWalkable(newX, newY) && !discovered[newY][newX]) {
						discovered[newY][newX] = true;
						queue.enqueue(new Node(newX, newY, newDir));
					}
				}
			}
		}
		else { // stunned
			var currentTimeStamp = Date.now();
			if( (currentTimeStamp - enemies[e].stunnedTime) > 3000 ) {
				enemies[e].stunned = false;
				enemies[e].nextPositionFound = true;
			}
		}

		if( !enemies[e].nextPositionFound ) {
			var enemy = enemies[e];			
			//console.log("  enemy " + e + " can't currently reach mouse. (" + enemy.catX + " / " + enemy.catY);
			var enemyWalked = false;
			// just walk along a direction until cat reaches a border, then change to the 
			// next possible direction and walk along that
			if( enemy.currentWalkingDir != null ) {
				if( renderer.isWalkable(enemy.catX + enemy.currentWalkingDir.dx, enemy.catY + enemy.currentWalkingDir.dy)) {
					enemy.catX += enemy.currentWalkingDir.dx;
					enemy.catY += enemy.currentWalkingDir.dy;
					enemyWalked = true;
				}
			}
			if( !enemyWalked ) {
				for( var d = 0; d < dirs.length; d++) {
					var dir = dirs[d];
					if( renderer.isWalkable(enemy.catX + dir.dx, enemy.catY + dir.dy)) {
						enemy.currentWalkingDir = dir;
						enemy.catX += enemy.currentWalkingDir.dx;
						enemy.catY += enemy.currentWalkingDir.dy;
						break;
					}
				}
			}
		}
	}
}
