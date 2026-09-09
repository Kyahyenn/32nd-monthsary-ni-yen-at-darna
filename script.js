// Canvas Setup
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

// Handle High-DPI (Retina) displays for iPhones
let dpr = window.devicePixelRatio || 1;
let logicalWidth = window.innerWidth;
let logicalHeight = window.innerHeight;

function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    logicalWidth = window.innerWidth;
    logicalHeight = window.innerHeight;
    
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    
    ctx.scale(dpr, dpr);
    updateLayout();
}

// Responsive Layout Variables
let centerX, centerY, stemBaseY, mainFlowerY, layoutScale;
let smallFlowers = [];

function updateLayout() {
    centerX = logicalWidth / 2;
    centerY = logicalHeight / 2;
    
    // Scale everything based on the smallest screen dimension
    const minDim = Math.min(logicalWidth, logicalHeight);
    layoutScale = minDim / 800; 
    
    if (layoutScale > 1) layoutScale = 1;
    if (layoutScale < 0.4) layoutScale = 0.4;

    stemBaseY = centerY + (250 * layoutScale);
    mainFlowerY = centerY - (150 * layoutScale);

    const baseOffsets = [
        { x: -230, y: 80, color: '#ff0000' },
        { x: -210, y: -10, color: '#ffeb3b' },
        { x: -240, y: -100, color: '#ff69b4' },
        { x: -190, y: 140, color: '#ff0000' },
        { x: 230, y: 80, color: '#ffeb3b' },
        { x: 210, y: -10, color: '#ff69b4' },
        { x: 240, y: -100, color: '#ff0000' },
        { x: 190, y: 140, color: '#ffeb3b' }
    ];

    smallFlowers = baseOffsets.map(f => {
        const fx = centerX + (f.x * layoutScale);
        const fy = centerY + (f.y * layoutScale);
        return {
            x: f.x * layoutScale,
            y: f.y * layoutScale,
            color: f.color,
            cpx: (centerX + fx) / 2 + (Math.random() * 40 - 20) * layoutScale,
            cpy: (stemBaseY + fy) / 2
        };
    });
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); 

function toRadians(degrees) { return degrees * Math.PI / 180; }

function getQuadraticPoint(t, p0x, p0y, p1x, p1y, p2x, p2y) {
    const x = (1-t)*(1-t)*p0x + 2*(1-t)*t*p1x + t*t*p2x;
    const y = (1-t)*(1-t)*p0y + 2*(1-t)*t*p1y + t*t*p2y;
    return { x, y };
}

