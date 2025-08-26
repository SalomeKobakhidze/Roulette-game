// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('game-container');
const jumpSound = new Audio('https://www.soundjay.com/buttons/sounds/button-1.mp3');
const winSound = new Audio('https://www.soundjay.com/game/sounds/game-win-2.mp3');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 400;

// Game State Variables
let score = 0;
let lives = 3;
let isGameOver = false;
let currentLevel = 0;

// Player (Felix) properties
const player = {
    x: 50,
    y: canvas.height - 100,
    width: 40,
    height: 60,
    color: '#000000',
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpStrength: 12,
    isJumping: false,
    isInvincible: false
};

// Levels configuration
const levels = [
    {
        // Level 1
        platforms: [
            { x: 0, y: canvas.height - 40, width: canvas.width, height: 40 },
            { x: 150, y: canvas.height - 120, width: 150, height: 20 },
            { x: 400, y: canvas.height - 200, width: 100, height: 20 },
            { x: 650, y: canvas.height - 150, width: 120, height: 20 }
        ],
        enemies: [
            { x: 300, y: canvas.height - 100, width: 30, height: 30, dx: -1 },
            { x: 550, y: canvas.height - 230, width: 30, height: 30, dx: -1 }
        ],
        coins: [
            { x: 200, y: canvas.height - 150, size: 15 },
            { x: 450, y: canvas.height - 230, size: 15 },
            { x: 700, y: canvas.height - 180, size: 15 }
        ]
    },
    {
        // Level 2 (More enemies and platforms)
        platforms: [
            { x: 0, y: canvas.height - 40, width: canvas.width, height: 40 },
            { x: 100, y: canvas.height - 100, width: 100, height: 20 },
            { x: 300, y: canvas.height - 180, width: 150, height: 20 },
            { x: 550, y: canvas.height - 100, width: 150, height: 20 },
            { x: 700, y: canvas.height - 250, width: 80, height: 20 },
        ],
        enemies: [
            { x: 250, y: canvas.height - 100, width: 30, height: 30, dx: -1 },
            { x: 400, y: canvas.height - 200, width: 30, height: 30, dx: 1 },
            { x: 600, y: canvas.height - 120, width: 30, height: 30, dx: -1 },
        ],
        coins: [
            { x: 150, y: canvas.height - 150, size: 15 },
            { x: 350, y: canvas.height - 210, size: 15 },
            { x: 500, y: canvas.height - 140, size: 15 },
            { x: 720, y: canvas.height - 280, size: 15 }
        ]
    }
];

let platforms = [];
let enemies = [];
let coins = [];

// Function to load a specific level
function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        // All levels completed
        endGame(true); // Win condition
        return;
    }
    
    currentLevel = levelIndex;
    platforms = [];
    enemies = [];
    coins = [];
    
    const levelData = levels[levelIndex];
    
    levelData.platforms.forEach(p => platforms.push({ ...p, color: '#38a169' }));
    levelData.enemies.forEach(e => enemies.push({ ...e, color: '#d32f2f' }));
    levelData.coins.forEach(c => coins.push({ ...c, color: '#ffd700', collected: false }));
    
    // Reset player position
    player.x = 50;
    player.y = canvas.height - 100;
}
window.game = {
    loadNextLevel: function() {
        document.getElementById('win-screen').style.display = 'none';
        loadLevel(currentLevel + 1);
    }
};

// Function to draw objects
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = coin.color;
            ctx.beginPath();
            ctx.arc(coin.x + coin.size / 2, coin.y + coin.size / 2, coin.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function jump() {
    if (!player.isJumping) {
        player.dy = -player.jumpStrength;
        player.isJumping = true;
        jumpSound.play();
    }
}

// Update function for game logic
function update() {
    if (isGameOver) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player
    player.dy += player.gravity;
    player.y += player.dy;
    player.x += player.dx;

    // Boundary checks for the player
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Check for collision with platforms
    let onPlatform = false;
    platforms.forEach(p => {
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y + player.height > p.y &&
            player.y + player.height < p.y + p.height) {
            player.y = p.y - player.height;
            player.dy = 0;
            player.isJumping = false;
            onPlatform = true;
        }
    });

    // If not on any platform and not jumping, fall
    if (!onPlatform) {
        player.isJumping = true;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.isJumping = false;
    }

    // Update enemies
    enemies.forEach(e => {
        e.x += e.dx;
        // Bounce off walls
        if (e.x + e.width > canvas.width || e.x < 0) {
            e.dx *= -1;
        }
    });

    // Collision detection for player and enemies
    enemies.forEach(e => {
        if (!player.isInvincible && 
            player.x < e.x + e.width &&
            player.x + player.width > e.x &&
            player.y < e.y + e.height &&
            player.y + player.height > e.y) {
            
            // Collision detected! Decrease lives
            lives--;
            document.getElementById('lives').textContent = lives;
            
            // Trigger invincibility
            player.isInvincible = true;
            gameContainer.classList.add('player-invincible');
            setTimeout(() => {
                player.isInvincible = false;
                gameContainer.classList.remove('player-invincible');
            }, 2000);
            
            if (lives <= 0) {
                endGame();
            }
        }
    });

    // Collision detection for player and coins
    let allCoinsCollected = true;
    coins.forEach(coin => {
        if (!coin.collected) {
            allCoinsCollected = false;
            if (player.x < coin.x + coin.size &&
                player.x + player.width > coin.x &&
                player.y < coin.y + coin.size &&
                player.y + player.height > coin.y) {
                
                // Coin collected!
                coin.collected = true;
                score++;
                document.getElementById('score').textContent = score;
            }
        }
    });
    
    // Check for level completion
    if (allCoinsCollected && currentLevel < levels.length - 1) { // Check if it's the last level
        winSound.play();
        document.getElementById('win-screen').style.display = 'flex';
    } else if (allCoinsCollected && currentLevel == levels.length - 1) {
        endGame(true);
    }

    // Draw all elements
    drawPlatforms();
    drawEnemies();
    drawCoins();
    drawPlayer();

    // Loop the game
    requestAnimationFrame(update);
}

// Game over function
function endGame(win = false) {
    isGameOver = true;
    document.getElementById('game-over-screen').style.display = 'flex';
    document.getElementById('final-score').textContent = score;
    if (win) {
        document.getElementById('game-over-text').textContent = 'თამაში დასრულებულია! თქვენ მოიგეთ!';
    } else {
        document.getElementById('game-over-text').textContent = 'თამაში დასრულდა';
    }
}

// Event listeners for player controls
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft') {
        player.dx = -5;
    }
    if (e.key === 'ArrowRight') {
        player.dx = 5;
    }
    if (e.key === 'ArrowUp') {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
});

// Handle touch events for mobile devices
let startX = 0;
let startY = 0;
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (isGameOver) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            player.dx = 5;
        } else if (dx < 0) {
            player.dx = -5;
        }
    } else if (dy < -20) {
        jump();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

// Start the game loop
window.onload = function() {
    loadLevel(currentLevel);
    update();
};
