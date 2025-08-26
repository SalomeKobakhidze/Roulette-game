// Get the canvas and its context
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const betInput = document.getElementById('betInput');
const betNumberInput = document.getElementById('betNumberInput');
const balanceDisplay = document.getElementById('balance');
const resultDisplay = document.getElementById('result');

// Constants for the game
const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
const arc = Math.PI / (numbers.length / 2);

// Game state variables
let balance = 1000;
let isSpinning = false;
let currentRotation = 0;
let spinVelocity = 0;

// Function to draw the roulette wheel
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    for (let i = 0; i < numbers.length; i++) {
        const angle = currentRotation + i * arc;
        const color = colors[i];
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Press Start 2P';
        ctx.textAlign = 'right';
        ctx.fillText(numbers[i], radius - 10, 5);
        
        ctx.restore();
    }
}

// Function to spin the wheel
function spin() {
    if (isSpinning) return;

    const betAmount = parseInt(betInput.value, 10);
    const betNumber = parseInt(betNumberInput.value, 10);
    
    // Validate inputs
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        resultDisplay.textContent = 'გთხოვთ, შეიყვანოთ სწორი ფსონი.';
        return;
    }
    if (isNaN(betNumber) || betNumber < 0 || betNumber > 36 || !numbers.includes(betNumber)) {
        resultDisplay.textContent = 'გთხოვთ, შეიყვანოთ სწორი რიცხვი (0-36).';
        return;
    }
    
    balance -= betAmount;
    balanceDisplay.textContent = balance;
    
    isSpinning = true;
    spinVelocity = Math.random() * 0.1 + 0.05; // Random initial speed
    
    resultDisplay.textContent = 'ტრიალებს...';

    // Animation loop
    const spinLoop = () => {
        if (!isSpinning) return;
        
        // Decrease spin velocity over time
        spinVelocity *= 0.99;
        
        // Update rotation
        currentRotation += spinVelocity;
        
        // Stop when velocity is very low
        if (spinVelocity < 0.001) {
            isSpinning = false;
            determineWinner(betNumber, betAmount);
            return;
        }
        
        drawWheel();
        requestAnimationFrame(spinLoop);
    };
    
    spinLoop();
}

// Function to determine the winner
function determineWinner(betNumber, betAmount) {
    let winningNumber = -1;
    let closestAngle = Infinity;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < numbers.length; i++) {
        const angle = currentRotation + i * arc;
        const diff = Math.abs(angle % (2 * Math.PI));
        
        if (diff < closestAngle) {
            closestAngle = diff;
            winningNumber = numbers[i];
        }
    }
    
    resultDisplay.textContent = `გამარჯვებული რიცხვია: ${winningNumber}.`;
    
    if (winningNumber === betNumber) {
        const winnings = betAmount * 35; // Payout for a single number
        balance += winnings;
        resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა!`;
    }
    
    balanceDisplay.textContent = balance;
}

// Event listener for the spin button
spinButton.addEventListener('click', spin);

// Initial drawing of the wheel
drawWheel();

