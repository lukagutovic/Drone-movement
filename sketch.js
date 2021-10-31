// Function to delete element from the array
function removeFromArray(arr, elt) {
  // Could use indexOf here instead to be more efficient
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

// An educated guess of how far it is between two points
function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j);
  // var d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

// How many columns and rows?
var cols = 15;
var rows = 15;

// This will be the 2D array
var grid = new Array(cols);

// Open and closed set
var openSet = [];
var closedSet = [];

// Start and end
var start;
var end;

// Width and height of each cell of grid
var w, h;

// The road taken
var path = [];

function setup() {
  createCanvas(600, 600);

  // Grid cell size
  w = width / cols;
  h = height / rows;

  // Making a 2D array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j, false);
    }
  }

  // All the neighbors
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // End position
  end = grid[12][8];
  end.wall = false;
}

// Currently the drone stays home
var goHome = false;

// Method linked with button
function kreniUHome() {
  this.goHome = true;
  var trenutnaPozicija =
    grid[putanjaDrona[tackaPutanjeDrona].x][putanjaDrona[tackaPutanjeDrona].y];
  trenutnaPozicija.addNeighbors(grid);
  trenutnaPozicija.wall = false;
  openSet = [];
  this.openSet.push(trenutnaPozicija);
  loop();
}

// Drone coordinates
var putanjaDrona = [
  { x: 12, y: 8 },
  { x: 12, y: 9 },
  { x: 12, y: 10 },
  { x: 11, y: 10 },
  { x: 11, y: 9 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 10, y: 7 },
  { x: 10, y: 6 },
  { x: 9, y: 6 },
  { x: 9, y: 5 },
  { x: 8, y: 5 },
  { x: 7, y: 5 },
  { x: 6, y: 5 },
  { x: 5, y: 5 },
  { x: 4, y: 6 },
  { x: 3, y: 7 },
  { x: 2, y: 8 },
  { x: 2, y: 9 },
  { x: 2, y: 10 },
  { x: 2, y: 11 },
  { x: 3, y: 12 },
  { x: 4, y: 12 },
  { x: 5, y: 12 },
  { x: 6, y: 12 },
  { x: 7, y: 12 },
  { x: 8, y: 12 },
  { x: 9, y: 12 },
  { x: 10, y: 12 },
  { x: 11, y: 12 },
  { x: 11, y: 12 },
  { x: 12, y: 12 },
  { x: 13, y: 12 },
  { x: 13, y: 11 },
  { x: 13, y: 10 },
  { x: 12, y: 9 },
];
var tackaPutanjeDrona = 0;

// Dron position
function pozicionirajDron() {
  if (!goHome) {
    var tackaPutanje = putanjaDrona[tackaPutanjeDrona];
    background("lime");

    for (var i = 0; i < putanjaDrona.length; i++) {
      var xK = putanjaDrona[i].x;
      var yK = putanjaDrona[i].y;
      grid[xK][yK] = new Spot(xK, yK, false);
    }
    grid[tackaPutanje.x][tackaPutanje.y] = new Spot(
      tackaPutanje.x,
      tackaPutanje.y,
      true
    );

    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j].show();
      }
    }
    tackaPutanjeDrona = tackaPutanjeDrona + 1;
    if (tackaPutanjeDrona == putanjaDrona.length) {
      tackaPutanjeDrona = 0;
    }
  }
}

function draw() {
  if (!goHome) {
    noLoop();
    setInterval(pozicionirajDron, 300);
    redraw(1);
  }

  if (goHome) {
    if (openSet.length > 0) {
      // Best next option
      var winner = 0;
      for (var i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }
      var current = openSet[winner];

      // Did I finish?
      if (current === end) {
        noLoop();
        console.log("Gotovo!");
      }

      // Best option moves from openSet to closedSet
      removeFromArray(openSet, current);
      closedSet.push(current);

      // Check all the neighbors
      var neighbors = current.neighbors;
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];

        // Valid next spot?
        if (!closedSet.includes(neighbor) && !neighbor.wall) {
          var tempG = current.g + heuristic(neighbor, current);

          // Is this a better path than before?
          var newPath = false;
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            openSet.push(neighbor);
          }

          // a better path
          if (newPath) {
            neighbor.h = heuristic(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }
      // No solution
    } else {
      console.log("Nema rešenja");
      noLoop();
      return;
    }

    // Draw current state of everything
    background("lime");

    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        grid[i][j].show();
      }
    }

    for (var i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color("green"));
    }

    for (var i = 0; i < openSet.length; i++) {
      openSet[i].show(color("lightgreen"));
    }

    // Find the path by working backwards
    path = [];
    var temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }

    // Drawing path as continuous line
    noFill();
    stroke(11, 23, 255);
    strokeWeight(w / 4);
    beginShape();
    for (var i = 0; i < path.length; i++) {
      vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
    }
    endShape();
    nadjiSafeTacke(path);
  }
}

function nadjiSafeTacke(path) {
  putanja = [];
  // punjenje niza sa objektom koji sadrzi tacke
  for (var i = 0; i < path.length; i++) {
    var indexPair = {
      x: path[i].i,
      y: path[i].j,
      safe: false,
      xkretanje: " ",
      ykretanje: " ",
    };
    putanja.push(indexPair);
  }
  // zakljucivanje kako se menjala putanja koordinata (x,u) i = ista, p = povecala , s = smanjila
  for (var i = 0; i < path.length - 1; i++) {
    if (putanja[i + 1].x == putanja[i].x) {
      putanja[i + 1].xkretanje = "i";
    }
    if (putanja[i + 1].x > putanja[i].x) {
      putanja[i + 1].xkretanje = "p";
    }
    if (putanja[i + 1].x < putanja[i].x) {
      putanja[i + 1].xkretanje = "s";
    }

    if (putanja[i + 1].y == putanja[i].y) {
      putanja[i + 1].ykretanje = "i";
    }
    if (putanja[i + 1].y > putanja[i].y) {
      putanja[i + 1].ykretanje = "p";
    }
    if (putanja[i + 1].y < putanja[i].y) {
      putanja[i + 1].ykretanje = "s";
    }
  }

  for (var i = 1; i < path.length - 1; i++) {
    if (
      !(
        putanja[i].xkretanje === putanja[i + 1].xkretanje &&
        putanja[i].ykretanje === putanja[i + 1].ykretanje
      )
    ) {
      putanja[i].safe = true;
    }
  }
  // ovde dobijamo krajnju putanju iz koje zakljucujemo koje su safe tacke
  console.log(putanja);
}
