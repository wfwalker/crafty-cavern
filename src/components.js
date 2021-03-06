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
    console.log(message);
  },

  clearLog: function() {
    this._logElement.value = "";
  }

});

// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});

// A Wall stops motion and cannot be down by the player
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
  _maximumPoints: 0,

  points: function (inPoints) {
    if (!inPoints) return this._points;
    this._points = inPoints;
    this._maximumPoints = Math.max(this._points, this._maximumPoints);
    this.trigger("Change");
    return this;
  },

  maximumPoints: function () {
    return this._maximumPoints;
  },

  gainPoints: function (inPoints) {
    console.log(this.name() + " gainPoints " + inPoints);
    this._points = this._points + inPoints;
    this._maximumPoints = Math.max(this._points, this._maximumPoints);
    this.trigger("Change");
  },

  sufferDamage: function (inDamagePoints) {
    console.log(this.name() + " suffer damage " + inDamagePoints);
    this._points = this._points - inDamagePoints;
    this.trigger("Change");
    if (this._points <= 0) {
      this.trigger("Died");
    }
  }
});

// A Monster causes all kinds of trouble
Crafty.c('Monster', {
  _name: 'Monster',
  _hitVerb: 'hit',
  _killedVerb: 'killed',
  _worth: 0,

  init: function() {
    this.requires('Actor, Combatant, Fourway, Solid, Collision, Log')
      .onHit('PlayerCharacter', this.attackPlayerCharacter)
      .bind('Died', this.monsterDied)
      .onHit('Solid', this.stopMovement);

    // set up points for combat
    this.points(1 + ((5 * Math.random()) | 0));
  },

  name: function(inName) {
    if (!inName) return this._name;
    this._name = inName;
  },

  worth: function (inWorth) {
    if (!inWorth) return this._worth;
    this._worth = inWorth;
    this.trigger("Change");
    return this;
  },

  hitVerb: function (inHitVerb) {
    if (!inHitVerb) return this._hitVerb;
    this._hitVerb = inHitVerb;
    this.trigger("Change");
    return this;
  },

  killedVerb: function (inKilledVerb) {
    if (!inKilledVerb) return this._killedVerb;
    this._killedVerb = inKilledVerb;
    this.trigger("Change");
    return this;
  },

  computeDamage: function() {
    var damage = 3 * Math.random() + (this.points() / 8) + (this.worth() / 4);
    return Math.round(damage);    
  },

  monsterDied: function() {
    this.destroy();
    console.log(Crafty('Monster').length + " monsters left");    
    Crafty.trigger('MonsterKilled', this);    
  },

  attackPlayerCharacter: function(data) {
    var damage = this.computeDamage();
    this.log('The ' + this.name() + ' hit you for ' + damage + ' points');
    data[0].obj.sufferDamage(this.computeDamage());
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

function createMonster(inSprite, inName, inHitVerb, inKilledVerb, inPoints, inWorth) {
  Crafty.c(inName, {
    init: function() {
      this.requires('Monster, ' + inSprite);
      this.name(inName);
      this.hitVerb(inHitVerb);
      this.killedVerb(inKilledVerb);
      this.points(inPoints);
      this.worth(inWorth);
    },
  });
}

var monstersTable = [
  { sprite: 'platoCrab', name: 'Gnat', hitVerb: 'hit', killedVerb: 'smashed', points: 2, worth: 2 }, 
  { sprite: 'platoHoplite', name: 'Nomad', hitVerb: 'slashed', killedVerb: 'bested', points: 10, worth: 2 }, 
  { sprite: 'platoAlien', name: 'Spider', hitVerb: 'poked', killedVerb: 'squished', points: 13, worth: 4 }, 
  { sprite: 'platoChavin', name: 'Moth', hitVerb: 'swatted at', killedVerb: 'flattened', points: 18, worth: 5 }, 
  { sprite: 'platoTree2', name: 'Tree of Death', hitVerb: 'hacked at', killedVerb: 'felled', points: 20, worth: 3 }, 
  { sprite: 'platoChavin', name: 'Snark', hitVerb: 'thwarted', killedVerb: 'disposed of', points: 28, worth: 9 }, 
  { sprite: 'platoChavin', name: 'Bolotomus', hitVerb: 'stomped', killedVerb: 'dispatched', points: 28, worth: 9 }, 
  { sprite: 'platoChavin', name: 'Nimbus', hitVerb: 'hit', killedVerb: 'killed', points: 36, worth: 11 }, 
];

for (var index = 0; index < monstersTable.length; index++) {
  var monsterData = monstersTable[index];

  console.log("initializing monster " + monsterData['name']);
  createMonster(monsterData['sprite'], monsterData['name'], monsterData['hitVerb'], monsterData['killedVerb'], monsterData['points'], monsterData['worth']);
}

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
    this.requires('Actor, platoCastle, Solid');
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
      .bind('KeyDown', function(e) {
          this.clearLog();
          this._movement = {x: 0, y: 0};

          if(e.key == Crafty.keys['A']) {
            this._movement.x = -Game.map_grid.tile.width;
          } else if (e.key == Crafty.keys['Q']) {
            this._movement.x = -Game.map_grid.tile.width;
            this._movement.y = -Game.map_grid.tile.height;
          } else if (e.key == Crafty.keys['W']) {
            this._movement.y = -Game.map_grid.tile.height;
          } else if (e.key == Crafty.keys['E']) {
            this._movement.x = Game.map_grid.tile.width;
            this._movement.y = -Game.map_grid.tile.height;
          } else if (e.key == Crafty.keys['D']) {
            this._movement.x = Game.map_grid.tile.width;
          } else if (e.key == Crafty.keys['C']) {
            this._movement.x = Game.map_grid.tile.width;
            this._movement.y = Game.map_grid.tile.height;
          } else if (e.key == Crafty.keys['X']) {
            this._movement.y = Game.map_grid.tile.height;
          } else if (e.key == Crafty.keys['Z']) {
            this._movement.x = -Game.map_grid.tile.width;
            this._movement.y = Game.map_grid.tile.height;
          }

          this.x += this._movement.x;
          this.y += this._movement.y;
          // console.log("player " + this.x + ", " + this.y);
          this.trigger('Moved');
      })
      .onHit('Tree', this.fellTree)
      .onHit('Monster', this.attackMonster)
      .onHit('Chest', this.visitChest)
      .onHit('Castle', this.visitCastle)
      .onHit('Solid', this.stopMovement)
      .bind('MonsterKilled', function (monster) {
        this.gainPoints(monster.worth());
        this.log("You have " + monster.killedVerb() + " the " + monster.name()); 
      })
      .bind('Died', this.playerDied)
      .bind('Change', function() {
        document.getElementById('points').innerHTML = this.points() + "/" + this.maximumPoints();
      })
      .bind('Moved', this.attractMonsters);

    this.points(24);
  },

  name: function() {
    return 'Player';
  },

  computeDamage: function() {
    if (this.points() > 1) {
      var swordStrength = 1;
      var damage = (swordStrength * this.points() / (2.0 * Math.log(this.points()))) + (swordStrength + 3) * Math.random();
      return Math.round(damage);
    } else {
      return 1;
    }
  },

  fellTree: function(data) {
    this.log("You felled the tree");
    tree = data[0].obj;
    tree.fell();
    this.gainPoints(1);
  },

  playerDied: function() {
    this.destroy();
    Crafty.trigger('PlayerKilled', this);    
    this.log("You died"); 
  },

  attractMonsters: function() {
    var player = this;

    Crafty('Monster').each(function (index) {
      var distance = Math.abs(player.at().y - this.at().y) + Math.abs(player.at().x - this.at().x);

      if (distance > 6) {
        // console.log("distant monster did not seek player");
      } else {
        console.log("monster seeks player");
        var goNorth = (player.at().y < this.at().y);
        var goSouth = (player.at().y > this.at().y);
        var goEast = (player.at().x > this.at().x);
        var goWest = (player.at().x < this.at().x);

        this._movement = {x: 0, y: 0};

        if (goNorth) { this._movement.y = -Game.map_grid.tile.height ; }
        else if (goSouth) { this._movement.y = Game.map_grid.tile.height; }

        if (goEast) { this._movement.x = Game.map_grid.tile.width; }
        else if (goWest) { this._movement.x = -Game.map_grid.tile.width; }

        if ((player.at().x == this.at().x) && (player.at().y == this.at().y)) {
          this.attackPlayerCharacter([{obj: player}])
        }

        this.x += this._movement.x;
        this.y += this._movement.y;
        this.trigger('Moved');        
      }
    });
  },

  // Attacks the monster
  attackMonster: function(data) {
    var monster = data[0].obj;
    var damage = this.computeDamage();
    this.log("You " + monster.hitVerb() + " the " + monster.name() + " for " + damage + " points");
    monster.sufferDamage(damage);
  },

  // Stops the movement
  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
    console.log("STOP MOVEMENT player " + this.x + ", " + this.y);
  },

  // Respond to this player visiting a chest
  visitChest: function(data) {
    chest = data[0].obj;
    this._gold = this._gold + chest._gold;
    this.log("You opened the chest and got " + chest._gold + " gold pieces");
    document.getElementById('gold').innerHTML = this._gold;
    chest.collect();
    this.log(Crafty('Chest').length + " chests left");
  },

  // Respond to this player visiting a chest
  visitCastle: function(data) {
    this.log("You visit the castle");
  }  

});


