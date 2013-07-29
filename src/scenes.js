
// Game scene
// -------------
// Runs the core gameplay loop
Crafty.scene('Game', function() {

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

	// Place a tree at every edge square on our grid of 16x16 tiles
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			var at_edge = x == 0 || x == Game.map_grid.width - 1 || y == 0 || y == Game.map_grid.height - 1;

			if (Math.random() < 0.06 && !this.occupied[x][y]) {
				// Place a bush entity at the current tile
				Crafty.e('Tree').at(x, y);
				this.occupied[x][y] = true;
			}
		}
	}

	// Generate up to two castles on the map in random locations
	var max_castles = 2;
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			if (Math.random() < 0.02) {
				if (Crafty('Castle').length < max_castles && !this.occupied[x][y]) {
					Crafty.e('Castle').at(x, y);
				}
			}
		}
	}

	// Generate up to two castles on the map in random locations
	var max_monsters = 10;
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			if (Math.random() < 0.01) {
				if (Crafty('Monster').length < max_monsters && !this.occupied[x][y]) {
					Crafty.e('Monster').at(x, y);
				}
			}
		}
	}

	// Generate up to five chests on the map in random locations
	var max_chests = 5;
	for (var x = 0; x < Game.map_grid.width; x++) {
		for (var y = 0; y < Game.map_grid.height; y++) {
			if (Math.random() < 0.02) {
				if (Crafty('Chest').length < max_chests && !this.occupied[x][y]) {
					Crafty.e('Chest').at(x, y);
				}
			}
		}
	}

	this.show_victory = this.bind('ChestVisited', function() {
		if (!Crafty('Chest').length) {
			Crafty.scene('Victory');
		}
	});

}, function() {
	this.unbind('CastleVisited', this.show_victory);
});

// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
	Crafty.e('2D, DOM, Text')
		.attr({ x: 0, y: 0 })
		.text('Victory!').css({color: '#FF6402'});

	this.restart_game = this.bind('KeyDown', function() {
		Crafty.scene('Game');
	});
}, function() {
	this.unbind('KeyDown', this.restart_game);
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
  Crafty.load([
  		'assets/plato/tree.gif',
  		'assets/plato/castle.gif',
  		'assets/plato/player.gif',
  		'assets/plato/chest.gif',
  		'assets/plato/hoplite.gif'
  		], function(){
    // Once the image is loaded...

    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(32, 'assets/plato/tree.gif', {
      platoTree:    [0, 0]
    });

    Crafty.sprite(32, 'assets/plato/castle.gif', {
      platoCastle:    [0, 0]
    });

    Crafty.sprite(32, 'assets/plato/player.gif', {
      platoPlayer:    [0, 0]
    });

    Crafty.sprite(32, 'assets/plato/chest.gif', {
      platoChest:     [0, 0]
    });

    Crafty.sprite(32, 'assets/plato/hoplite.gif', {
      platoMonster:   [0, 0]
    });

    // Now that our sprites are ready to draw, start the game
    Crafty.scene('Game');
  })
});