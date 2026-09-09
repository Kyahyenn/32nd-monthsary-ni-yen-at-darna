// ==========================================
// FLOWER & FIREWORKS LOGIC
// ==========================================
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;
let logicalWidth = window.innerWidth;
let logicalHeight = window.innerHeight;

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    logicalWidth = window.innerWidth;
    logicalHeight = window.innerHeight;
    canvas.width = logicalWidth * dpr; canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px'; canvas.style.height = logicalHeight + 'px';
    ctx.scale(dpr, dpr); updateLayout();
}

let centerX, centerY, stemBaseY, mainFlowerY, layoutScale;
let smallFlowers = [];

function updateLayout() {
    centerX = logicalWidth / 2; centerY = logicalHeight / 2;
    const minDim = Math.min(logicalWidth, logicalHeight);
    layoutScale = Math.max(0.4, Math.min(1, minDim / 800));
    stemBaseY = centerY + (250 * layoutScale);
    mainFlowerY = centerY - (150 * layoutScale);

    const baseOffsets = [
        { x: -230, y: 80, color: '#ff0000' }, { x: -210, y: -10, color: '#ffeb3b' },
        { x: -240, y: -100, color: '#ff69b4' }, { x: -190, y: 140, color: '#ff0000' },
        { x: 230, y: 80, color: '#ffeb3b' }, { x: 210, y: -10, color: '#ff69b4' },
        { x: 240, y: -100, color: '#ff0000' }, { x: 190, y: 140, color: '#ffeb3b' }
    ];
    smallFlowers = baseOffsets.map(f => {
        const fx = centerX + (f.x * layoutScale), fy = centerY + (f.y * layoutScale);
        return { x: f.x * layoutScale, y: f.y * layoutScale, color: f.color,
                 cpx: (centerX + fx) / 2 + (Math.random() * 40 - 20) * layoutScale, cpy: (stemBaseY + fy) / 2 };
    });
}
window.addEventListener('resize', resizeCanvas); resizeCanvas();

function toRadians(degrees) { return degrees * Math.PI / 180; }
function getQuadraticPoint(t, p0x, p0y, p1x, p1y, p2x, p2y) {
    return { x: (1-t)*(1-t)*p0x + 2*(1-t)*t*p1x + t*t*p2x, y: (1-t)*(1-t)*p0y + 2*(1-t)*t*p1y + t*t*p2y };
}

