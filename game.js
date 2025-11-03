// Game configuration
const config = {
    width: 800,
    height: 600,
    gravity: 0.5,  // Pulls down (positive Y)
    jumpForce: -15,  // Jump up (negative Y) 
    platformSpeed: 3,
    platformGap: 80,  // Horizontal gap between platforms
    playerSize: 40,
    platformWidth: 20,  // Swapped: narrower for vertical platforms
    platformHeight: 100,  // Swapped: taller for vertical platforms
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
    neonPink: '#ff00ff',
    neonCyan: '#00ffff',
    neonYellow: '#ffff00',
    neonHotPink: '#ff1493',
};

// Mall stores with their neon colors (80s/90s classics) - organized horizontally
const mallStores = [
    // Section 1
    { name: 'TOWER RECORDS', color: '#ff00ff', x: 0, section: 1 },
    { name: 'SAM GOODY', color: '#00ffff', x: 220, section: 1 },
    
    // Section 2  
    { name: 'THE GAP', color: '#ffff00', x: 440, section: 2 },
    { name: 'RADIOSHACK', color: '#ff1493', x: 660, section: 2 },
    
    // Section 3
    { name: 'BABBAGE\'S', color: '#00ffff', x: 880, section: 3 },
    { name: 'MUSIC LAND', color: '#ff00ff', x: 1100, section: 3 },
    
    // Section 4
    { name: 'KB TOYS', color: '#ffff00', x: 1320, section: 4 },
    { name: 'WALDENBOOKS', color: '#ff00ff', x: 1540, section: 4 },
    
    // Section 5
    { name: 'ARCADE', color: '#00ffff', x: 1760, section: 5 },
    { name: 'SEARS', color: '#ff1493', x: 1980, section: 5 },
];

// Mall floors - structural levels (now vertical dividers)
const mallFloors = [
    { level: 1, x: 210 },
    { level: 2, x: 430 },
    { level: 3, x: 650 },
    { level: 4, x: 870 },
    { level: 5, x: 1090 },
    { level: 6, x: 1310 },
    { level: 7, x: 1530 },
    { level: 8, x: 1750 },
    { level: 9, x: 1970 },
];

// Mall features (fountains only)
const mallFeatures = [
    { type: 'fountain', x: 110, y: 450 },
    { type: 'fountain', x: 550, y: 150 },
    { type: 'fountain', x: 770, y: 400 },
    { type: 'fountain', x: 1210, y: 250 },
    { type: 'fountain', x: 1430, y: 500 },
    { type: 'fountain', x: 1870, y: 100 },
];

// Player object
class Player {
    constructor() {
        this.width = config.playerSize;
        this.height = config.playerSize;
        this.x = 200;  // Start from left
        this.y = config.height / 2 - this.height / 2;
        this.velocityX = 5;  // Constant rightward movement
        this.velocityY = 0;
        this.speed = 7;
        this.trail = []; // Array to store trail positions
        this.maxTrailLength = 12; // Maximum number of trail segments
    }

    update() {
        // Store previous position for trail (only when moving right)
        if (this.velocityX > 0) {
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
            // Fade out trail when not moving right
            this.trail = this.trail.filter(segment => Date.now() - segment.time < 300);
        }

        // Vertical movement (up/down controls)
        if (keys['ArrowUp']) {
            this.velocityY = -this.speed;
        } else if (keys['ArrowDown']) {
            this.velocityY = this.speed;
        } else {
            this.velocityY *= 0.8;
        }

        // Apply gravity
        this.velocityY += config.gravity;
        this.y += this.velocityY;

        // Vertical bounds - don't wrap, just limit
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        } else if (this.y + this.height > config.height) {
            this.y = config.height - this.height;
            this.velocityY = 0;
        }

        // Horizontal movement - constant rightward
        this.x += this.velocityX;

