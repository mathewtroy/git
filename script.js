//  JavaScript Snake
const board = document.getElementById('game-board');
const instructionText = document.getElementById('instruction');
const logo = document.getElementById('logo');
const score = document.getElementById('score');
const highScoreText = document.getElementById('highScore');
const eatingSound = new Audio('static/sounds/lunch.wav');
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let highScore = 0;
let direction = 'right';
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;
let isPaused = false;

document.getElementById('up-btn').addEventListener('click', function() { changeDirection('up'); });
document.getElementById('down-btn').addEventListener('click', function() { changeDirection('down'); });
document.getElementById('left-btn').addEventListener('click', function() { changeDirection('left'); });
document.getElementById('right-btn').addEventListener('click', function() { changeDirection('right'); });
document.getElementById('enter-btn').addEventListener('click', function() {
  if (!gameStarted) {
    startGame();
  }
});
document.getElementById('pause-btn').addEventListener('click', pauseGame);

document.querySelectorAll('button').forEach(button => {
  button.addEventListener('touchstart', () => {
    button.classList.add('hover');
  });
  button.addEventListener('touchend', () => {
    button.classList.remove('hover');
  });
});


/**
 * Changes the direction of the game.
 * 
 * @param {string} newDirection - The new direction to change to.
 */
function changeDirection(newDirection) {
  if (!isOppositeDirection(newDirection, direction) && gameStarted && !isPaused) {
    direction = newDirection;
  }
}

/**
 * Pauses or resumes the game.
 */
function pauseGame() {
  if (gameStarted && !isPaused) {
    clearInterval(gameInterval); 
    isPaused = true;
    instructionText.textContent = 'Paused. Press "Pause" to resume.'; 
    instructionText.style.display = 'block';
  } else if (isPaused) {
    isPaused = false;
    gameInterval = setInterval(gameLoop, gameSpeedDelay);
    instructionText.style.display = 'none';
  }
}

/**
 * Clears the game board and redraws the snake and food.
 * Also updates the current score.
 */
function draw() {
  board.innerHTML = '';
  drawSnake();
  drawFood();
  updateScore();
}

/**
 * Iterates through each segment of the snake and draws it on the board.
 */
function drawSnake() {
  snake.forEach((segment) => {
    const snakeElement = createGameElement('div', 'snake');
    setPosition(snakeElement, segment);
    board.appendChild(snakeElement);
  });
}

/**
 * Creates a new game element (snake segment or food) with the specified tag and class.
 * 
 * @param {string} tag - The HTML tag for the new element (e.g., 'div').
 * @param {string} className - The class name to assign to the new element.
 * @returns {HTMLElement} The newly created game element.
 */
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

/**
 * Sets the CSS grid position of a game element (snake segment or food).
 * 
 * @param {HTMLElement} element - The game element to position.
 * @param {{x: number, y: number}} position - The grid coordinates for the element.
 */
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

/**
 * Draws the food element on the game board if the game has started.
 */
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement('div', 'food');
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

/**
 * Generates a new position for the food on the game board.
 * 
 * @returns {Object} An object with 'x' and 'y' properties representing the new position.
 */
function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1;
  const y = Math.floor(Math.random() * gridSize) + 1;
  return { x, y };
}

/**
 * Moves the snake in the current direction. If the snake eats food, generates new food,
 * plays the eating sound, increases speed, and schedules the next move. If not, removes
 * the last segment to simulate movement.
 */
function move() {
  const head = { ...snake[0] };
  switch (direction) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  // Adds new head based on the current direction
  snake.unshift(head);

  // Check if the snake eats the food
  if (head.x === food.x && head.y === food.y) {
    eatingSound.play();
    food = generateFood();
    increaseSpeed();
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      move();
      checkCollision();
      draw();
    }, gameSpeedDelay);
  } else {
    // Removes the last segment if no food was eaten
    snake.pop();
  }
}

/**
 * Initializes the game start process. Validates player name input, shows the game board, 
 * hides the name input form, and prepares the game for starting.
 */
function startGame() {
  const playerNameInput = document.getElementById('playerName');
  const playerName = playerNameInput.value.trim();
  if (playerName.match(/[A-Za-z0-9]+/)) {
      document.querySelector('.game-board').style.display = 'block';
      document.querySelector('.form-group').style.display = 'none';
      instructionText.style.display = 'none'; 
      logo.style.display = 'none'; 
      gameStarted = true; 
      gameInterval = setInterval(gameLoop, gameSpeedDelay);
      updateScore(true);
  } else {
      alert('Please enter a valid name. Only English letters and numbers allowed.');
  }
}

/**
 * Handles key press events for starting the game, pausing, and resuming, as well as controlling the snake's direction.
 * @param {KeyboardEvent} event - The event object representing the key press.
 */
