class Direction {
	constructor(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	}
}

class Node {
	constructor(x, y, dir) {
		this.x = x;
		this.y = y;
		this.initialDir = dir;
	}
}

class Queue {
	constructor() {
		this.elements = {};
		this.head = 0;
		this.tail = 0;
	}
	enqueue(element) {
		this.elements[this.tail] = element;
		this.tail++;
	}
	dequeue() {
		const item = this.elements[this.head];
		delete this.elements[this.head];
		this.head++;
		return item;
	}
	peek() {
		return this.elements[this.head];
	}
	get length() {
		return this.tail - this.head;
	}
	get isEmpty() {
		return this.length === 0;
	}
}

// global variables
const MAZE_WIDTH = 992;
const MAZE_HEIGHT = 756;

const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;
const CAT_SPEED = 3;

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
let visitedMazeData = [];
let numPoints = 0;
let currentLevel = 0;
let numLevels = 2;
let score = 0;
let maze;
let ctx;
let canvas;
let catX, catY, mouseX, mouseY;

// load images
let loader = new PxLoader(),
	floorImg = loader.addImage("images/tiles/rock.png"),
	floorVisitedImg = loader.addImage("images/visited.png"),
	wallImg = loader.addImage("images/tiles/tile_2.png"),
	catLeft = loader.addImage("images/grumpy_cat_left.png"),
	catRight = loader.addImage("images/grumpy_cat_right.png"),
	tenPoints = loader.addImage("images/10-points.png"),
	fivPoints = loader.addImage("images/5-points.jpg"),
	pauseImg = loader.addImage("images/pause.png"),
	gameOverImg = loader.addImage("images/gameOver.png"),
	mouseImg = loader.addImage("images/sensa_jaa.png"),
	gameOverDog = loader.addImage("images/sensa_nee.png"),
	levelWonDog = loader.addImage("images/sensa_jaa.png");

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
}

function keyUpHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = false;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = false;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = false;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = false;
	if (event.code == "KeyP") gamePaused = !gamePaused;
	if (event.code == "Space") spacePressed = true;
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

		initLevel();
	}
}

// function to load a level from server and
// initialize it to use it locally
function initLevel() {

	// download a new level
	$.ajax({
		url: "/maze/" + currentLevel,
		success: function(result) {
			console.log("current level loaded: " + result);
			maze = result;
			catX = maze.catX;
			catY = maze.catY;
			mouseX = maze.mouseX;
			mouseY = maze.mouseY;
			catSpeed = CAT_SPEED;
			visitedMazeData = new Array(maze.height);
			numPoints = 0;
			for (var y = 0; y < maze.height; y++) {
				visitedMazeData[y] = new Array(maze.width);
				for (var x = 0; x < maze.width; x++) {
					var tile = maze.mazeData[y][x];
					if (tile < 10) {
						visitedMazeData[y][x] = 10;
						numPoints++;
					} else visitedMazeData[y][x] = 0;
				}
			}

			gameOver = false;
			gamePaused = true;
			levelWon = false;
			window.requestAnimationFrame(gameLoop);
		}
	});	
}

// main game loop: move player, move enemy, update maze
function gameLoop(timestamp) {
	var elapsed = timestamp - lastTimestamp;

	if (elapsed > 80) {
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
			ctx.drawImage(pauseImg, (MAZE_WIDTH - pauseImg.width) / 2, (MAZE_HEIGHT - pauseImg.height) / 2);
		}

		if (gameOver) {
			drawGameOver();
		}

		if (levelWon) {
			drawLevelWon();
			return;
		}
	}
	window.requestAnimationFrame(gameLoop);
}

