function drawMaze() {
	var startX = Math.floor(camera.x / TILE_WIDTH);
	var endX = startX + camera.width / TILE_WIDTH;
	var startY = Math.floor(camera.y / TILE_HEIGHT);
	var endY = startY + camera.height / TILE_HEIGHT;
	var offsetX = -camera.x + startX * TILE_WIDTH;
	var offsetY = -camera.y + startY * TILE_HEIGHT;

	for (var y = startY; y < endY; y++) {
		for (var x = startX; x < endX; x++) {
			var xPos = Math.round((x - startX) * TILE_WIDTH + offsetX);
			var yPos = Math.round((y - startY) * TILE_HEIGHT + offsetY);

			var tile = maze.mazeData[y][x];
			var imgToDraw;
			if (tile == 0) imgToDraw = floorImg;
			else if (tile == 10) imgToDraw = wallImg;
			else imgToDraw = floorImg;

			ctx.drawImage(imgToDraw, xPos, yPos, TILE_WIDTH, TILE_HEIGHT);

			if (visitedMazeData[y][x] != 0) {
				ctx.drawImage(tenPoints, xPos + 2, yPos + 5, 16, 9);
			}
		}
	}

	// draw enemies
	for (var e = 0; e < enemies.length; e++) {
		var enemy = enemies[e];

		if (camera.isInView(enemy.catX, enemy.catY)) {
			var xPos = Math.round((enemy.catX - startX) * TILE_WIDTH + offsetX);
			var yPos = Math.round((enemy.catY - startY) * TILE_HEIGHT + offsetY);

			ctx.drawImage(enemy.image, xPos, yPos, enemy.image.width, enemy.image.height);
		}
	}
	// draw mouse
	ctx.drawImage(mouseImg, Math.round((mouseX - startX) * TILE_WIDTH + offsetX), Math.round((mouseY - startY) * TILE_HEIGHT + offsetY), TILE_WIDTH, TILE_HEIGHT);
}