function drawPetal(baseX, baseY, baseAngle, length, width, color, points, scale) {
    scale = scale || 1; points = points || 20;
    const cosA = Math.cos(baseAngle), sinA = Math.sin(baseAngle);
    ctx.font = `bold ${8 * layoutScale}px Arial`; ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= points; i++) {
        const theta = (i * Math.PI) / points;
        const out = (length * scale * layoutScale) * Math.sin(theta);
        const side = (width * scale * layoutScale) * Math.sin(theta) * Math.cos(theta);
        ctx.fillText('my love', baseX + out * cosA - side * sinA, baseY + out * sinA + side * cosA);
    }
}
function drawLeaf(baseX, baseY, angleDeg, length, width) { drawPetal(baseX, baseY, toRadians(angleDeg), length, width, '#2ed057', 22, 1); }
function drawStemSegment(p0x, p0y, p1x, p1y, p2x, p2y, progress, lineWidth) {
    ctx.strokeStyle = '#2ed057'; ctx.lineWidth = lineWidth * layoutScale; ctx.beginPath(); ctx.moveTo(p0x, p0y);
    const pt = getQuadraticPoint(progress, p0x, p0y, p1x, p1y, p2x, p2y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
}
function drawFullStem(p0x, p0y, p1x, p1y, p2x, p2y, lineWidth) {
    ctx.strokeStyle = '#2ed057'; ctx.lineWidth = lineWidth * layoutScale; ctx.beginPath(); ctx.moveTo(p0x, p0y);
    ctx.quadraticCurveTo(p1x, p1y, p2x, p2y); ctx.stroke();
}

const rings = [
    { radius: 0, count: 4, length: 40, width: 15, color: '#ffebf2', offset: 45 },
    { radius: 10, count: 5, length: 50, width: 25, color: '#ffb3d9', offset: 0 },
    { radius: 20, count: 7, length: 70, width: 35, color: '#ff66b2', offset: 30 },
    { radius: 30, count: 9, length: 90, width: 45, color: '#ff1493', offset: 15 },
    { radius: 40, count: 12, length: 110, width: 55, color: '#c71585', offset: 0 }
];
const heartsArray = [];
for (let i = 0; i < 12; i++) {
    let hx, hy; do { hx = Math.random() * logicalWidth; hy = Math.random() * logicalHeight; } 
    while (Math.hypot(hx - centerX, hy - centerY) <= 150 * layoutScale);
    heartsArray.push({ x: hx, y: hy });
}

let phase = 'main_stem', stemProgress = 0, currentSmallFlower = 0, currentSidePetal = 0, sideRotationAngle = 0;
let currentPetal = 0, currentRing = 0, rotationAngle = 0;

function drawCompletedMainStem() { drawFullStem(centerX, stemBaseY, centerX, (stemBaseY + mainFlowerY)/2, centerX, mainFlowerY + 20 * layoutScale, 5); }
function drawCompletedMainLeaves() { drawLeaf(centerX, centerY - 20 * layoutScale, 160, 45, 22); drawLeaf(centerX, centerY + 50 * layoutScale, -20, 50, 25); }
function drawCompletedSideFlower(index) {
    const flower = smallFlowers[index], fx = centerX + flower.x, fy = centerY + flower.y;
    drawFullStem(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, 3);
    drawLeaf((centerX + fx) / 2, (stemBaseY + fy) / 2, (index % 2 === 0) ? 150 : -30, 28, 13);
    const petalLen = 38 * layoutScale, petalWid = 16 * layoutScale;
    for (let i = 0; i < 5; i++) {
        const angle = (360 / 5) * i;
        drawPetal(fx + (petalLen * 0.2) * Math.cos(toRadians(angle)), fy + (petalLen * 0.2) * Math.sin(toRadians(angle)), toRadians(angle), petalLen, petalWid, flower.color, 20, 1);
    }
    ctx.beginPath(); ctx.arc(fx, fy, petalWid * 0.4, 0, Math.PI * 2); ctx.fillStyle = '#ffeb3b'; ctx.fill();
}
function drawHeartsAndText() {
    ctx.fillStyle = '#ff99cc'; ctx.font = `bold ${12 * layoutScale}px Courier`; ctx.textAlign = 'center';
    heartsArray.forEach(h => ctx.fillText('<3', h.x, h.y));
}

function renderFrame() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    if (phase === 'main_stem') drawStemSegment(centerX, stemBaseY, centerX, (stemBaseY + mainFlowerY)/2, centerX, mainFlowerY + 20 * layoutScale, stemProgress, 5);
    else drawCompletedMainStem();
    if (['main_leaves', 'side_stem', 'side_leaf', 'side_bloom', 'hearts', 'main_bloom', 'done'].includes(phase)) drawCompletedMainLeaves();
    
    let completedCount = ['hearts', 'main_bloom', 'done'].includes(phase) ? smallFlowers.length : (['side_stem', 'side_leaf', 'side_bloom'].includes(phase) ? currentSmallFlower : 0);
    for (let i = 0; i < completedCount; i++) drawCompletedSideFlower(i);

    if (['side_stem', 'side_leaf', 'side_bloom'].includes(phase)) {
        const flower = smallFlowers[currentSmallFlower], fx = centerX + flower.x, fy = centerY + flower.y;
        const petalLen = 38 * layoutScale, petalWid = 16 * layoutScale;
        if (phase === 'side_stem') drawStemSegment(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, stemProgress, 3);
        else {
            drawFullStem(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, 3);
            if (phase !== 'side_stem') drawLeaf((centerX + fx) / 2, (stemBaseY + fy) / 2, (currentSmallFlower % 2 === 0) ? 150 : -30, 28, 13);
            if (phase === 'side_bloom') {
                for (let i = 0; i <= currentSidePetal; i++) {
                    const angle = (360 / 5) * i + sideRotationAngle;
                    drawPetal(fx + (petalLen * 0.2) * Math.cos(toRadians(angle)), fy + (petalLen * 0.2) * Math.sin(toRadians(angle)), toRadians(angle), petalLen, petalWid, flower.color, 20, 1);
                }
            }
        }
    }
    if (['hearts', 'main_bloom', 'done'].includes(phase)) drawHeartsAndText();

    if (phase === 'main_bloom' || phase === 'done') {
        for (let r = 0; r < currentRing; r++) {
            const ring = rings[r];
            for (let i = 0; i < ring.count; i++) {
                const angle = (360 / ring.count) * i + ring.offset;
                drawPetal(centerX + (ring.radius * layoutScale) * Math.cos(toRadians(angle)), mainFlowerY + (ring.radius * layoutScale) * Math.sin(toRadians(angle)), toRadians(angle), ring.length, ring.width, ring.color, 20, 1);
            }
        }
        if (currentRing < rings.length) {
            const ring = rings[currentRing];
            for (let i = 0; i < currentPetal; i++) {
                const angle = (360 / ring.count) * i + ring.offset + rotationAngle;
                drawPetal(centerX + (ring.radius * layoutScale) * Math.cos(toRadians(angle)), mainFlowerY + (ring.radius * layoutScale) * Math.sin(toRadians(angle)), toRadians(angle), ring.length, ring.width, ring.color, 20, 1);
            }
        } else { ctx.beginPath(); ctx.arc(centerX, mainFlowerY, 20 * layoutScale, 0, Math.PI * 2); ctx.fillStyle = '#ffeb3b'; ctx.fill(); }
    }
}

