$(document).ready(function() {
  document.oncontextmenu = function() {return false;};
  let gridWidth, gridHeight, mineCount, startTime;
  let myModal = new bootstrap.Modal(("#mymodal"), {});
  
  // choose difficulty

  $("#play").on("click", () => {

    let difficulty = $("#difficulty").val();
      if (difficulty == "Please Select Difficulty"){
        myModal.show();
        $("#alertheading").text(difficulty);    
      } else if (difficulty == "8x8") {
      gridWidth = 8;
      gridHeight = 8;
      mineCount = 10;
    } else if (difficulty == "16x16") {
      gridWidth = 16;
      gridHeight = 16;
      mineCount = 40;
    }
    window.grid = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(false));
    window.revealed = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(false));
    window.flagged = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(false));
    $("#minescount").text("Minescount: " + mineCount);
    window.remainingCells = gridWidth * gridHeight - mineCount;
    startGame();
    $("#difficulty-section").hide();
  });

  //initializing game

  function startGame() {
    startTime = new Date(); 
    for (let i = 0; i < mineCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridWidth);
        y = Math.floor(Math.random() * gridHeight);
      } while (grid[y][x]);
      grid[y][x] = true;
    }
  
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (gridHeight == "8") {
          $('.minesweeper-grid8').append(`<div class="cell" data-x="${x}" data-y="${y}"></div>`);
        } else if (gridHeight == "16") {
          $('.minesweeper-grid16').append(`<div class="cell" data-x="${x}" data-y="${y}"></div>`);
        }
      }
    }
  };

  //click events

  $('#minesweeperboard').on("mousedown", ".cell", function(event) {
    event.preventDefault();
    const x = parseInt($(this).attr('data-x'));
    const y = parseInt($(this).attr('data-y'));
    
    if (event.button === 0) {
      if (!flagged[y][x] && !revealed[y][x]) {
        revealCell(x, y);
      }
    } else if (event.button === 2) {
      toggleFlag(x, y);
      return false; 

    }
  });

  //calculating time for score

  function calculateTotalTime() {
    const endTime = new Date();
    const totalTimeInSeconds = (endTime - startTime) / 1000;
    return totalTimeInSeconds.toFixed(2);
  }

  // playagain function

    $("#playagain").on("click", function playAgain() {
      location.reload(true);
    })

    //revealcell function

  function revealCell(x, y) {
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight || revealed[y][x]) {
      return;
    }

    revealed[y][x] = true;
    remainingCells--;

    if (grid[y][x]) {
      revealMines(function(){
        myModal.show();
        $("#alertheading").text("GameOver!");
      });
    } else if (remainingCells === 0) {
      revealMines(function(){
        const totaltime = calculateTotalTime(); 
        myModal.show();
        $("#alertheading").text("You Won!");
        $("#score").text("Score: " + totaltime + " seconds")
      });    
    } else {
      const mineCount = countAdjacentMines(x, y);
      $(`.cell[data-x=${x}][data-y=${y}]`).addClass('revealed').text(mineCount);
      if (mineCount === 0) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            revealCell(x + dx, y + dy);
          }
        }
      }
    }
  };

  //flags function

  function toggleFlag(x, y) {
    if (!revealed[y][x]) {
      flagged[y][x] = !flagged[y][x];
      $(`.cell[data-x=${x}][data-y=${y}]`).toggleClass('flagged');
      const flaggedCount = countFlaggedCells();
      $("#flagcounts").text("Number of flagged cells: " + flaggedCount)
    }
  };
  
  //count flags 

  function countFlaggedCells() {
    let count = 0;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (flagged[y][x]) {
          count++;
        }
      }
    }
    return count;
  }


  // count resident mines
  function countAdjacentMines(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (x + dx >= 0 && x + dx < gridWidth && y + dy >= 0 && y + dy < gridHeight) {
          if (grid[y + dy][x + dx]) {
            count++;
          }
        }
      }
    }
    return count;
  };

  //revealmines on gameover

  function revealMines(callback) {
    let revealedmines = 0;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (grid[y][x]) {
          $(`.cell[data-x=${x}][data-y=${y}]`).addClass('mined');
          revealedmines++;
        }
      }
    }
    if (revealedmines == mineCount) {
      callback()
    }
    

};
});