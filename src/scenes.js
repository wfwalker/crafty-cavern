
// Helper method

function _placeElementRandomly(inOccupied, inElementName) {

	while (true) {
		var x = (Math.random() * Game.map_grid.width) | 0;
		var y = (Math.random() * Game.map_grid.height) | 0;

		if (! inOccupied[x][y]) {
			Crafty.e(inElementName).at(x, y);
			inOccupied[x][y] = true;	
			console.log("placed " + inElementName + " at " + x + ", " + y);
			return;				
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
			} else if (Math.random() < 0.06 && !this.occupied[x][y]) {
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
		_placeElementRandomly(this.occupied, 'Hoplite');
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
	Crafty.e('2D, DOM, Text')
		.text('Victory')
		.attr({ x: 10, y: 10, w: 100, h: 20 })
		.css({color: '#FF6402'});

	console.log("Victory");
	setTimeout(function() { Crafty.scene('Game'); }, 10000);
});

// Defeat scene
// -------------
// Tells the player when they've lost and lets them start a new game
Crafty.scene('Defeat', function() {
	Crafty.e('2D, DOM, Text')
		.text('Defeat')
		.attr({ x: 10, y: 10, w: 100, h: 20 })
		.css({color: '#FF6402'});

	console.log("Defeat");
	setTimeout(function() { Crafty.scene('Game'); }, 10000);
});

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
	// Draw some text for the player to see in case the file
	//  takes a noticeable amount of time to load
	Crafty.e('2D, DOM, Text')
		.text('Loading...')
		.attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() })
		.css({color: '#FF6402'});

	// Load our sprite map image
	Crafty.load(['assets/caverna.png'], function() {
		// Once the image is loaded...

	    // Define the individual sprites in the image
	    // Each one (spr_tree, etc.) becomes a component
	    // These components' names are prefixed with "spr_"
	    //  to remind us that they simply cause the entity
	    //  to be drawn with a certain sprite

		Crafty.sprite('assets/caverna.png', {
			platoHoplite: [177, 36, 32, 32],
			platoPlayer: [107, 70, 32, 32],
			platoCastle: [54, 2, 32, 32],
			platoTrex: [138, 104, 32, 32],
			platoTree: [70, 104, 32, 32],
			platoChest: [122, 2, 32, 32]
		});


	    // Now that our sprites are ready to draw, start the game
	    Crafty.scene('Game');
	})
});