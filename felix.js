// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const winScreen = document.getElementById('win-screen');

// Game state variables
let score = 0;
let lives = 3;
let level = 1;
let isGameOver = false;
let isInvincible = false;
const playerSize = 25; // Player size
const playerSpeed = 5;
const obstacleSpeed = 2;

// Player object representing Felix
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: playerSize,
    height: playerSize,
    speed: playerSpeed,
    isMovingLeft: false,
    isMovingRight: false,
};

// Obstacle array
let obstacles = [];
let spawnInterval = 1000; // How often obstacles appear (in ms)
let lastSpawnTime = 0;

// Game object to be attached to the window
window.game = {
    loadNextLevel: loadNextLevel
};

// Function to draw the cat (Felix)
function drawCat() {
    // Draw the main body
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw the ears
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + 5, player.y - 10);
    ctx.lineTo(player.x + 10, player.y);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(player.x + player.width, player.y);
    ctx.lineTo(player.x + player.width - 5, player.y - 10);
    ctx.lineTo(player.x + player.width - 10, player.y);
    ctx.fill();
}

// Function to draw the obstacles (falling objects)
function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Function to update the game state
function update() {
    if (isGameOver) return;

    // Move the player based on keyboard input
    if (player.isMovingLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.isMovingRight && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }

    // Move obstacles and check for collisions
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;

        // Check for collision with the player
        if (checkCollision(player, obstacle) && !isInvincible) {
            lives--;
            livesDisplay.textContent = lives;
            isInvincible = true;
            
            // Show player as semi-transparent when hit
            canvas.classList.add('player-invincible');

            setTimeout(() => {
                isInvincible = false;
                canvas.classList.remove('player-invincible');
            }, 2000); // 2 seconds of invincibility
        }

        // Remove obstacles that have fallen off the screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
            scoreDisplay.textContent = score;
        }
    });

    // Spawn new obstacles at a regular interval
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnInterval) {
        obstacles.push({
            x: Math.random() * canvas.width,
            y: 0,
            size: Math.random() * 10 + 5,
            speed: obstacleSpeed * level,
        });
        lastSpawnTime = currentTime;
    }

    // Check for game over
    if (lives <= 0) {
        isGameOver = true;
        gameOverScreen.style.display = 'flex';
        finalScoreDisplay.textContent = score;
    }
    
    // Check for level completion
    if (score >= 20 * level) {
        winScreen.style.display = 'flex';
    }
}

// Function to load the next level
function loadNextLevel() {
    level++;
    winScreen.style.display = 'none';
    score = 0;
    lives = 3;
    isGameOver = false;
    obstacles = [];
    player.x = canvas.width / 2;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    spawnInterval = Math.max(200, 1000 - level * 50); // Increase difficulty
}

// Function to check for collision between two objects
function checkCollision(obj1, obj2) {
    // A simplified collision check for rectangle and circle
    const distX = Math.abs(obj2.x - obj1.x - obj1.width / 2);
    const distY = Math.abs(obj2.y - obj1.y - obj1.height / 2);

    if (distX > (obj1.width / 2 + obj2.size)) { return false; }
    if (distY > (obj1.height / 2 + obj2.size)) { return false; }

    if (distX <= (obj1.width / 2)) { return true; } 
    if (distY <= (obj1.height / 2)) { return true; }

    const dx = distX - obj1.width / 2;
    const dy = distY - obj1.height / 2;
    return (dx * dx + dy * dy <= (obj2.size * obj2.size));
}

// Main game loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    update();

    // Draw everything
    drawCat();
    drawObstacles();

    // Loop the game
    requestAnimationFrame(gameLoop);
}

// Event listeners for player movement
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        player.isMovingLeft = true;
    } else if (e.key === 'ArrowRight') {
        player.isMovingRight = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        player.isMovingLeft = false;
    } else if (e.key === 'ArrowRight') {
        player.isMovingRight = false;
    }
});

// Start the game loop when the window loads
window.onload = function() {
    // Set canvas dimensions
    canvas.width = 400;
    canvas.height = 600;

    gameLoop();
};