function drawLevelWon() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);

	ctx.drawImage(levelWonDog, (MAZE_WIDTH - levelWonDog.width) / 2, (MAZE_HEIGHT - levelWonDog.height) / 2);

	ctx.font = "16px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "white";

	ctx.fillText("Press <space> to play next level", MAZE_WIDTH - 620, MAZE_HEIGHT - 20);

	if (spacePressed) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);
		spacePressed = false;
		gameOver = false;

		if( ++currentLevel < numLevels ) {
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
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);

	ctx.drawImage(gameOverDog, (MAZE_WIDTH - gameOverDog.width) / 2, (MAZE_HEIGHT - gameOverDog.height) / 2);
	ctx.drawImage(gameOverImg, (MAZE_WIDTH - 620) / 2, 10, 620, 400);

	ctx.font = "16px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "white";

	ctx.fillText("Press <space> to start again", MAZE_WIDTH - 620, MAZE_HEIGHT - 20);

	if (spacePressed) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, MAZE_WIDTH, MAZE_HEIGHT);

		initLevel();
		spacePressed = false;
		gameOver = false;
	}
}

// draws the currently loaded maze
function drawMaze() {
	for (var y = 0; y < maze.height; y++) {
		for (var x = 0; x < maze.width; x++) {
			var tile = maze.mazeData[y][x];
			var imgToDraw;
			if (tile == 0) imgToDraw = floorImg;
			else if (tile == 10) imgToDraw = wallImg;
			else imgToDraw = floor;

			ctx.drawImage(imgToDraw, x * TILE_WIDTH, y * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);

			if (visitedMazeData[y][x] != 0) {
				ctx.drawImage(tenPoints, x * TILE_WIDTH + 2, y * TILE_HEIGHT + 5, 16, 9);
			}
		}
	}

	// draw cat
	ctx.drawImage(catLeft, catX * TILE_WIDTH, catY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);

	// draw mouse
	ctx.drawImage(mouseImg, mouseX * TILE_WIDTH, mouseY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
}

function drawStatus() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, MAZE_HEIGHT - 20, MAZE_WIDTH, 20);

	ctx.font = "16px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillStyle = "white";
	ctx.fillText("SCORE: " + score, 10, MAZE_HEIGHT - 2);
	ctx.fillText("LEVEL: " + currentLevel + 1, 300, MAZE_HEIGHT - 2);
}

function updatePlayer() {
	var oldX = mouseX,
		oldY = mouseY,
		tile;

	if (upPressed) {
		mouseY -= 1;
		if (mouseY <= 0) mouseY = 0;
	}

	if (downPressed) {
		mouseY += 1;
		if (mouseY >= maze.height) mouseY = maze.height;
	}

	if (leftPressed) {
		mouseX -= 1;
		if (mouseX <= 0) mouseX = 0;
	}

	if (rightPressed) {
		mouseX += 1;
		if (mouseX >= maze.width) mouseX = maze.width;
	}

	// get tile and check if it's walkable
	tile = maze.mazeData[mouseY][mouseX];
	if (tile == 10) {
		// wall
		mouseX = oldX;
		mouseY = oldY;
	}

	if (visitedMazeData[mouseY][mouseX] != 0) {
		visitedMazeData[mouseY][mouseX] = 0;
		score += 10;
		--numPoints;
		if (numPoints <= 0) {
			levelWon = true;
		}
	}

	if (mouseX == catX && mouseY == catY) {
		gameOver = true;
	}
}

// calculate the next step, the cat does
function updateEnemy() {
	var dirs = [new Direction(-1, 0), new Direction(0, -1), new Direction(+1, 0), new Direction(0, +1)];
	var queue = new Queue();
	var discovered = new Array(maze.height);
	for (var y = 0; y < maze.height; y++) {
		discovered[y] = new Array(maze.width);
		for (var x = 0; x < maze.width; x++) {
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

			if (newX == mouseX && newY == mouseY) {
				catX = catX + newDir.dx;
				catY = catY + newDir.dy;
				return;
			}

			if (!maze.logicData[newY][newX] && !discovered[newY][newX]) {
				discovered[newY][newX] = true;
				queue.enqueue(new Node(newX, newY, newDir));
			}
		}
	}
}
