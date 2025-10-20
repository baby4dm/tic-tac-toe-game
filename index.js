const daggerButton = document.querySelector(".dagger-button");
const circleButton = document.querySelector(".circle-button");
const switchContainer = document.querySelector(".switch");
const cpuButton = document.querySelector(".cpu-button");
const playerButton = document.querySelector(".player-button");
const startScreen = document.querySelector(".start-screen");
const gameScreen = document.querySelector(".game-screen");
const cells = document.querySelectorAll(".cell");
const sideIcon = document.querySelector(".side-icon");
const overlay = document.querySelector(".overlay");
const resultSection = document.querySelector(".result-section");
const quitBtn = document.querySelector(".quit-btn");
const nextRoundBtn = document.querySelector(".restart-game-btn");
const restartBtn = document.querySelector(".restart-btn");
const confirmSection = document.querySelector(".confirm-section");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".yes-btn");

let playerMark = "O";
let board = Array(9).fill(null);
let currentPlayer = "X";
let vsCPU = false;
let isCpuThinking = false;
let youWins = Number(localStorage.getItem("youWins")) || 0;
let cpuWins = Number(localStorage.getItem("cpuWins")) || 0;
let ties = Number(localStorage.getItem("ties")) || 0;

updateHistoryUI();

function startGame() {
  board.fill(null);
  cells.forEach((cell, i) => {
    cell.innerHTML = "";
    cell.addEventListener("click", () => handleMove(i), { once: true });
  });

  currentPlayer = "X";
  updateTurnContainer(currentPlayer);

  if (vsCPU && playerMark === "O") {
    cpuTurn();
  }
}

function handleMove(index) {
  if (board[index] || isCpuThinking) return;
  makeMove(index, currentPlayer);

  const winnerCombo = checkWinner(board, currentPlayer);
  if (winnerCombo) {
    highlightWinner(winnerCombo, currentPlayer);
    endGame(currentPlayer);
    return;
  }

  if (board.every((cell) => cell)) {
    endGame();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnContainer(currentPlayer);

  if (vsCPU && currentPlayer !== playerMark) {
    cpuTurn();
  }
}

function updateTurnContainer(turn) {
  if (turn === "X") {
    sideIcon.innerHTML = getXSVG();
  } else {
    sideIcon.innerHTML = getOSVG();
  }
}
function highlightWinner(combo, player) {
  const bgColor = player === "X" ? "#31C3BD" : "#F2B137";
  const pathColor = "#1A2A33";

  combo.forEach((index) => {
    const cell = cells[index];
    cell.style.backgroundColor = bgColor;

    const path = cell.querySelector("path");
    if (path) {
      path.setAttribute("fill", pathColor);
    }
  });
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].innerHTML = player === "X" ? getXSVG() : getOSVG();

  const cell = cells[index];
  const clone = cell.cloneNode(true);
  cell.parentNode.replaceChild(clone, cell);
}

function cpuTurn() {
  const cpuMark = playerMark === "X" ? "O" : "X";
  updateTurnContainer(cpuMark);
  isCpuThinking = true;
  disableCells();

  setTimeout(() => {
    let move = findWinningMove(cpuMark);
    if (move === null) move = findWinningMove(playerMark);
    if (move === null && !board[4]) move = 4;
    if (move === null) {
      const corners = [0, 2, 6, 8].filter((i) => !board[i]);
      if (corners.length > 0)
        move = corners[Math.floor(Math.random() * corners.length)];
    }
    if (move === null) {
      const empties = board
        .map((v, i) => (!v ? i : null))
        .filter((v) => v !== null);
      move = empties[Math.floor(Math.random() * empties.length)];
    }

    makeMove(move, cpuMark);
    isCpuThinking = false;
    enableCells();

    const winnerCombo = checkWinner(board, cpuMark);
    if (winnerCombo) {
      highlightWinner(winnerCombo, cpuMark);
      endGame(cpuMark);
      return;
    }

    if (board.every((cell) => cell)) {
      endGame();
      return;
    }

    currentPlayer = playerMark;
    updateTurnContainer(currentPlayer);
  }, 1000);
}

function disableCells() {
  cells.forEach((cell, i) => {
    if (!board[i]) cell.classList.add("disabled");
  });
}

function enableCells() {
  cells.forEach((cell, i) => {
    if (!board[i]) cell.classList.remove("disabled");
  });
}

function findWinningMove(player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const line = [board[a], board[b], board[c]];
    if (line.filter((v) => v === player).length === 2 && line.includes(null)) {
      return pattern[line.indexOf(null)];
    }
  }
  return null;
}

function checkWinner(board, player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const pattern of winPatterns) {
    if (pattern.every((index) => board[index] === player)) {
      return pattern;
    }
  }
  return null;
}

function endGame(winner) {
  overlay.classList.remove("hidden");
  resultSection.classList.remove("hidden");

  const subtitle = resultSection.querySelector(".subtitle");
  const winnerIcon = resultSection.querySelector(".winner-side-icon");
  const title = resultSection.querySelector("h2");

  if (winner === "X" || winner === "O") {
    winnerIcon.innerHTML = winner === "X" ? getXSVG() : getOSVG();
    title.textContent = "TAKES THE ROUND";
    title.style.color = winner === "X" ? "#31C3BD" : "#F2B137";

    if (vsCPU) {
      if (winner === playerMark) {
        subtitle.textContent = "YOU WON!";
        youWins++;
        localStorage.setItem("youWins", youWins);
      } else {
        subtitle.textContent = "OH NO, YOU LOST…";
        cpuWins++;
        localStorage.setItem("cpuWins", cpuWins);
      }
    } else {
      subtitle.textContent =
        winner === "X" ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!";
    }

    subtitle.classList.remove("hidden");
  } else {
    winnerIcon.innerHTML = "";
    title.textContent = "ROUND TIED";
    title.style.color = "#A8BFC9";
    subtitle.classList.add("hidden");

    if (vsCPU) {
      ties++;
      localStorage.setItem("ties", ties);
    }
  }

  updateHistoryUI();
}

