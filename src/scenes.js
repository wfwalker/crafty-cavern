
// Helper method

function _placeElementRandomly(inOccupied, inElementName) {

	while (true) {
		var x = (Math.random() * Game.map_grid.width) | 0;
		var y = (Math.random() * Game.map_grid.height) | 0;

		if (! inOccupied[x][y]) {
			Crafty.e(inElementName).at(x, y);
			inOccupied[x][y] = true;	
			// console.log("placed " + inElementName + " at " + x + ", " + y);
			return;				
		}
	}
}

function _getWorthyOpponentName(inPlayer) {
	var thresholdPoints = inPlayer.points() / 2;

	while (true) {
		var index = Math.floor(Math.random() * monstersTable.length);
		var candidate = monstersTable[index]
		if (candidate['points'] < thresholdPoints) {
			return candidate['name'];
		}
	}
}

// Game scene
// -------------
// Runs the core gameplay loop
Crafty.scene('Game', function() {

	console.log("start game scene");

	// A 2D array to keep track of all occupied tiles
	this.occupied = new Array(Game.map_grid.width);
	for (var i = 0; i < Game.map_grid.width; i++) {
		this.occupied[i] = new Array(Game.map_grid.height);
		for (var y = 0; y < Game.map_grid.height; y++) {
			this.occupied[i][y] = false;
		}
	}	

	// Player character, placed at 5, 5 on our grid
	this.player = Crafty.e('PlayerCharacter').at(5, 5);
	Crafty.viewport.follow(this.player, 0, 0);		
	this.occupied[this.player.at().x][this.player.at().y] = true;

	// Place a wall at every edge square on our grid
	// Place random trees throughout the map
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			var at_edge = x == 0 || x == Game.map_grid.width - 1 || y == 0 || y == Game.map_grid.height - 1;

			if (at_edge) {
				// Place a wall entity at the current tile
				Crafty.e('Wall').at(x, y);
				this.occupied[x][y] = true;
			} else if (Math.random() < 0.17 && !this.occupied[x][y]) {
				// Place a bush entity at the current tile
				Crafty.e('Tree').at(x, y);
				this.occupied[x][y] = true;
			}
		}
	}

	// Generate some castles in random locations
	for (var castleCount = 0; castleCount < 2; castleCount++) {
		_placeElementRandomly(this.occupied, 'Castle');
	}

	// Generate some monsters in random locations
	for (var monsterCount = 0; monsterCount < 10; monsterCount++) {
		_placeElementRandomly(this.occupied, _getWorthyOpponentName(this.player));
	}

	// Generate some chests in random locations
	for (var chestCount = 0; chestCount < 5; chestCount++) {
		_placeElementRandomly(this.occupied, 'Chest');
	}

	this.show_victory = this.bind('ChestVisited', function() {
		if (!Crafty('Chest').length) {
			console.log("Game --> Victory");
			Crafty.scene('Victory');
		}
	});

	this.show_defeat = this.bind('PlayerKilled', function() {
		console.log("Game --> Defeat");
		Crafty.scene('Defeat');
	});

}, function() {
	console.log("unbind");
	this.unbind('CastleVisited', this.show_victory);
	this.unbind('PlayerKilled', this.show_defeat);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
	console.log("start victory scene");

	Crafty.e('2D, DOM, Text')
		.text('Victory')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.css($text_css);

	console.log("Victory");
	setTimeout(function() { Crafty.scene('Game'); }, 10000);
});

// Defeat scene
// -------------
// Tells the player when they've lost and lets them start a new game
Crafty.scene('Defeat', function() {
	console.log("start defeat scene");

    Crafty.background("#000");	

	Crafty.e('2D, DOM, Text')
		.text('Defeat')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.css($text_css);

	setTimeout(function() { Crafty.scene('Game'); }, 20000);
});

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
	console.log("start loading scene");

    Crafty.background("#000");

	// Draw some text for the player to see in case the file
	//  takes a noticeable amount of time to load
	Crafty.e('2D, DOM, Text')
		.text('Loading...')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.css($text_css);

	// Load our sprite map image
	Crafty.load(['assets/caverna.png'], function() {
		// Once the image is loaded...

		Crafty.sprite('assets/caverna.png', {
			platoAlien: [2, 2, 16, 16],
			platoBlob: [20, 2, 32, 32],
			platoCastle: [54, 2, 32, 32],
			platoChavin: [88, 2, 32, 32],
			platoChest: [122, 2, 32, 32],
			platoCrab: [156, 2, 16, 16],
			platoDarklord: [174, 2, 32, 32],
			platoDemon: [208, 2, 32, 32,],
			platoEmpty: [2, 36, 32, 32],
			platoEyeball: [36, 36, 32, 32],
			platoForkman: [71, 36, 16, 16],
			platoGobber: [89, 36, 32, 32],
			platoGrump: [123, 36, 16, 16],
			platoGuy: [141, 36, 16, 16],
			platoHippo: [159, 36, 16, 16],
			platoHoplite: [177, 36, 32, 32],
			platoJackolantern: [211, 36, 32, 32],
			platoJubjub: [2, 70, 16, 16],
			platoLarry: [20, 70, 16, 16],
			platoMonster: [38, 70, 32, 32],
			platoOpenChest: [72, 70, 32, 32],
			platoPlayer: [107, 70, 32, 32],
			platoRajah: [140, 70, 32, 32],
			platoScary: [174, 70, 16, 16],
			platoSnail: [192, 70, 32, 32],
			platoSnake: [2, 104, 32, 32],
			platoSplat: [36, 104, 32, 32],
			platoTree2: [104, 104, 32, 32],
			platoTree: [70, 104, 32, 32],
			platoTree: [70, 104, 32, 32],
			platoTrex: [138, 104, 32, 32],
			platoUgly: [172, 104, 32, 32],
			platoWahoo: [206, 104, 32, 32],
			platoWraith: [2, 138, 32, 32]
		});

	    // Now that our sprites are ready to draw, start the game
	    setTimeout("Crafty.scene('Game')", 2000);
	})
});