// Get all necessary DOM elements
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const betInput = document.getElementById('betInput');
const betNumberInput = document.getElementById('betNumberInput');
const balanceDisplay = document.getElementById('balance');
const resultDisplay = document.getElementById('result');
const resetButton = document.getElementById('resetButton');

// Roulette wheel data
const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const colors = {
    red: [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 28, 12],
    black: [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 26, 35, 3],
    green: [0]
};

// Game state
let isSpinning = false;
let rotation = 0;
let targetRotation = 0;
let spinSpeed = 0;
let balance = localStorage.getItem('rouletteBalance') ? parseInt(localStorage.getItem('rouletteBalance')) : 1000;
let betAmount = 0;
let betType = 'number';
let betNumber = 0;
let winningNumber = null;

// Drawing functions
function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2;
    const arc = (2 * Math.PI) / numbers.length;

    numbers.forEach((number, index) => {
        const angle = (index * arc) + rotation;
        
        ctx.beginPath();
        ctx.arc(center, center, radius, angle, angle + arc);
        ctx.lineTo(center, center);
        ctx.fillStyle = getNumberColor(number);
        ctx.fill();

        // Draw number
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arc / 2);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(number, radius - 15, 0);
        ctx.restore();
    });

    // Draw the pin
    ctx.beginPath();
    ctx.moveTo(center, 10);
    ctx.lineTo(center - 10, 0);
    ctx.lineTo(center + 10, 0);
    ctx.fillStyle = 'white';
    ctx.fill();
}

function getNumberColor(number) {
    if (colors.red.includes(number)) return 'red';
    if (colors.black.includes(number)) return 'black';
    return 'green';
}

function update() {
    if (isSpinning) {
        rotation += spinSpeed;
        spinSpeed *= 0.99; // Damping effect
        
        // Stop spinning when close to target
        if (spinSpeed < 0.005) {
            isSpinning = false;
            spinSpeed = 0;
            checkResult();
            spinButton.disabled = false;
        }
    }
    drawWheel();
    requestAnimationFrame(update);
}

function checkResult() {
    const totalRotation = rotation % (2 * Math.PI);
    const normalizedRotation = (2 * Math.PI - totalRotation) % (2 * Math.PI);
    const arc = (2 * Math.PI) / numbers.length;
    const winningIndex = Math.floor(normalizedRotation / arc);

    winningNumber = numbers[winningIndex];

    // Check if the winning number matches the bet
    let isWinner = false;
    if (betType === 'number' && betNumber === winningNumber) {
        balance += betAmount * 35; // 35:1 payout
        isWinner = true;
    } else if (betType === 'red' && colors.red.includes(winningNumber)) {
        balance += betAmount * 2; // 2:1 payout
        isWinner = true;
    } else if (betType === 'black' && colors.black.includes(winningNumber)) {
        balance += betAmount * 2;
        isWinner = true;
    } else if (betType === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) {
        balance += betAmount * 2;
        isWinner = true;
    } else if (betType === 'odd' && winningNumber !== 0 && winningNumber % 2 !== 0) {
        balance += betAmount * 2;
        isWinner = true;
    } else {
        balance -= betAmount;
    }

    // Update the UI
    balanceDisplay.textContent = balance;
    if (isWinner) {
        resultDisplay.textContent = `გილოცავ! გამარჯვებული რიცხვია: ${winningNumber}.`;
        resultDisplay.style.color = '#48bb78';
    } else {
        resultDisplay.textContent = `სამწუხაროდ, წააგეთ. გამარჯვებული რიცხვია: ${winningNumber}.`;
        resultDisplay.style.color = '#f56565';
    }

    // Save the balance
    localStorage.setItem('rouletteBalance', balance);
}

// Event listeners
spinButton.addEventListener('click', () => {
    if (isSpinning) return;

    betAmount = parseInt(betInput.value);
    betType = document.querySelector('input[name="betType"]:checked').value;
    betNumber = parseInt(betNumberInput.value);

    // Validate bet
    if (betAmount <= 0 || betAmount > balance) {
        resultDisplay.textContent = 'არასწორი ფსონი! გთხოვთ, შეცვალოთ.';
        resultDisplay.style.color = '#ecc94b';
        return;
    }

    // Disable the button while spinning
    spinButton.disabled = true;
    isSpinning = true;
    spinSpeed = Math.random() * 0.1 + 0.05; // Random spin speed
    resultDisplay.textContent = 'ვტრიალებთ...';
    resultDisplay.style.color = '#a0aec0';
});

resetButton.addEventListener('click', () => {
    balance = 1000;
    balanceDisplay.textContent = balance;
    localStorage.setItem('rouletteBalance', balance);
    resultDisplay.textContent = '';
});

// Update the balance display on load
document.addEventListener('DOMContentLoaded', () => {
    balanceDisplay.textContent = balance;
    // Set initial canvas size
    canvas.width = 400;
    canvas.height = 400;
    update();
});

