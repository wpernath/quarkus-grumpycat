// we need to get key downs / ups
function keyDownHandler(event) {
	if (event.code == "ArrowUp" || event.code == "KeyW") upPressed = true;
	if (event.code == "ArrowLeft" || event.code == "KeyA") leftPressed = true;
	if (event.code == "ArrowRight" || event.code == "KeyD") rightPressed = true;
	if (event.code == "ArrowDown" || event.code == "KeyS") downPressed = true;
	if (event.code == "Space" || event.code == "Enter") spacePressed = true;
	if (event.code == "ShiftLeft" || event.code == "ShiftRight") dropStonePressed = true;
	if (event.code == "Escape") escapePressed = true;
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

const pointerStart = { x: 0, y: 0, identifier: 0, touched: false };
const virtGamePad = { x: 0, y: 0, identifier: 0, touched: false };
const virtButtons = { x: 0, y: 0, identifier: 0, touched: false };
let displayTouched = false;

function handleTouchStart(event) {
	event.preventDefault();
	for (let i = 0; i < event.changedTouches.length; i++) {
		let evt = event.changedTouches[i];
		pointerStart.x = Math.round(evt.clientX - canvas.offsetLeft);
		pointerStart.y = Math.round(evt.clientY - canvas.offsetTop);
		pointerStart.identifier = evt.identifier;

		if (pointerStart.x < canvas.width / 2) {
			// virtGamePad clicked
			virtGamePad.x = pointerStart.x;
			virtGamePad.y = pointerStart.y;
			virtGamePad.identifier = evt.identifier;
			virtGamePad.touched = true;
			displayTouched = true;
		} else if (pointerStart.x > canvas.width / 2) {
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
		} else if (evt.identifier == virtButtons.identifier) {
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

		if (evt.identifier == virtGamePad.identifier && virtGamePad.touched) {
			let dx = Math.round(virtGamePad.x - (evt.clientX - canvas.offsetLeft));
			let dy = Math.round(virtGamePad.y - (evt.clientY - canvas.offsetTop));

			upPressed = downPressed = leftPressed = rightPressed = false;

			if (Math.abs(dx) > 20) {
				if (dx > 0) {
					leftPressed = true;
				} else if (dx < 0) {
					rightPressed = true;
				}
			}

			if (Math.abs(dy) > 20) {
				if (dy > 0) {
					upPressed = true;
				} else if (dy < 0) {
					downPressed = true;
				}
			}
			break;
		}
	}
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
		if (currentLevel < numLevels) {
			initLevel();
		} else {
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

function drawCenteredText(text, y) {
	gameEngine.drawCenteredText(text, y);
}

let titleScreenDrawn = 0;
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
	if (gameEngine.getDeviceType() === DEVICE_TYPE.SMALL) {
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
	drawCenteredText("Server version: " + serverVersion, 24 + gameEngine.getHeadlineFont().size);

	ctx.font = gameEngine.getMenuFont().size + "px Arial";
	ctx.shadowBlur = 10;
	ctx.shadowColor = "red";
	ctx.fillStyle = "white";

	titleScreenDrawn += 1;
	if (titleScreenDrawn > 8) {
		currentSelectedMenueEntryColor = currentSelectedMenueEntryColor === "#1259A5" ? "white" : "#1259A5";
		titleScreenDrawn = 0;
	}

	for (let i = 0; i < menueEntries.length; i++) {
		if (titleScreenSelectedEntry === i) {
			ctx.fillStyle = currentSelectedMenueEntryColor;
		} else {
			ctx.fillStyle = "white";
		}
		let x = drawCenteredText(menueEntries[i].title, y);
		y += h;
	}

	ctx.restore();

	ctx.drawImage(catLeftStatue, 12, canvas.height - 280, 160, 250);
	ctx.drawImage(catRightStatue, canvas.width - 180, canvas.height - 280, 160, 250);
	if (spacePressed) {
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