function mainLoop() {
    renderFrame();
    if (phase === 'main_stem') { if (stemProgress <= 1) { stemProgress += 0.04; requestAnimationFrame(mainLoop); } else { phase = 'main_leaves'; stemProgress = 0; setTimeout(mainLoop, 300); } }
    else if (phase === 'main_leaves') { phase = 'side_stem'; currentSmallFlower = 0; setTimeout(mainLoop, 300); }
    else if (phase === 'side_stem') { if (stemProgress <= 1) { stemProgress += 0.04; requestAnimationFrame(mainLoop); } else { phase = 'side_leaf'; stemProgress = 0; setTimeout(mainLoop, 200); } }
    else if (phase === 'side_leaf') { phase = 'side_bloom'; currentSidePetal = 0; sideRotationAngle = 0; setTimeout(mainLoop, 200); }
    else if (phase === 'side_bloom') {
        if (currentSidePetal < 4) { currentSidePetal++; sideRotationAngle += 15; setTimeout(mainLoop, 60); }
        else { currentSmallFlower++; if (currentSmallFlower < smallFlowers.length) { phase = 'side_stem'; stemProgress = 0; setTimeout(mainLoop, 300); } else { phase = 'hearts'; setTimeout(mainLoop, 500); } }
    }
    else if (phase === 'hearts') { phase = 'main_bloom'; currentRing = 0; currentPetal = 0; rotationAngle = 0; setTimeout(mainLoop, 500); }
    else if (phase === 'main_bloom') {
        if (currentRing < rings.length) {
            const ring = rings[currentRing];
            if (currentPetal < ring.count) { currentPetal++; rotationAngle += 15; setTimeout(mainLoop, 40); }
            else { currentPetal = 0; currentRing++; rotationAngle = 0; setTimeout(mainLoop, 100); }
        } else { phase = 'done'; setTimeout(showLetter, 1000); }
    }
}

const letterContent = "Hi babi ko,\n\nThank you for being here with me even if I have huge flaws. September na ngayon which means malapit na birthday mo!!! ADVANCE HAPPY BIRTHDAY MA CHERIE!!!!\n\nAnyways, I love you babi ko I hope you like the small coding gift that I made. Syempre I would do more handmade gifts in the future with all the love that is needed. Still pacticing and hopefully mapantayan ko mga gawa mo, I love you babi ko!\n\n- Jed";

