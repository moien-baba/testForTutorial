// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let playerScore = 0;
let computerScore = 0;
let isPaused = true;

// Player paddle
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer paddle
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize
};

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        isPaused = !isPaused;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update game state
function update() {
    if (isPaused) return;

    // Player paddle control with mouse
    playerPaddle.y = mouseY - playerPaddle.height / 2;

    // Player paddle control with arrow keys
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.speed;
    }

    // Keep player paddle in bounds
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y > canvas.height - playerPaddle.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }

    // Computer AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Keep computer paddle in bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y > canvas.height - computerPaddle.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy = hitPos * 5;
        // Increase ball speed slightly
        ball.dx *= 1.05;
    }

    if (
        ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.size;
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy = hitPos * 5;
        // Increase ball speed slightly
        ball.dx *= 1.05;
    }

    // Ball out of bounds - scoring
    if (ball.x < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 2 - 1) * 5;
    isPaused = true;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawDottedLine() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPauseText() {
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press SPACE to continue', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000000');

    // Draw dotted center line
    drawDottedLine();

    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ffff');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff64ff');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.size, '#ffff00');

    // Draw pause text if paused
    drawPauseText();
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start
updateScore();
gameLoop();
