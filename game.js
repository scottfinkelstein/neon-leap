// Game configuration
const config = {
    width: 600,
    height: 800,
    gravity: 0.5,
    jumpForce: -15,
    platformSpeed: 3,
    platformGap: 80,
    playerSize: 40,
    platformWidth: 100,
    platformHeight: 20,
};

// Game state
let canvas, ctx;
let player, platforms, score, highScore, gameRunning, scrollSpeed;
let keys = {};

// Vaporwave colors
const colors = {
    player: '#ff00ff',
    playerGlow: '#ff00ff',
    platforms: ['#ff00ff', '#00ffff', '#ffff00', '#ff1493'],
    bg: '#0a0015',
    grid: 'rgba(0, 255, 255, 0.1)',
};

// Player object
class Player {
    constructor() {
        this.width = config.playerSize;
        this.height = config.playerSize;
        this.x = config.width / 2 - this.width / 2;
        this.y = config.height - 200;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 7;
        this.trail = []; // Array to store trail positions
        this.maxTrailLength = 12; // Maximum number of trail segments
    }

    update() {
        // Store previous position for trail (only when moving up)
        if (this.velocityY < 0) {
            this.trail.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                time: Date.now()
            });
            
            // Remove old trail segments
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        } else {
            // Fade out trail when not jumping up
            this.trail = this.trail.filter(segment => Date.now() - segment.time < 300);
        }

        // Horizontal movement
        if (keys['ArrowLeft']) {
            this.velocityX = -this.speed;
        } else if (keys['ArrowRight']) {
            this.velocityX = this.speed;
        } else {
            this.velocityX *= 0.8;
        }

        this.x += this.velocityX;

        // Screen wrapping
        if (this.x + this.width < 0) {
            this.x = config.width;
        } else if (this.x > config.width) {
            this.x = -this.width;
        }

        // Vertical movement
        this.velocityY += config.gravity;
        this.y += this.velocityY;

        // Scroll screen when player is in upper half
        if (this.y < config.height / 2 && this.velocityY < 0) {
            this.y = config.height / 2;
            scrollSpeed = -this.velocityY;
            
            // Update trail positions when scrolling
            this.trail.forEach(segment => {
                segment.y += scrollSpeed;
            });
        } else {
            scrollSpeed = 0;
        }
    }

    jump() {
        this.velocityY = config.jumpForce;
    }

    draw() {
        // Draw trail first (behind player)
        this.drawTrail();
        
        ctx.save();
        
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.playerGlow;
        
        // Draw player as a triangle
        ctx.fillStyle = colors.player;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Inner triangle for detail
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }

    drawTrail() {
        if (this.trail.length < 2) return;
        
        ctx.save();
        
        // Draw trail segments
        for (let i = 0; i < this.trail.length - 1; i++) {
            const segment = this.trail[i];
            const nextSegment = this.trail[i + 1];
            const age = Date.now() - segment.time;
            const maxAge = 300; // milliseconds
            
            // Calculate fade based on age and position in trail
            const ageFade = Math.max(0, 1 - age / maxAge);
            const positionFade = (i + 1) / this.trail.length;
            const alpha = ageFade * positionFade * 0.8;
            
            if (alpha <= 0) continue;
            
            // Calculate size based on position in trail
            const size = (this.width * 0.8) * positionFade;
            
            // Draw glowing trail segment
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors.player;
            ctx.shadowBlur = 15 * alpha;
            ctx.shadowColor = colors.playerGlow;
            
            // Draw as small triangle
            const halfSize = size / 2;
            ctx.beginPath();
            ctx.moveTo(segment.x, segment.y - halfSize);
            ctx.lineTo(segment.x - halfSize, segment.y + halfSize);
            ctx.lineTo(segment.x + halfSize, segment.y + halfSize);
            ctx.closePath();
            ctx.fill();
            
            // Connect trail segments with lines
            if (i > 0) {
                ctx.shadowBlur = 5 * alpha;
                ctx.strokeStyle = colors.player;
                ctx.lineWidth = 3 * positionFade;
                ctx.beginPath();
                ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
                ctx.lineTo(segment.x, segment.y);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}

// Platform object
class Platform {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.width = config.platformWidth;
        this.height = config.platformHeight;
        this.color = color || colors.platforms[Math.floor(Math.random() * colors.platforms.length)];
    }

    update() {
        this.y += scrollSpeed;
    }

    draw() {
        ctx.save();
        
        // Platform glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Main platform
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Scan line effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.stroke();
        
        ctx.restore();
    }

    collidesWith(player) {
        return (
            player.velocityY > 0 &&
            player.x + player.width > this.x &&
            player.x < this.x + this.width &&
            player.y + player.height > this.y &&
            player.y + player.height < this.y + this.height + player.velocityY
        );
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = config.width;
    canvas.height = config.height;
    
    highScore = localStorage.getItem('vaporjump-highscore') || 0;
    updateHighScore();
    
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', showGame);
    document.getElementById('instructionsBtn').addEventListener('click', showInstructions);
    document.getElementById('backBtn').addEventListener('click', hideInstructions);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

// Screen navigation
function showGame() {
    document.getElementById('menu').classList.remove('active');
    document.getElementById('game').classList.add('active');
    startGame();
}

function showMenu() {
    document.getElementById('game').classList.remove('active');
    document.getElementById('menu').classList.add('active');
    gameRunning = false;
}

function showInstructions() {
    document.getElementById('instructions').classList.remove('hidden');
    document.querySelector('.menu-buttons').style.display = 'none';
}

function hideInstructions() {
    document.getElementById('instructions').classList.add('hidden');
    document.querySelector('.menu-buttons').style.display = 'flex';
}

// Start game
function startGame() {
    player = new Player();
    platforms = [];
    score = 0;
    scrollSpeed = 0;
    gameRunning = true;
    
    // Create initial platforms
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (config.width - config.platformWidth);
        const y = config.height - (i * config.platformGap) - 100;
        platforms.push(new Platform(x, y));
    }
    
    // Starting platform
    platforms.push(new Platform(config.width / 2 - config.platformWidth / 2, config.height - 50));
    
    document.getElementById('gameOver').classList.add('hidden');
    updateScore();
    gameLoop();
}

// Restart game
function restartGame() {
    startGame();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    player.update();
    
    // Update platforms
    platforms.forEach(platform => platform.update());
    
    // Check platform collisions
    platforms.forEach(platform => {
        if (platform.collidesWith(player)) {
            player.jump();
        }
    });
    
    // Remove off-screen platforms and add new ones
    platforms = platforms.filter(platform => platform.y < config.height + 50);
    
    while (platforms.length < 12) {
        const x = Math.random() * (config.width - config.platformWidth);
        const y = platforms[0].y - config.platformGap;
        platforms.unshift(new Platform(x, y));
    }
    
    // Update score
    if (scrollSpeed > 0) {
        score += Math.floor(scrollSpeed);
        updateScore();
        
        if (score > highScore) {
            highScore = score;
            updateHighScore();
            localStorage.setItem('vaporjump-highscore', highScore);
        }
    }
    
    // Check game over
    if (player.y > config.height) {
        gameOver();
    }
}

// Draw game
function draw() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, config.height);
    gradient.addColorStop(0, '#0a0015');
    gradient.addColorStop(0.5, '#1a0033');
    gradient.addColorStop(1, '#2d0052');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < config.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, config.height);
        ctx.stroke();
    }
    
    for (let i = 0; i < config.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(config.width, i);
        ctx.stroke();
    }
    
    // Draw platforms
    platforms.forEach(platform => platform.draw());
    
    // Draw player
    player.draw();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update high score display
function updateHighScore() {
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('menuHighScore').textContent = highScore;
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Initialize when page loads
window.addEventListener('load', init);