function updateHistoryUI() {
  document.querySelector(".you-win-number").textContent = youWins;
  document.querySelector(".ties-number").textContent = ties;
  document.querySelector(".cpu-win-number").textContent = cpuWins;
}

daggerButton.addEventListener("click", () => {
  daggerButton.classList.add("active");
  circleButton.classList.remove("active");
  switchContainer.classList.remove("circle-active");
  playerMark = "X";
});

circleButton.addEventListener("click", () => {
  circleButton.classList.add("active");
  daggerButton.classList.remove("active");
  switchContainer.classList.add("circle-active");
  playerMark = "O";
});

cpuButton.addEventListener("click", () => {
  vsCPU = true;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

playerButton.addEventListener("click", () => {
  vsCPU = false;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

quitBtn.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  overlay.classList.add("hidden");

  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  board.fill(null);
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("disabled");
    cell.style.backgroundColor = "#1f3641";
  });
});

nextRoundBtn.addEventListener("click", resetBoard);

restartBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  confirmSection.classList.remove("hidden");
});

noBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  confirmSection.classList.add("hidden");
});

yesBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  confirmSection.classList.add("hidden");
  resetBoard();
});

function resetBoard() {
  resultSection.classList.add("hidden");
  overlay.classList.add("hidden");

  board.fill(null);
  cells.forEach((cell, i) => {
    cell.innerHTML = "";
    cell.classList.remove("disabled");
    cell.style.backgroundColor = "#1f3641";
    cell.addEventListener("click", () => handleMove(i), { once: true });
  });

  currentPlayer = "X";
  updateTurnContainer(currentPlayer);

  if (vsCPU && playerMark === "O") {
    cpuTurn();
  }
}

cells.forEach((cell, i) => {
  cell.addEventListener("mouseenter", () => {
    if (board[i] || isCpuThinking || cell.classList.contains("disabled"))
      return;
    const hoverMark = vsCPU ? playerMark : currentPlayer;

    cell.classList.add(hoverMark === "X" ? "x-hover" : "o-hover");
    cell.innerHTML = hoverMark === "X" ? getXSVGOutline() : getOSVGOutline();
  });

  cell.addEventListener("mouseleave", () => {
    if (board[i]) return;
    cell.classList.remove("x-hover", "o-hover");
    cell.innerHTML = "";
  });

  cell.addEventListener("click", () => {
    cell.classList.remove("x-hover", "o-hover");
    cell.innerHTML = "";
  });
});
function getXSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
      <path
        d="M15.002 1.147 32 18.145 48.998 1.147a3 3 0 0 1 4.243 0l9.612 9.612a3 3 0 0 1 0 4.243L45.855 32l16.998 16.998a3 3 0 0 1 0 4.243l-9.612 9.612a3 3 0 0 1-4.243 0L32 45.855 15.002 62.853a3 3 0 0 1-4.243 0L1.147 53.24a3 3 0 0 1 0-4.243L18.145 32 1.147 15.002a3 3 0 0 1 0-4.243l9.612-9.612a3 3 0 0 1 4.243 0Z"
        fill="#31C3BD"
        fill-rule="evenodd"
      />
    </svg>
  `;
}

function getOSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
      <path
        d="M32 0c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C14.327 64 0 49.673 0 32 0 14.327 14.327 0 32 0Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z"
        fill="#F2B137"
        fill-rule="evenodd"
      />
    </svg>
  `;
}

function getXSVGOutline() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 68 68" width="64" height="64">
    <path
      d="M51.12 1.269c.511 0 1.023.195 1.414.586l9.611 9.611c.391.391.586.903.586 1.415s-.195 1.023-.586 1.414L44.441 32l17.704 17.705c.391.39.586.902.586 1.414 0 .512-.195 1.024-.586 1.415l-9.611 9.611c-.391.391-.903.586-1.415.586a1.994 1.994 0 0 1-1.414-.586L32 44.441 14.295 62.145c-.39.391-.902.586-1.414.586a1.994 1.994 0 0 1-1.415-.586l-9.611-9.611a1.994 1.994 0 0 1-.586-1.415c0-.512.195-1.023.586-1.414L19.559 32 1.855 14.295a1.994 1.994 0 0 1-.586-1.414c0-.512.195-1.024.586-1.415l9.611-9.611c.391-.391.903-.586 1.415-.586s1.023.195 1.414.586L32 19.559 49.705 1.855c.39-.391.902-.586 1.414-.586Z"
      stroke="#31C3BD"
      stroke-width="2"
      fill="none"
    />
  </svg>
  `;
}

function getOSVGOutline() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 68 68" width="64" height="64">
    <path 
      d="M33 1c17.673 0 32 14.327 32 32 0 17.673-14.327 32-32 32C15.327 65 1 50.673 1 33 1 15.327 15.327 1 33 1Zm0 18.963c-7.2 0-13.037 5.837-13.037 13.037 0 7.2 5.837 13.037 13.037 13.037 7.2 0 13.037-5.837 13.037-13.037 0-7.2-5.837-13.037-13.037-13.037Z"
      stroke="#F2B137"
      stroke-width="2"
      fill="none"
    />
  </svg>
  `;
}
