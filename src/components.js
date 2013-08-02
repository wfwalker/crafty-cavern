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

Crafty.c('Log', {
  _logElement: null,

  init: function() {
    this._logElement = document.getElementById('log');
  },

  log: function(message) {
    this._logElement.value += "\n";
    this._logElement.value += message;
  },

});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

// A Tree stops motion and can be cut down by the player
Crafty.c('Wall', {
  init: function() {
    this.requires('Actor, Color, Solid')
      .color('rgb(255, 116, 2)'); //FF6402
  },
});

// A Tree stops motion and can be cut down by the player
Crafty.c('Tree', {
  init: function() {
    this.requires('Actor, platoTree, Solid');
  },

  fell: function() {
    this.destroy();
    Crafty.trigger('TreeFelled', this);    
  }

});

// A combatant has a number of points which is decremented upon suffering damage.
// When the point count decrements to zero, the combatant dies
Crafty.c("Combatant", {
  _points: 0,

  points: function (inPoints) {
    if (!inPoints) return this._points;
    this._points = inPoints;
    this.trigger("Change");
    return this;
  },

  sufferDamage: function (inDamagePoints) {
    this._points = this._points - inDamagePoints;
    this.trigger("Change");
    if (this._points <= 0) {
      this.trigger("Died");
    }
  }
});

// A Monster causes all kinds of trouble
Crafty.c('Monster', {
  init: function() {
    this.requires('Actor, Combatant, Fourway, Solid, Collision, Log')
      .onHit('PlayerCharacter', this.attackPlayerCharacter)
      .bind('Died', this.monsterDied)
      .onHit('Solid', this.stopMovement);

    // set up points for combat
    this.points(1 + ((5 * Math.random()) | 0));
  },

  monsterDied: function() {
    this.destroy();
    Crafty.trigger('MonsterKilled', this);    
    this.log("You have slain the monster"); 
  },

  attackPlayerCharacter: function(data) {
    // this.log("monster with " + this.points() + " attack Player with " + data[0].obj.points());
    this.log("The monster attacks you");
    data[0].obj.sufferDamage(1);
  },

  // Stops the movement
  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  },

});

Crafty.c('TRex', {
  init: function() {
    this.requires('Monster, platoTrex');
  },
});

Crafty.c('Hoplite', {
  init: function() {
    this.requires('Monster, platoHoplite');
  },
});

// A Chest has either gold or treasure items inside it
// When the player visits the Chest, it is destroyed.
Crafty.c('Chest', {
  init: function() {
    this._gold = (1 + 50 * Math.random()) | 0;
    this.requires('Actor, platoChest, Solid');
  },

  collect: function() {
    this.destroy();
    Crafty.trigger('ChestVisited', this);    
  }
});

// A castle is a tile on the grid where the player is safe from attack and
// where the Player can purchase Arrows and other goodies.
Crafty.c('Castle', {
  init: function() {
    this.requires('Actor, platoCastle');
  },
});

// This is the player-controlled character
Crafty.c('PlayerCharacter', {
  init: function() {
    // from the turbo pascal: "exp := 24.0; arrows := 20; gold := 10; which_swd := 0;"

    this._gold = 10;
    this._arrows = 10;
    this._inUseItems = [];
    this._unusedItems = [];

      // creates a player that moves four ways and stops on collision with solid actors
    this.requires('Actor, Fourway, platoPlayer, Solid, Combatant, Collision, Log')
      .fourway(4)
      .onHit('Tree', this.fellTree)
      .onHit('Monster', this.attackMonster)
      .onHit('Chest', this.visitChest)
      .onHit('Solid', this.stopMovement)
      .bind('Died', this.playerDied)
      .bind('Change', function() {
        document.getElementById('points').innerHTML = this.points();
      })
      .bind('Moved', this.attractMonsters);

    this.points(24);
  },

  fellTree: function(data) {
    this.log("You felled the tree");
    tree = data[0].obj;
    tree.fell();
  },

  playerDied: function() {
    this.destroy();
    Crafty.trigger('PlayerKilled', this);    
    this.log("You died"); 
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

  // Attacks the monster
  attackMonster: function(data) {
    // console.log("player with " + this.points() + " attack monster with " + data[0].obj.points());
    this.log("You hit the monster");
    data[0].obj.sufferDamage(1);
  },

  // Stops the movement
  stopMovement: function() {
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
    this.log("You opened the chest and got " + chest._gold + " gold pieces");
    document.getElementById('gold').innerHTML = this._gold;
    chest.collect();
    this.log(Crafty('Chest').length + " chests left");
  }  
});