        // Scroll screen when player is in right half
        if (this.x > config.width / 2) {
            this.x = config.width / 2;
            scrollSpeed = this.velocityX;
            
            // Update trail positions when scrolling
            this.trail.forEach(segment => {
                segment.x -= scrollSpeed;
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
        
        // Draw player as a triangle pointing right
        ctx.fillStyle = colors.player;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height / 2);  // Right point
        ctx.lineTo(this.x, this.y);  // Top left
        ctx.lineTo(this.x, this.y + this.height);  // Bottom left
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
            
            // Draw as small triangle pointing right
            const halfSize = size / 2;
            ctx.beginPath();
            ctx.moveTo(segment.x + halfSize, segment.y);  // Right point
            ctx.lineTo(segment.x - halfSize, segment.y - halfSize);  // Top left
            ctx.lineTo(segment.x - halfSize, segment.y + halfSize);  // Bottom left
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
        this.x -= scrollSpeed;  // Move left as player advances right
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
            player.velocityY > 0 &&  // Player falling down
            player.x + player.width > this.x &&
            player.x < this.x + this.width &&
            player.y + player.height > this.y &&
            player.y + player.height < this.y + this.height / 2  // Landing on top
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
    
    // Initialize audio
    synthAudio.init();
    
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', showGame);
    document.getElementById('instructionsBtn').addEventListener('click', showInstructions);
    document.getElementById('backBtn').addEventListener('click', hideInstructions);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    document.getElementById('muteBtn').addEventListener('click', toggleMute);
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
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
    synthAudio.stopMusic();
}

function toggleMute() {
    const muteBtn = document.getElementById('muteBtn');
    const isMuted = synthAudio.toggleMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
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
    
    // Create initial platforms horizontally
    for (let i = 0; i < 10; i++) {
        const x = 300 + (i * config.platformGap);
        const y = Math.random() * (config.height - config.platformHeight - 100) + 50;
        platforms.push(new Platform(x, y));
    }
    
    // Starting platform
    platforms.push(new Platform(50, config.height / 2 - config.platformHeight / 2));
    
    document.getElementById('gameOver').classList.add('hidden');
    updateScore();
    
    // Start music
    synthAudio.startMusic();
    
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
            player.leap();
            synthAudio.playJumpSound();
        }
    });
    
    // Remove off-screen platforms and add new ones
    platforms = platforms.filter(platform => platform.x > -config.platformWidth - 50);
    
    while (platforms.length < 12) {
        const x = platforms[platforms.length - 1].x + config.platformGap;
        const y = Math.random() * (config.height - config.platformHeight - 100) + 50;
        platforms.push(new Platform(x, y));
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
    
    // Check game over (player falls off bottom edge)
    if (player.y > config.height) {
        gameOver();
    }
}