function showLetter() {
    document.getElementById('letterModal').classList.add('show');
    const letterText = document.getElementById('letterText'), closeBtn = document.getElementById('closeBtn');
    let index = 0; letterText.textContent = '';
    function typeText() {
        if (index < letterContent.length) { letterText.textContent += letterContent.charAt(index); index++;
            document.querySelector('.letter-container').scrollTop = document.querySelector('.letter-container').scrollHeight; setTimeout(typeText, 35);
        } else { setTimeout(() => { closeBtn.style.display = 'block'; }, 500); }
    }
    setTimeout(typeText, 500);
}

// Fireworks
const fwCanvas = document.createElement('canvas'); fwCanvas.id = 'fireworksCanvas';
fwCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2000;';
document.body.appendChild(fwCanvas); const fwCtx = fwCanvas.getContext('2d');
function resizeFwCanvas() { const dpr = window.devicePixelRatio || 1; fwCanvas.width = window.innerWidth * dpr; fwCanvas.height = window.innerHeight * dpr; fwCanvas.style.width = window.innerWidth + 'px'; fwCanvas.style.height = window.innerHeight + 'px'; fwCtx.scale(dpr, dpr); }
resizeFwCanvas(); window.addEventListener('resize', resizeFwCanvas);

function Particle(x, y, dx, dy, life, color) {
    this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.life = life; this.maxLife = life; this.color = color;
    this.update = function() { this.x += this.dx; this.y += this.dy; this.dy += 0.05; this.life--; };
    this.draw = function(ctx) { ctx.globalAlpha = Math.max(0, this.life / this.maxLife); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; };
}
function Cannonball(x, targetY, particleColors) {
    this.x = x; this.y = window.innerHeight; this.targetY = targetY; this.dy = -(Math.random() * 5 + 10); this.particleColors = particleColors; this.exploded = false;
    this.update = function() { this.y += this.dy; this.dy += 0.15; if (this.dy >= 0 || this.y <= this.targetY) this.exploded = true; };
    this.draw = function(ctx) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); };
}
function Explosion(cannonball) {
    this.particles = []; this.source = cannonball;
    this.init = function() { for (var i = 0; i < 30; i++) { const angle = (Math.PI * 2 / 30) * i, speed = Math.random() * 4 + 2; this.particles.push(new Particle(this.source.x, this.source.y, Math.cos(angle) * speed, Math.sin(angle) * speed, 60, this.source.particleColors[Math.floor(Math.random() * this.source.particleColors.length)])); } };
    this.init(); this.update = function() { this.particles.forEach(p => p.update()); this.particles = this.particles.filter(p => p.life > 0); };
    this.draw = function(ctx) { this.particles.forEach(p => p.draw(ctx)); };
}
let cannonballs = [], explosions = [], fireworkActive = false, fireworkInterval;
function startFireworks() {
    if (fireworkActive) return; fireworkActive = true;
    const colors = ['#ff0000', '#ffeb3b', '#ff69b4', '#00ff00', '#00ffff', '#ff1493', '#ffffff'];
    fireworkInterval = setInterval(() => { cannonballs.push(new Cannonball(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2) + 50, colors)); }, 400);
    animateFireworks();
}
function animateFireworks() {
    if (!fireworkActive) return; fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    cannonballs.forEach(cb => { cb.update(); cb.draw(fwCtx); if (cb.exploded) explosions.push(new Explosion(cb)); });
    cannonballs = cannonballs.filter(cb => !cb.exploded); explosions.forEach(exp => { exp.update(); exp.draw(fwCtx); });
    explosions = explosions.filter(exp => exp.particles.length > 0); requestAnimationFrame(animateFireworks);
}

// ==========================================
// HAMBURGER MENU & GAMES LOGIC
// ==========================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const gameMenu = document.getElementById('gameMenu');
const gameModal = document.getElementById('gameModal');
const gameCanvas = document.getElementById('gameCanvas');
const gameCtx = gameCanvas.getContext('2d');
const gameTitle = document.getElementById('gameTitle');
const gameInstructions = document.getElementById('gameInstructions');
const gameScore = document.getElementById('gameScore');
let currentGame = null, gameLoopId = null;

