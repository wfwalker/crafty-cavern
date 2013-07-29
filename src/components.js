// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },

  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this; 
    }
  }
});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

// A Tree stops motion and can be cut down by the player
Crafty.c('Tree', {
  init: function() {
    this.requires('Actor, platoTree, Solid');
  },
});

// A Monster causes all kinds of trouble
Crafty.c('Monster', {
  init: function() {
    this.requires('Actor, platoMonster, Fourway, Solid, Collision')
      .onHit('Solid', this.stopMovement);
  },

  // Stops the movement
  stopMovement: function() {
    console.log("monster stopMovement");
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },

});

// A Chest has either gold or treasure items inside it
Crafty.c('Chest', {
  init: function() {
    this._gold = (1 + 50 * Math.random()) | 0;
    this.requires('Actor, platoChest');
  },

  collect: function() {
    this.destroy();
    Crafty.trigger('ChestVisited', this);    
  }
});

// A castle is a tile on the grid that the PC must visit in order to win the game
Crafty.c('Castle', {
  init: function() {
    this.requires('Actor, platoCastle');
  },
});

// This is the player-controlled character
Crafty.c('PlayerCharacter', {
  init: function() {
    this._hitPoints = 1;
    this._gold = 0;
    this._inUseItems = [];
    this._unusedItems = [];

      // creates a player that moves four ways and stops on collision with solid actors
    this.requires('Actor, Fourway, platoPlayer, Solid, Collision')
      .fourway(4)
      .onHit('Solid', this.stopMovement)
      .onHit('Chest', this.visitChest)
      .bind('Moved', this.attractMonsters);
  },

  attractMonsters: function() {
    var player = this;

    Crafty('Monster').each(function (index) {
      var goNorth = (player.at().y < this.at().y);
      var goSouth = (player.at().y > this.at().y);
      var goEast = (player.at().x > this.at().x);
      var goWest = (player.at().x < this.at().x);

      this._movement = {x: 0, y: 0};

      if (goNorth) { this._movement.y = -4; }
      else if (goSouth) { this._movement.y = 4; }
      else if (goEast) { this._movement.x = 4; }
      else if (goWest) { this._movement.x = -4; }

      this.x += this._movement.x;
      this.y += this._movement.y;
    });
  },

  // Stops the movement
  stopMovement: function() {
    console.log("player stopMovement");
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },

  // Respond to this player visiting a chest
  visitChest: function(data) {
    chest = data[0].obj;
    this._gold = this._gold + chest._gold;
    document.getElementById('gold').innerHTML = this._gold;
    chest.collect();
  }  
});