// Draw horizontal mall background
function drawMallBackground(scrollOffset) {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, config.width, 0);
    gradient.addColorStop(0, '#0a0015');
    gradient.addColorStop(0.5, '#1a0033');
    gradient.addColorStop(1, '#2d0052');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Add subtle blur to background elements
    ctx.save();
    ctx.filter = 'blur(1px)';
    ctx.globalAlpha = 0.8;
    
    // Calculate total scroll for infinite repeating stores
    const totalScroll = score * 0.5;
    const repeatWidth = 2200;
    
    // Draw mall floors first (behind stores) - now vertical dividers
    mallFloors.forEach((floor) => {
        const baseX = (floor.x - totalScroll) % repeatWidth;
        const floorX = baseX < -50 ? baseX + repeatWidth : baseX;
        
        if (floorX > -50 && floorX < config.width + 50) {
            drawMallFloor(floorX, floor.level);
        }
    });
    
    // Draw storefronts with enhanced realism
    mallStores.forEach((store, index) => {
        const baseX = (store.x - totalScroll) % repeatWidth;
        const storeX = baseX < -250 ? baseX + repeatWidth : baseX;
        
        if (storeX > -250 && storeX < config.width + 250) {
            drawRealisticStore(store, storeX);
        }
    });
    
    // Draw mall features (fountains only)
    mallFeatures.forEach((feature) => {
        const baseX = (feature.x - totalScroll) % repeatWidth;
        const featureX = baseX < -100 ? baseX + repeatWidth : baseX;
        
        if (featureX > -100 && featureX < config.width + 100) {
            if (feature.type === 'fountain') {
                drawFountain(featureX, feature.y);
            }
        }
    });
    
    // Draw subtle grid overlay to maintain vaporwave aesthetic
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < config.height; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(config.width, i);
        ctx.stroke();
    }
    
    // Reset filter and alpha for foreground elements
    ctx.restore();
    
    // Add atmospheric haze overlay for better contrast
    ctx.save();
    const hazeGradient = ctx.createLinearGradient(0, 0, config.width, 0);
    hazeGradient.addColorStop(0, 'rgba(10, 0, 25, 0.2)');
    hazeGradient.addColorStop(0.3, 'rgba(20, 10, 40, 0.3)');
    hazeGradient.addColorStop(0.7, 'rgba(15, 5, 30, 0.25)');
    hazeGradient.addColorStop(1, 'rgba(25, 15, 45, 0.2)');
    
    ctx.fillStyle = hazeGradient;
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Add some subtle atmospheric particles
    const time = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(100, 50, 150, 0.1)';
    for (let i = 0; i < 12; i++) {
        const x = (Math.sin(time + i) * 100) + (config.width / 2);
        const y = (Math.cos(time * 0.7 + i * 0.5) * 200) + (config.height / 2);
        const size = 3 + Math.sin(time + i * 2) * 1;
        
        ctx.globalAlpha = 0.05 + Math.sin(time + i) * 0.03;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw mall floor/level structure
function drawMallFloor(y, level) {
    ctx.save();
    
    // Main floor structure
    ctx.fillStyle = 'rgba(40, 25, 60, 0.9)';
    ctx.fillRect(0, y - 15, config.width, 30);
    
    // Floor edge/rim with neon accent
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00ffff';
    ctx.strokeRect(0, y - 15, config.width, 30);
    ctx.shadowBlur = 0;
    
    // Floor support beams
    for (let x = 100; x < config.width; x += 150) {
        ctx.fillStyle = 'rgba(60, 40, 80, 0.8)';
        ctx.fillRect(x - 5, y - 15, 10, 30);
        
        // Beam highlights
        ctx.strokeStyle = '#ff1493';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff1493';
        ctx.strokeRect(x - 5, y - 15, 10, 30);
        ctx.shadowBlur = 0;
    }
    
    // Floor pattern/tiles
    ctx.strokeStyle = 'rgba(100, 50, 150, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < config.width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x, y + 15);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw realistic storefront
function drawRealisticStore(store, y) {
    ctx.save();
    
    // Store building depth/shadow
    ctx.fillStyle = 'rgba(5, 0, 15, 0.9)';
    ctx.fillRect(30, y - 10, config.width - 60, 200);
    
    // Main storefront structure
    ctx.fillStyle = 'rgba(25, 15, 40, 0.9)';
    ctx.fillRect(40, y, config.width - 80, 180);
    
    // Store entrance area (recessed)
    ctx.fillStyle = 'rgba(35, 20, 50, 0.95)';
    ctx.fillRect(config.width/2 - 60, y + 120, 120, 60);
    
    // Double doors with glass effect
    ctx.fillStyle = 'rgba(10, 5, 20, 0.8)';
    ctx.fillRect(config.width/2 - 55, y + 125, 50, 50);
    ctx.fillRect(config.width/2 + 5, y + 125, 50, 50);
    
    // Door frames with neon glow
    ctx.strokeStyle = store.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = store.color;
    ctx.strokeRect(config.width/2 - 55, y + 125, 50, 50);
    ctx.strokeRect(config.width/2 + 5, y + 125, 50, 50);
    
    // Door handles
    ctx.fillStyle = store.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(config.width/2 - 10, y + 150, 3, 0, Math.PI * 2);
    ctx.arc(config.width/2 + 10, y + 150, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Large display windows
    const windowPositions = [
        { x: 60, width: 100 },
        { x: 180, width: 120 },
        { x: config.width - 280, width: 120 },
        { x: config.width - 140, width: 100 }
    ];
    
    windowPositions.forEach((window, i) => {
        // Window glass
        ctx.fillStyle = 'rgba(20, 10, 40, 0.6)';
        ctx.fillRect(window.x, y + 30, window.width, 80);
        
        // Window frame
        ctx.strokeStyle = store.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = store.color;
        ctx.strokeRect(window.x, y + 30, window.width, 80);
        
        // Window display items
        if (Math.random() > 0.4) {
            ctx.fillStyle = store.color;
            ctx.globalAlpha = 0.6;
            // Simulate products/displays
            ctx.fillRect(window.x + 10, y + 70, 20, 25);
            ctx.fillRect(window.x + 40, y + 50, 25, 35);
            ctx.fillRect(window.x + window.width - 35, y + 60, 20, 30);
            ctx.globalAlpha = 1;
        }
        
        ctx.shadowBlur = 0;
    });
    
    // Overhead canopy/awning
    ctx.fillStyle = store.color;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(40, y - 25, config.width - 80, 25);
    ctx.globalAlpha = 1;
    
    // Canopy support pillars
    ctx.strokeStyle = store.color;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 12;
    ctx.shadowColor = store.color;
    ctx.beginPath();
    ctx.moveTo(60, y - 25);
    ctx.lineTo(60, y);
    ctx.moveTo(config.width - 60, y - 25);
    ctx.lineTo(config.width - 60, y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Large neon store sign
    ctx.font = 'bold 32px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Multi-layer neon effect for intense glow
    const signY = y + 70;
    
    // Outer glow layers
    ctx.shadowBlur = 40;
    ctx.shadowColor = store.color;
    ctx.fillStyle = store.color;
    ctx.fillText(store.name, config.width / 2, signY);
    
    ctx.shadowBlur = 30;
    ctx.fillText(store.name, config.width / 2, signY);
    
    ctx.shadowBlur = 20;
    ctx.fillText(store.name, config.width / 2, signY);
    
    // Core bright text
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(store.name, config.width / 2, signY);
    
    // Sign backing/frame
    ctx.shadowBlur = 0;
    ctx.strokeStyle = store.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    
    const textWidth = ctx.measureText(store.name).width;
    ctx.strokeRect(config.width/2 - textWidth/2 - 10, signY - 20, textWidth + 20, 40);
    ctx.globalAlpha = 1;
    
    // Floor reflection
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = store.color;
    ctx.fillRect(40, y + 180, config.width - 80, 5);
    ctx.globalAlpha = 1;
    
    ctx.restore();
}

// Draw fountain
function drawFountain(x, y) {
    ctx.save();
    
    // Fountain base (front view - oval/elliptical)
    ctx.fillStyle = 'rgba(120, 120, 140, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x, y + 80, 40, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Fountain wall/rim (cylindrical front view)
    ctx.fillStyle = 'rgba(140, 140, 160, 0.9)';
    ctx.fillRect(x - 40, y + 65, 80, 15);
    
    // Fountain rim glow
    ctx.strokeStyle = '#ff1493';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff1493';
    ctx.strokeRect(x - 40, y + 65, 80, 15);
    
    // Central fountain pillar
    ctx.fillStyle = 'rgba(160, 160, 180, 0.9)';
    ctx.fillRect(x - 8, y + 40, 16, 40);
    
    // Water spouts (front view - vertical streams)
    const time = Date.now() * 0.008;
    for (let i = 0; i < 5; i++) {
        const spoutX = x - 30 + (i * 15);
        const height = 20 + Math.sin(time + i) * 8;
        
        // Water stream
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.globalAlpha = 0.7 + Math.sin(time + i) * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(spoutX, y + 65);
        ctx.lineTo(spoutX, y + 65 - height);
        ctx.stroke();
        
        // Water droplets falling
        for (let j = 0; j < 3; j++) {
            const dropY = y + 65 - height + (j * 8) + (time * 30) % 24;
            if (dropY < y + 65) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(spoutX + Math.sin(time + j) * 2, dropY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Central main water spout
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    
    const mainHeight = 35 + Math.sin(time * 1.5) * 10;
    ctx.beginPath();
    ctx.moveTo(x, y + 65);
    ctx.lineTo(x, y + 65 - mainHeight);
    ctx.stroke();
    
    ctx.restore();
}

// Draw game
function draw() {
    // Draw mall background
    drawMallBackground(scrollSpeed);
    
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
    synthAudio.playGameOverSound();
    synthAudio.stopMusic();
}

// Initialize when page loads
window.addEventListener('load', init);