const handleFinish = () => {
    document.getElementById('letterModal').classList.remove('show');
    startFireworks();
    // Force button to show with high z-index
    hamburgerBtn.style.display = 'flex';
    hamburgerBtn.style.zIndex = '9999';
};

document.getElementById('closeBtn').addEventListener('click', handleFinish);
document.getElementById('closeBtn').addEventListener('touchend', (e) => { e.preventDefault(); handleFinish(); });

hamburgerBtn.addEventListener('click', (e) => { e.stopPropagation(); gameMenu.classList.toggle('show'); });
document.addEventListener('click', (e) => { if (!gameMenu.contains(e.target) && e.target !== hamburgerBtn) gameMenu.classList.remove('show'); });

function closeGame() {
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    if (gameLoopId) clearTimeout(gameLoopId);
    gameModal.classList.remove('show');
    currentGame = null;
}

document.getElementById('closeGameBtn').addEventListener('click', closeGame);

function startGame(gameType) {
    gameMenu.classList.remove('show');
    gameModal.classList.add('show');
    currentGame = gameType;
    
    const size = Math.min(window.innerWidth * 0.9, 350);
    gameCanvas.width = size;
    gameCanvas.height = size;

    if (gameType === 'snake') initSnake();
    else if (gameType === 'flappy') initFlappy();
    else if (gameType === 'tap') initTapHeart();
    else if (gameType === 'memory') initMemory();
}

// --- SNAKE GAME ---
function initSnake() {
    gameTitle.textContent = ' Snake';
    gameInstructions.textContent = 'Swipe to move. Eat the hearts!';
    gameScore.textContent = 'Score: 0';
    
    const gridSize = 15;
    const tileCountX = Math.floor(gameCanvas.width / gridSize);
    const tileCountY = Math.floor(gameCanvas.height / gridSize);
    
    let snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }];
    let food = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY) };
    let dx = 0, dy = 0, score = 0;
    let touchStartX = 0, touchStartY = 0;

    gameCanvas.ontouchstart = (e) => { e.preventDefault(); touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; };
    gameCanvas.ontouchend = (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX, touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX, diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY)) { if (diffX > 20 && dx === 0) { dx = 1; dy = 0; } else if (diffX < -20 && dx === 0) { dx = -1; dy = 0; } }
        else { if (diffY > 20 && dy === 0) { dx = 0; dy = 1; } else if (diffY < -20 && dy === 0) { dx = 0; dy = -1; } }
    };

    function drawSnake() {
        gameCtx.fillStyle = '#0d020d'; gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        gameCtx.fillStyle = '#ff1493'; gameCtx.font = '14px Arial'; gameCtx.textAlign = 'center'; gameCtx.textBaseline = 'middle';
        gameCtx.fillText('❤️', food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);

        snake.forEach((part, index) => {
            gameCtx.fillStyle = index === 0 ? '#2ed057' : '#1a8a3a';
            gameCtx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
        });

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        if (head.x < 0) head.x = tileCountX - 1; if (head.x >= tileCountX) head.x = 0;
        if (head.y < 0) head.y = tileCountY - 1; if (head.y >= tileCountY) head.y = 0;

        for (let i = 0; i < snake.length; i++) { if (head.x === snake[i].x && head.y === snake[i].y) { dx = 0; dy = 0; snake = [{ x: Math.floor(tileCountX / 2), y: Math.floor(tileCountY / 2) }]; score = 0; gameScore.textContent = 'Score: 0'; return; } }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++; gameScore.textContent = 'Score: ' + score;
            food = { x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY) };
        } else { snake.pop(); }
    }

    function snakeLoop() {
        if (currentGame !== 'snake') return;
        drawSnake();
        gameLoopId = setTimeout(() => { requestAnimationFrame(snakeLoop); }, 120);
    }
    snakeLoop();
}