function handleKeyPress(event) {
    if (event.code === 'Enter' && !gameStarted) {
        if (!isPaused) {
            gameStarted = true;
            instructionText.style.display = 'none';
            logo.style.display = 'none';
            gameInterval = setInterval(gameLoop, gameSpeedDelay);
        } else {
            isPaused = false;
            gameInterval = setInterval(gameLoop, gameSpeedDelay);
        }
    } else if (event.key === 'p' || event.key === 'P') { 
        if (gameStarted && !isPaused) {
            clearInterval(gameInterval); 
            isPaused = true;
            instructionText.textContent = 'Paused. Press "P" to resume.'; 
            instructionText.style.display = 'block';
        } else if (isPaused) {
            isPaused = false;
            gameInterval = setInterval(gameLoop, gameSpeedDelay);
            instructionText.style.display = 'none';
        }
    } else if (gameStarted && !isPaused) {
        const newDirection = getNewDirection(event.key);
        if (!isOppositeDirection(newDirection, direction)) {
            direction = newDirection;
        }
    }
}

/**
 * The main game loop that moves the snake, checks for collisions, and redraws the game.
 */
function gameLoop() {
    move();
    checkCollision();
    draw();
}

/**
 * Determines the new direction of the snake based on the key pressed.
 * @param {string} key - The key pressed by the player.
 * @returns {string} The new direction of the snake.
 */
function getNewDirection(key) {
    switch (key) {
        case 'w': return 'up';
        case 's': return 'down';
        case 'a': return 'left';
        case 'd': return 'right';
        default: return direction; 
    }
}

/**
 * Checks if the new direction is opposite to the current direction.
 * @param {string} newDirection - The new direction intended.
 * @param {string} currentDirection - The current direction of the snake.
 * @returns {boolean} True if the new direction is opposite to the current direction, false otherwise.
 */
function isOppositeDirection(newDirection, currentDirection) {
    return newDirection === 'up' && currentDirection === 'down' ||
           newDirection === 'down' && currentDirection === 'up' ||
           newDirection === 'left' && currentDirection === 'right' ||
           newDirection === 'right' && currentDirection === 'left';
}

document.addEventListener('keydown', handleKeyPress);

/**
 * Increases the speed of the game by decreasing 
 * the gameSpeedDelay based on its current value.
 */
function increaseSpeed() {
  if (gameSpeedDelay > 150) { gameSpeedDelay -= 5; } 
  else if (gameSpeedDelay > 100) { gameSpeedDelay -= 3; } 
  else if (gameSpeedDelay > 50) { gameSpeedDelay -= 2; } 
  else if (gameSpeedDelay > 25) { gameSpeedDelay -= 1; }
}

/**
 * Checks for collisions with the game boundaries or with the snake itself. 
 * Triggers a game reset if a collision is detected.
 */
function checkCollision() {
  const head = snake[0];
  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
      saveGameResult(snake.length - 1);
      resetGame();
  }
  for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
          saveGameResult(snake.length - 1);
          resetGame();
      }
  }   
}

/**
 * Resets the game to its initial state, updating the high score 
 * if necessary and preparing for a new game.
 */
function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = 'right';
  gameSpeedDelay = 200;
  updateScore();
  displayLastThreeResults(); 
}

/**
 * Updates the current score display. If this is the initial score update, 
 * includes the player's name.
 * 
 * @param {boolean} isInitial - Whether this is the initial score update, 
 * including player name.
 */
function updateScore(isInitial = false) {
  const playerNameInput = document.getElementById('playerName');
  const playerName = playerNameInput.value.trim();
  const currentScore = snake.length - 1;
  if (isInitial) {
    score.textContent = `${playerName}: ${currentScore.toString().padStart(3, '0')}`;
  } else {
    score.textContent = `${playerName}: ${currentScore.toString().padStart(3, '0')}`;
  }
}

/**
 * Stops the game by clearing the game interval, marking the game as not started, 
 * and displaying the instruction and logo.
 */
function stopGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  instructionText.style.display = 'block';
  logo.style.display = 'block';
}

/**
 * Updates the high score if the current score is greater than the high score. Displays the high score.
 */
function updateHighScore() {
  const currentScore = snake.length - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.textContent = highScore.toString().padStart(3, '0');
  }
  highScoreText.style.display = 'block';
}

/**
 * Displays the results of the last three games.
 */
function displayLastThreeResults() {
  const gameResults = JSON.parse(localStorage.getItem('gameResults')) || [];   
  const lastThreeResults = gameResults.slice(-3);
  for (let i = 0; i < 3; i++) {
      const resultP = document.getElementById(`lastGame${i + 1}`);
      if (lastThreeResults[i] != null) {
          resultP.textContent = `Last Game ${i + 1}: ${lastThreeResults[i]}`;
      } else {
          resultP.textContent = `Last Game ${i + 1}: 000`;
      }
  }
}

/**
 * Saves the current game's score and ensures that only the results 
 * of the last three games are stored.
 * @param {number} currentScore - The score to be saved.
 */
function saveGameResult(currentScore) {
  let gameResults = JSON.parse(localStorage.getItem('gameResults')) || [];
  gameResults.push(currentScore);
  if (gameResults.length > 3) { gameResults.shift(); }
  localStorage.setItem('gameResults', JSON.stringify(gameResults));
}
  