function drawPetal(baseX, baseY, baseAngle, length, width, color, points, scale) {
    scale = scale || 1;
    points = points || 20;
    const cosA = Math.cos(baseAngle);
    const sinA = Math.sin(baseAngle);

    ctx.font = `bold ${8 * layoutScale}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= points; i++) {
        const theta = (i * Math.PI) / points;
        const out = (length * scale * layoutScale) * Math.sin(theta);
        const side = (width * scale * layoutScale) * Math.sin(theta) * Math.cos(theta);

        const rx = out * cosA - side * sinA;
        const ry = out * sinA + side * cosA;

        ctx.fillText('my love', baseX + rx, baseY + ry);
    }
}

function drawLeaf(baseX, baseY, angleDeg, length, width) {
    drawPetal(baseX, baseY, toRadians(angleDeg), length, width, '#2ed057', 22, 1);
}

function drawStemSegment(p0x, p0y, p1x, p1y, p2x, p2y, progress, lineWidth) {
    ctx.strokeStyle = '#2ed057';
    ctx.lineWidth = lineWidth * layoutScale;
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    const pt = getQuadraticPoint(progress, p0x, p0y, p1x, p1y, p2x, p2y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
}

function drawFullStem(p0x, p0y, p1x, p1y, p2x, p2y, lineWidth) {
    ctx.strokeStyle = '#2ed057';
    ctx.lineWidth = lineWidth * layoutScale;
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.quadraticCurveTo(p1x, p1y, p2x, p2y);
    ctx.stroke();
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
    let hx, hy;
    do {
        hx = Math.random() * logicalWidth;
        hy = Math.random() * logicalHeight;
    } while (Math.hypot(hx - centerX, hy - centerY) <= 150 * layoutScale);
    heartsArray.push({ x: hx, y: hy });
}

// Animation State
let phase = 'main_stem'; 
let stemProgress = 0;
const stemGrowSpeed = 0.04; 
let currentSmallFlower = 0;
let currentSidePetal = 0;
let sideRotationAngle = 0;
let currentPetal = 0;
let currentRing = 0;
let rotationAngle = 0;
const rotationSpeed = 15;

function drawCompletedMainStem() {
    drawFullStem(centerX, stemBaseY, centerX, (stemBaseY + mainFlowerY)/2, centerX, mainFlowerY + 20 * layoutScale, 5);
}

function drawCompletedMainLeaves() {
    drawLeaf(centerX, centerY - 20 * layoutScale, 160, 45, 22);
    drawLeaf(centerX, centerY + 50 * layoutScale, -20, 50, 25);
}

function drawCompletedSideFlower(index) {
    const flower = smallFlowers[index];
    const fx = centerX + flower.x;
    const fy = centerY + flower.y;
    
    drawFullStem(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, 3);
    
    const leafX = (centerX + fx) / 2;
    const leafY = (stemBaseY + fy) / 2;
    const leafAngle = (index % 2 === 0) ? 150 : -30;
    drawLeaf(leafX, leafY, leafAngle, 28, 13);
    
    const petalLen = 38 * layoutScale;
    const petalWid = 16 * layoutScale;
    
    for (let i = 0; i < 5; i++) {
        const angle = (360 / 5) * i;
        const baseX = fx + (petalLen * 0.2) * Math.cos(toRadians(angle));
        const baseY = fy + (petalLen * 0.2) * Math.sin(toRadians(angle));
        drawPetal(baseX, baseY, toRadians(angle), petalLen, petalWid, flower.color, 20, 1);
    }
    ctx.beginPath();
    ctx.arc(fx, fy, petalWid * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
}

function drawHeartsAndText() {
    ctx.fillStyle = '#ff99cc';
    ctx.font = `bold ${12 * layoutScale}px Courier`;
    ctx.textAlign = 'center';
    for (let i = 0; i < heartsArray.length; i++) {
        ctx.fillText('<3', heartsArray[i].x, heartsArray[i].y);
    }
    ctx.fillStyle = 'white';
    ctx.font = `italic ${12 * layoutScale}px Arial`;
    ctx.fillText('Tap anywhere', centerX, logicalHeight - 30 * layoutScale);
}

function renderFrame() {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    if (phase === 'main_stem') {
        drawStemSegment(centerX, stemBaseY, centerX, (stemBaseY + mainFlowerY)/2, centerX, mainFlowerY + 20 * layoutScale, stemProgress, 5);
    } else {
        drawCompletedMainStem();
    }

    if (['main_leaves', 'side_stem', 'side_leaf', 'side_bloom', 'hearts', 'main_bloom', 'done'].includes(phase)) {
        drawCompletedMainLeaves();
    }

    let completedCount = 0;
    if (['hearts', 'main_bloom', 'done'].includes(phase)) completedCount = smallFlowers.length;
    else if (['side_stem', 'side_leaf', 'side_bloom'].includes(phase)) completedCount = currentSmallFlower;
    
    for (let i = 0; i < completedCount; i++) drawCompletedSideFlower(i);

    if (phase === 'side_stem' || phase === 'side_leaf' || phase === 'side_bloom') {
        const flower = smallFlowers[currentSmallFlower];
        const fx = centerX + flower.x;
        const fy = centerY + flower.y;
        const petalLen = 38 * layoutScale;
        const petalWid = 16 * layoutScale;

        if (phase === 'side_stem') {
            drawStemSegment(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, stemProgress, 3);
        } else {
            drawFullStem(centerX, stemBaseY, flower.cpx, flower.cpy, fx, fy, 3);
            if (phase === 'side_leaf' || phase === 'side_bloom') {
                const leafX = (centerX + fx) / 2;
                const leafY = (stemBaseY + fy) / 2;
                drawLeaf(leafX, leafY, (currentSmallFlower % 2 === 0) ? 150 : -30, 28, 13);
            }
            if (phase === 'side_bloom') {
                for (let i = 0; i <= currentSidePetal; i++) {
                    const angle = (360 / 5) * i + sideRotationAngle;
                    const baseX = fx + (petalLen * 0.2) * Math.cos(toRadians(angle));
                    const baseY = fy + (petalLen * 0.2) * Math.sin(toRadians(angle));
                    drawPetal(baseX, baseY, toRadians(angle), petalLen, petalWid, flower.color, 20, 1);
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
                const baseX = centerX + (ring.radius * layoutScale) * Math.cos(toRadians(angle));
                const baseY = mainFlowerY + (ring.radius * layoutScale) * Math.sin(toRadians(angle));
                drawPetal(baseX, baseY, toRadians(angle), ring.length, ring.width, ring.color, 20, 1);
            }
        }
        if (currentRing < rings.length) {
            const ring = rings[currentRing];
            for (let i = 0; i < currentPetal; i++) {
                const angle = (360 / ring.count) * i + ring.offset + rotationAngle;
                const baseX = centerX + (ring.radius * layoutScale) * Math.cos(toRadians(angle));
                const baseY = mainFlowerY + (ring.radius * layoutScale) * Math.sin(toRadians(angle));
                drawPetal(baseX, baseY, toRadians(angle), ring.length, ring.width, ring.color, 20, 1);
            }
        } else {
            ctx.beginPath();
            ctx.arc(centerX, mainFlowerY, 20 * layoutScale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeb3b';
            ctx.fill();
        }
    }
}

function mainLoop() {
    renderFrame();
    if (phase === 'main_stem') {
        if (stemProgress <= 1) { stemProgress += stemGrowSpeed; requestAnimationFrame(mainLoop); } 
        else { phase = 'main_leaves'; stemProgress = 0; setTimeout(mainLoop, 300); }
    } else if (phase === 'main_leaves') {
        phase = 'side_stem'; currentSmallFlower = 0; setTimeout(mainLoop, 300);
    } else if (phase === 'side_stem') {
        if (stemProgress <= 1) { stemProgress += stemGrowSpeed; requestAnimationFrame(mainLoop); } 
        else { phase = 'side_leaf'; stemProgress = 0; setTimeout(mainLoop, 200); }
    } else if (phase === 'side_leaf') {
        phase = 'side_bloom'; currentSidePetal = 0; sideRotationAngle = 0; setTimeout(mainLoop, 200);
    } else if (phase === 'side_bloom') {
        if (currentSidePetal < 4) { currentSidePetal++; sideRotationAngle += rotationSpeed; setTimeout(mainLoop, 60); } 
        else {
            currentSmallFlower++;
            if (currentSmallFlower < smallFlowers.length) { phase = 'side_stem'; stemProgress = 0; setTimeout(mainLoop, 300); } 
            else { phase = 'hearts'; setTimeout(mainLoop, 500); }
        }
    } else if (phase === 'hearts') {
        phase = 'main_bloom'; currentRing = 0; currentPetal = 0; rotationAngle = 0; setTimeout(mainLoop, 500);
    } else if (phase === 'main_bloom') {
        if (currentRing < rings.length) {
            const ring = rings[currentRing];
            if (currentPetal < ring.count) { currentPetal++; rotationAngle += rotationSpeed; setTimeout(mainLoop, 40); } 
            else { currentPetal = 0; currentRing++; rotationAngle = 0; setTimeout(mainLoop, 100); }
        } else { phase = 'done'; setTimeout(showLetter, 1000); }
    }
}

const letterContent = "Hi babi ko,\n\nThank you for being here with me even if I have huge flaws. September na ngayon which means malapit na birthday mo!!! ADVANCE HAPPY BIRTHDAY MA CHERIE!!!!\n\nAnyways, I love you babi ko I hope you like the small coding gift that I made. Syempre I would do more handmade gifts in the future with all the love that is needed. Still pacticing and hopefully mapantayan ko mga gawa mo, I love you babi ko!\n\n- Jed";

function showLetter() {
    document.getElementById('letterModal').classList.add('show');
    const letterText = document.getElementById('letterText');
    const closeBtn = document.getElementById('closeBtn');
    let index = 0;
    letterText.textContent = '';
    
    function typeText() {
        if (index < letterContent.length) {
            letterText.textContent += letterContent.charAt(index);
            index++;
            document.querySelector('.letter-container').scrollTop = document.querySelector('.letter-container').scrollHeight;
            setTimeout(typeText, 35);
        } else { setTimeout(() => { closeBtn.style.display = 'block'; }, 500); }
    }
    setTimeout(typeText, 500);
}

// ==========================================
// FIREWORK CANNON SYSTEM (Clean & No Trails)
// ==========================================
const fwCanvas = document.createElement('canvas');
fwCanvas.id = 'fireworksCanvas';
fwCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2000;';
document.body.appendChild(fwCanvas);
const fwCtx = fwCanvas.getContext('2d');

function resizeFwCanvas() {
    const dpr = window.devicePixelRatio || 1;
    fwCanvas.width = window.innerWidth * dpr;
    fwCanvas.height = window.innerHeight * dpr;
    fwCanvas.style.width = window.innerWidth + 'px';
    fwCanvas.style.height = window.innerHeight + 'px';
    fwCtx.scale(dpr, dpr);
}
resizeFwCanvas();
window.addEventListener('resize', resizeFwCanvas);

function Particle(x, y, dx, dy, life, color) {
    this.x = x; this.y = y; this.dx = dx; this.dy = dy;
    this.life = life; this.maxLife = life; this.color = color;
    this.update = function() { this.x += this.dx; this.y += this.dy; this.dy += 0.05; this.life--; };
    this.draw = function(ctx) {
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    };
}

function Cannonball(x, targetY, particleColors) {
    this.x = x; this.y = window.innerHeight; this.targetY = targetY;
    this.dy = -(Math.random() * 5 + 10); this.particleColors = particleColors; this.exploded = false;
    this.update = function() { this.y += this.dy; this.dy += 0.15; if (this.dy >= 0 || this.y <= this.targetY) this.exploded = true; };
    this.draw = function(ctx) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); };
}

function Explosion(cannonball) {
    this.particles = []; this.source = cannonball;
    this.init = function() {
        for (var i = 0; i < 30; i++) { 
            const angle = (Math.PI * 2 / 30) * i;
            const speed = Math.random() * 4 + 2;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;
            const color = this.source.particleColors[Math.floor(Math.random() * this.source.particleColors.length)];
            this.particles.push(new Particle(this.source.x, this.source.y, dx, dy, 60, color));
        }
    };
    this.init();
    this.update = function() { this.particles.forEach(p => p.update()); this.particles = this.particles.filter(p => p.life > 0); };
    this.draw = function(ctx) { this.particles.forEach(p => p.draw(ctx)); };
}

let cannonballs = [], explosions = [], fireworkActive = false, fireworkInterval;

function startFireworks() {
    if (fireworkActive) return;
    fireworkActive = true;
    const colors = ['#ff0000', '#ffeb3b', '#ff69b4', '#00ff00', '#00ffff', '#ff1493', '#ffffff'];
    fireworkInterval = setInterval(() => {
        cannonballs.push(new Cannonball(Math.random() * window.innerWidth, Math.random() * (window.innerHeight / 2) + 50, colors));
    }, 400);
    animateFireworks();
}

function animateFireworks() {
    if (!fireworkActive) return;
    
    fwCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    cannonballs.forEach(cb => { cb.update(); cb.draw(fwCtx); if (cb.exploded) explosions.push(new Explosion(cb)); });
    cannonballs = cannonballs.filter(cb => !cb.exploded);
    explosions.forEach(exp => { exp.update(); exp.draw(fwCtx); });
    explosions = explosions.filter(exp => exp.particles.length > 0);
    requestAnimationFrame(animateFireworks);
}

// ==========================================
// EVENT LISTENERS
// ==========================================
const closeBtn = document.getElementById('closeBtn');

const handleFinish = () => {
    document.getElementById('letterModal').classList.remove('show');
    startFireworks();
};

// Only trigger when the Close Window button is clicked/tapped
closeBtn.addEventListener('click', handleFinish);
closeBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleFinish(); });

setTimeout(mainLoop, 500);