// --- FLAPPY BIRD GAME ---
function initFlappy() {
    gameTitle.textContent = '🐦 Flappy Bird';
    gameInstructions.textContent = 'Tap to jump! Avoid the pipes.';
    gameScore.textContent = 'Score: 0';

    let bird = { x: gameCanvas.width * 0.3, y: gameCanvas.height / 2, velocity: 0, radius: 12 };
    let pipes = [], pipeWidth = 40, pipeGap = 130, pipeSpeed = 2.5, score = 0, frameCount = 0;
    let gravity = 0.5, jumpStrength = -7;

    const jump = (e) => { if(e) e.preventDefault(); bird.velocity = jumpStrength; };
    gameCanvas.ontouchstart = jump;
    gameCanvas.onclick = jump;

    function drawFlappy() {
        gameCtx.fillStyle = '#0d020d'; gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        gameCtx.fillStyle = '#2ed057';
        pipes.forEach(p => {
            gameCtx.fillRect(p.x, 0, pipeWidth, p.top);
            gameCtx.fillRect(p.x, p.top + pipeGap, pipeWidth, gameCanvas.height - p.top - pipeGap);
        });

        gameCtx.fillStyle = '#ffeb3b'; gameCtx.beginPath(); gameCtx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2); gameCtx.fill();

        bird.velocity += gravity; bird.y += bird.velocity;
        frameCount++;

        if (frameCount % 100 === 0) {
            const topHeight = Math.random() * (gameCanvas.height - pipeGap - 60) + 30;
            pipes.push({ x: gameCanvas.width, top: topHeight });
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;
            if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1);
            
            if (bird.x + bird.radius > pipes[i].x && bird.x - bird.radius < pipes[i].x + pipeWidth) {
                if (bird.y - bird.radius < pipes[i].top || bird.y + bird.radius > pipes[i].top + pipeGap) {
                    bird.y = gameCanvas.height / 2; bird.velocity = 0; pipes = []; score = 0; gameScore.textContent = 'Score: 0'; frameCount = 0;
                }
            }
            if (pipes[i] && Math.abs(pipes[i].x - bird.x) < pipeSpeed) { score++; gameScore.textContent = 'Score: ' + score; }
        }

        if (bird.y + bird.radius > gameCanvas.height || bird.y - bird.radius < 0) {
            bird.y = gameCanvas.height / 2; bird.velocity = 0; pipes = []; score = 0; gameScore.textContent = 'Score: 0'; frameCount = 0;
        }
    }

    function flappyLoop() {
        if (currentGame !== 'flappy') return;
        drawFlappy();
        gameLoopId = requestAnimationFrame(flappyLoop);
    }
    flappyLoop();
}

// --- TAP THE HEART GAME ---
function initTapHeart() {
    gameTitle.textContent = '💖 Tap the Heart';
    gameInstructions.textContent = 'Tap the hearts before they disappear!';
    gameScore.textContent = 'Score: 0';

    let hearts = [], score = 0, spawnRate = 60, frameCount = 0;
    let touchStartX = 0, touchStartY = 0;

    gameCanvas.ontouchstart = (e) => {
        e.preventDefault();
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const tx = (e.touches[0].clientX - rect.left) * scaleX;
        const ty = (e.touches[0].clientY - rect.top) * scaleY;

        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            const dist = Math.hypot(tx - h.x, ty - h.y);
            if (dist < h.radius + 10) {
                score++; gameScore.textContent = 'Score: ' + score;
                hearts.splice(i, 1);
                break; // Only tap one at a time
            }
        }
    };
    gameCanvas.onclick = (e) => {
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const tx = (e.clientX - rect.left) * scaleX;
        const ty = (e.clientY - rect.top) * scaleY;

        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            const dist = Math.hypot(tx - h.x, ty - h.y);
            if (dist < h.radius + 10) {
                score++; gameScore.textContent = 'Score: ' + score;
                hearts.splice(i, 1);
                break;
            }
        }
    };

    function drawTap() {
        gameCtx.fillStyle = '#0d020d'; gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        frameCount++;
        if (frameCount % spawnRate === 0) {
            hearts.push({
                x: Math.random() * (gameCanvas.width - 40) + 20,
                y: Math.random() * (gameCanvas.height - 40) + 20,
                radius: 20,
                life: 60, // frames before disappearing
                maxLife: 60
            });
            if (spawnRate > 20) spawnRate -= 1; // Get faster
        }

        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            h.life--;
            if (h.life <= 0) { hearts.splice(i, 1); continue; }

            gameCtx.globalAlpha = h.life / h.maxLife;
            gameCtx.fillStyle = '#ff1493';
            gameCtx.font = '30px Arial';
            gameCtx.textAlign = 'center';
            gameCtx.textBaseline = 'middle';
            gameCtx.fillText('', h.x, h.y);
            gameCtx.globalAlpha = 1;
        }
    }

    function tapLoop() {
        if (currentGame !== 'tap') return;
        drawTap();
        gameLoopId = requestAnimationFrame(tapLoop);
    }
    tapLoop();
}

