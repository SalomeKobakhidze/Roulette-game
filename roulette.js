// Get the canvas and its context
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const betInput = document.getElementById('betInput');
const betNumberInput = document.getElementById('betNumberInput');
const betTypeRadios = document.querySelectorAll('input[name="betType"]');
const balanceDisplay = document.getElementById('balance');
const resultDisplay = document.getElementById('result');
const resetButton = document.getElementById('resetButton');

// Constants for the game
const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
const arc = Math.PI * 2 / numbers.length;

// Game state variables
let balance = 1000;
let isSpinning = false;
let currentRotation = 0;
let spinVelocity = 0;

// Load balance from local storage or set initial balance
function loadBalance() {
    const savedBalance = localStorage.getItem('rouletteBalance');
    if (savedBalance) {
        balance = parseInt(savedBalance, 10);
    }
    balanceDisplay.textContent = balance;
}

// Save balance to local storage
function saveBalance() {
    localStorage.setItem('rouletteBalance', balance);
    balanceDisplay.textContent = balance;
}

// Function to reset balance
function resetBalance() {
    balance = 1000;
    saveBalance();
    resultDisplay.textContent = 'ბალანსი განულებულია.';
}

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
        
        // Draw the numbers
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Press Start 2P';
        ctx.textAlign = 'right';
        ctx.fillText(numbers[i], radius - 20, 5);
        
        ctx.restore();
    }
    
    // Draw the winning indicator (a triangle)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 10, centerY - radius);
    ctx.lineTo(centerX + 10, centerY - radius);
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.fill();
}

// Function to spin the wheel
function spin() {
    if (isSpinning) return;

    const betAmount = parseInt(betInput.value, 10);
    const betType = document.querySelector('input[name="betType"]:checked').value;
    const betNumber = betType === 'number' ? parseInt(betNumberInput.value, 10) : null;
    
    // Validate bet amount
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        resultDisplay.textContent = 'გთხოვთ, შეიყვანოთ სწორი ფსონი.';
        return;
    }
    
    // Validate number if bet type is 'number'
    if (betType === 'number' && (isNaN(betNumber) || betNumber < 0 || betNumber > 36 || !numbers.includes(betNumber))) {
        resultDisplay.textContent = 'გთხოვთ, შეიყვანოთ სწორი რიცხვი (0-36).';
        return;
    }

    balance -= betAmount;
    saveBalance();
    
    isSpinning = true;
    spinButton.disabled = true;
    spinVelocity = Math.random() * 0.2 + 0.1; // More energetic spin
    
    resultDisplay.textContent = 'ტრიალებს...';

    // Animation loop with smoother deceleration
    const spinLoop = () => {
        if (!isSpinning) return;
        
        spinVelocity *= 0.985;
        
        currentRotation += spinVelocity;
        
        if (spinVelocity < 0.001) {
            isSpinning = false;
            spinButton.disabled = false;
            determineWinner(betType, betAmount, betNumber);
            return;
        }
        
        drawWheel();
        requestAnimationFrame(spinLoop);
    };
    
    spinLoop();
}

// Function to determine the winner
function determineWinner(betType, betAmount, betNumber) {
    const winningIndex = Math.floor((-currentRotation % (2 * Math.PI)) / arc);
    const winningNumber = numbers[winningIndex];
    const winningColor = colors[winningIndex];
    
    resultDisplay.textContent = `გამარჯვებული რიცხვია: ${winningNumber}.`;
    let winnings = 0;
    
    switch (betType) {
        case 'number':
            if (winningNumber === betNumber) {
                winnings = betAmount * 35;
                resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა!`;
            }
            break;
        case 'red':
            if (winningColor === 'red') {
                winnings = betAmount * 2;
                resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა! (წითელზე)`;
            }
            break;
        case 'black':
            if (winningColor === 'black') {
                winnings = betAmount * 2;
                resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა! (შავზე)`;
            }
            break;
        case 'even':
            if (winningNumber !== 0 && winningNumber % 2 === 0) {
                winnings = betAmount * 2;
                resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა! (ლუწზე)`;
            }
            break;
        case 'odd':
            if (winningNumber !== 0 && winningNumber % 2 !== 0) {
                winnings = betAmount * 2;
                resultDisplay.textContent = `გილოცავ! თქვენ მოიგეთ ${winnings} ქულა! (კენტზე)`;
            }
            break;
    }
    
    balance += winnings;
    saveBalance();
}

// Event listeners for the spin button and reset button
spinButton.addEventListener('click', spin);
resetButton.addEventListener('click', resetBalance);

// Event listeners for radio buttons to toggle bet number input
betTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        betNumberInput.disabled = e.target.value !== 'number';
    });
});

// Initial load of the balance and drawing of the wheel
window.onload = function() {
    loadBalance();
    drawWheel();
};