// --- MEMORY MATCH GAME ---
function initMemory() {
    gameTitle.textContent = '🧠 Memory Match';
    gameInstructions.textContent = 'Find all matching pairs!';
    gameScore.textContent = 'Moves: 0';

    const emojis = ['', '💖', '🌻', '🌷', '💐', '', '💌', '💍'];
    const cards = [...emojis, ...emojis];
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const cols = 4, rows = 4;
    const cardW = gameCanvas.width / cols;
    const cardH = gameCanvas.height / rows;
    let flipped = [], matched = [], moves = 0, canFlip = true;

    gameCanvas.ontouchstart = (e) => {
        e.preventDefault();
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const tx = (e.touches[0].clientX - rect.left) * scaleX;
        const ty = (e.touches[0].clientY - rect.top) * scaleY;
        handleCardTap(tx, ty);
    };
    gameCanvas.onclick = (e) => {
        const rect = gameCanvas.getBoundingClientRect();
        const scaleX = gameCanvas.width / rect.width;
        const scaleY = gameCanvas.height / rect.height;
        const tx = (e.clientX - rect.left) * scaleX;
        const ty = (e.clientY - rect.top) * scaleY;
        handleCardTap(tx, ty);
    };

    function handleCardTap(tx, ty) {
        if (!canFlip) return;
        const col = Math.floor(tx / cardW);
        const row = Math.floor(ty / cardH);
        const index = row * cols + col;

        if (index < 0 || index >= 16) return;
        if (flipped.includes(index) || matched.includes(index)) return;

        flipped.push(index);
        drawMemory();

        if (flipped.length === 2) {
            canFlip = false;
            moves++;
            gameScore.textContent = 'Moves: ' + moves;
            
            if (cards[flipped[0]] === cards[flipped[1]]) {
                matched.push(...flipped);
                flipped = [];
                canFlip = true;
                if (matched.length === 16) {
                    gameInstructions.textContent = 'You won in ' + moves + ' moves!';
                }
            } else {
                setTimeout(() => {
                    flipped = [];
                    drawMemory();
                    canFlip = true;
                }, 800);
            }
        }
    }

    function drawMemory() {
        gameCtx.fillStyle = '#0d020d'; gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        for (let i = 0; i < 16; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * cardW + 5;
            const y = row * cardH + 5;
            const w = cardW - 10;
            const h = cardH - 10;

            if (matched.includes(i) || flipped.includes(i)) {
                gameCtx.fillStyle = '#1a051a';
                gameCtx.fillRect(x, y, w, h);
                gameCtx.font = '24px Arial';
                gameCtx.textAlign = 'center';
                gameCtx.textBaseline = 'middle';
                gameCtx.fillText(cards[i], x + w/2, y + h/2);
            } else {
                gameCtx.fillStyle = '#ff1493';
                gameCtx.fillRect(x, y, w, h);
                gameCtx.fillStyle = '#fff';
                gameCtx.font = '20px Arial';
                gameCtx.fillText('?', x + w/2, y + h/2);
            }
        }
    }

    function memoryLoop() {
        if (currentGame !== 'memory') return;
        drawMemory();
        gameLoopId = requestAnimationFrame(memoryLoop);
    }
    memoryLoop();
}

setTimeout(mainLoop, 500);
