class Dancer {
    constructor(x, y, phase = 0, color = '#2a9d8f') {
        this.baseX = x;
        this.baseY = y;
        this.phase = phase;
        this.color = color;
        this.momentum = {
            head: { x: 0, y: 0 },
            hips: { x: 0, y: 0 },
            spine: { x: 0, y: 0 },
            leftShoulder: { x: 0, y: 0 },
            rightShoulder: { x: 0, y: 0 },
            leftElbow: { x: 0, y: 0 },
            rightElbow: { x: 0, y: 0 },
            leftHand: { x: 0, y: 0 },
            rightHand: { x: 0, y: 0 },
            leftKnee: { x: 0, y: 0 },
            rightKnee: { x: 0, y: 0 },
            leftFoot: { x: 0, y: 0 },
            rightFoot: { x: 0, y: 0 }
        };
        this.lastPositions = JSON.parse(JSON.stringify(this.momentum));
        this.interpolationPoints = JSON.parse(JSON.stringify(this.momentum));
    }

    interpolate(start, end, t) {
        return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
        };
    }
}

const DANCE_PRESETS = {
    default: { sin: 0.5, cos: 0.5, tan: 0.3, speed: 1, amplitude: 1 },
    ballet: { sin: 0.8, cos: 0.6, tan: 0.1, speed: 0.7, amplitude: 1.2 },
    robot: { sin: 0.3, cos: 0.9, tan: 0.5, speed: 1.5, amplitude: 0.8 },
    hiphop: { sin: 0.7, cos: 0.3, tan: 0.4, speed: 1.3, amplitude: 1.5 },
    wave: { sin: 0.9, cos: 0.8, tan: 0.1, speed: 0.5, amplitude: 1.7 }
};

class DanceAnimation {
    constructor() {
        this.canvas = document.getElementById('danceCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.dancers = [new Dancer(this.canvas.width / 2, this.canvas.height / 2)];
        this.trailEnabled = false;
        this.rainbowMode = false;
        this.recording = false;
        this.gif = null;
        
        this.setupCanvas();
        this.setupControls();
        this.animate();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Recalculate dancer positions
        this.repositionDancers();
    }

    repositionDancers() {
        const spacing = this.canvas.width / (this.dancers.length + 1);
        this.dancers.forEach((dancer, index) => {
            dancer.baseX = spacing * (index + 1);
            dancer.baseY = this.canvas.height / 2;
        });
    }

    setupControls() {
        this.speed = 1;
        this.amplitude = 1;
        this.sinWeight = 0.5;
        this.cosWeight = 0.5;
        this.tanWeight = 0.3;
        this.figureColor = '#2a9d8f';
        this.backgroundColor = '#ffffff';

        // Dance Presets
        document.getElementById('dancePreset').addEventListener('change', (e) => {
            const preset = DANCE_PRESETS[e.target.value];
            if (preset) {
                this.updateControls(preset);
            }
        });

        // Basic Controls
        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.speed.toFixed(1);
        });

        document.getElementById('amplitude').addEventListener('input', (e) => {
            this.amplitude = parseFloat(e.target.value);
            document.getElementById('amplitudeValue').textContent = this.amplitude.toFixed(1);
        });

        document.getElementById('sinWeight').addEventListener('input', (e) => {
            this.sinWeight = parseFloat(e.target.value);
            document.getElementById('sinWeightValue').textContent = this.sinWeight.toFixed(1);
        });

        document.getElementById('cosWeight').addEventListener('input', (e) => {
            this.cosWeight = parseFloat(e.target.value);
            document.getElementById('cosWeightValue').textContent = this.cosWeight.toFixed(1);
        });

        document.getElementById('tanWeight').addEventListener('input', (e) => {
            this.tanWeight = parseFloat(e.target.value);
            document.getElementById('tanWeightValue').textContent = this.tanWeight.toFixed(1);
        });

        // Appearance Controls
        document.getElementById('figureColor').addEventListener('input', (e) => {
            this.figureColor = e.target.value;
            this.dancers.forEach(dancer => dancer.color = this.rainbowMode ? this.getRandomColor() : this.figureColor);
        });

        document.getElementById('backgroundColor').addEventListener('input', (e) => {
            this.backgroundColor = e.target.value;
            this.canvas.style.backgroundColor = this.backgroundColor;
        });

        document.getElementById('enableTrail').addEventListener('change', (e) => {
            this.trailEnabled = e.target.checked;
        });

        document.getElementById('rainbowMode').addEventListener('change', (e) => {
            this.rainbowMode = e.target.checked;
            if (this.rainbowMode) {
                this.dancers.forEach(dancer => dancer.color = this.getRandomColor());
            } else {
                this.dancers.forEach(dancer => dancer.color = this.figureColor);
            }
        });

        // Dancer Management
        document.getElementById('addDancer').addEventListener('click', () => {
            const phase = Math.PI * 2 * Math.random();
            const color = this.rainbowMode ? this.getRandomColor() : this.figureColor;
            this.dancers.push(new Dancer(0, 0, phase, color));
            this.repositionDancers();
        });

        document.getElementById('removeDancer').addEventListener('click', () => {
            if (this.dancers.length > 1) {
                this.dancers.pop();
                this.repositionDancers();
            }
        });

        // Export Controls
        document.getElementById('saveGif').addEventListener('click', () => this.startRecording());
        document.getElementById('saveImage').addEventListener('click', () => this.saveAsImage());
        document.getElementById('shareUrl').addEventListener('click', () => this.shareConfiguration());
    }

    updateControls(preset) {
        const controls = {
            sinWeight: ['sinWeight', 'sinWeightValue'],
            cosWeight: ['cosWeight', 'cosWeightValue'],
            tanWeight: ['tanWeight', 'tanWeightValue'],
            speed: ['speed', 'speedValue'],
            amplitude: ['amplitude', 'amplitudeValue']
        };

        for (const [key, [inputId, valueId]] of Object.entries(controls)) {
            const input = document.getElementById(inputId);
            input.value = preset[key];
            document.getElementById(valueId).textContent = preset[key].toFixed(1);
            this[key] = preset[key];
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    calculatePosition(baseX, baseY, offset, phase, partName, dancer) {
        const t = this.time + phase;
        
        // Enhanced motion components with smoother transitions
        const sinComponent = Math.sin(t) * this.sinWeight;
        const cosComponent = Math.cos(t * 1.5) * this.cosWeight;
        const tanComponent = Math.atan(Math.sin(t * 0.2)) / (Math.PI/2) * this.tanWeight; // Bounded tangent
        
        // Multiple frequency components for richer motion
        const f1 = Math.sin(t * 0.7) * 0.3;
        const f2 = Math.cos(t * 0.4) * 0.2;
        const f3 = Math.sin(t * 1.2) * 0.15;
        
        // Motion limiters to prevent extreme positions
        const limitMotion = (value, limit = 1) => {
            return Math.tanh(value) * limit;
        };

        // Calculate base motion with smoothing
        let newX = baseX + limitMotion(
            sinComponent + cosComponent + tanComponent + f1 + f3
        ) * offset * this.amplitude;

        let newY = baseY + limitMotion(
            cosComponent + sinComponent - tanComponent + f2
        ) * offset * this.amplitude;

        // Add natural sway and bounce with damping
        const swayAmount = Math.sin(t * 0.8) * offset * 0.3;
        const bounceAmount = Math.abs(Math.sin(t * 2)) * offset * 0.2;
        
        newX += limitMotion(swayAmount, 0.5);
        newY -= limitMotion(bounceAmount, 0.3);

        // Enhanced momentum system with variable damping
        const momentum = dancer.momentum[partName] || { x: 0, y: 0 };
        const lastPos = dancer.lastPositions[partName] || { x: baseX, y: baseY };
        
        // Dynamic smoothing based on movement speed
        const velocity = Math.hypot(newX - lastPos.x, newY - lastPos.y);
        const smoothingFactor = 0.15 * Math.exp(-velocity * 0.1);
        
        // Update momentum with improved damping
        momentum.x = momentum.x * 0.95 + (newX - lastPos.x) * smoothingFactor;
        momentum.y = momentum.y * 0.95 + (newY - lastPos.y) * smoothingFactor;
        
        // Apply momentum with limits
        newX += limitMotion(momentum.x, 0.8);
        newY += limitMotion(momentum.y, 0.8);

        // Store positions for next frame
        dancer.lastPositions[partName] = { x: newX, y: newY };
        dancer.momentum[partName] = momentum;

        return { x: newX, y: newY };
    }

    drawFigure(dancer) {
        const scale = Math.min(this.canvas.width, this.canvas.height) / 8;

        // Calculate all body part positions
        const head = this.calculatePosition(
            dancer.baseX, dancer.baseY - scale * 2,
            scale * 0.2, dancer.phase, 'head', dancer
        );

        const spine = this.calculatePosition(
            dancer.baseX, dancer.baseY - scale,
            scale * 0.15, dancer.phase + Math.PI / 6, 'spine', dancer
        );

        const hips = this.calculatePosition(
            dancer.baseX, dancer.baseY,
            scale * 0.15, dancer.phase + Math.PI / 4, 'hips', dancer
        );

        // Enhanced arm positions with elbow joints
        const leftShoulder = this.calculatePosition(
            head.x - scale * 0.3, head.y + scale * 0.3,
            scale * 0.3, dancer.phase + Math.PI / 2, 'leftShoulder', dancer
        );

        const rightShoulder = this.calculatePosition(
            head.x + scale * 0.3, head.y + scale * 0.3,
            scale * 0.3, dancer.phase - Math.PI / 2, 'rightShoulder', dancer
        );

        const leftElbow = this.calculatePosition(
            leftShoulder.x - scale * 0.1, leftShoulder.y + scale * 0.5,
            scale * 0.4, dancer.phase + Math.PI / 2.5, 'leftElbow', dancer
        );

        const rightElbow = this.calculatePosition(
            rightShoulder.x + scale * 0.1, rightShoulder.y + scale * 0.5,
            scale * 0.4, dancer.phase - Math.PI / 2.5, 'rightElbow', dancer
        );

        const leftHand = this.calculatePosition(
            leftElbow.x, leftElbow.y + scale * 0.5,
            scale * 0.5, dancer.phase + Math.PI / 3, 'leftHand', dancer
        );

        const rightHand = this.calculatePosition(
            rightElbow.x, rightElbow.y + scale * 0.5,
            scale * 0.5, dancer.phase - Math.PI / 3, 'rightHand', dancer
        );

        // Enhanced leg positions with knee joints
        const leftHip = this.calculatePosition(
            hips.x - scale * 0.2, hips.y,
            scale * 0.1, dancer.phase + Math.PI * 0.6, 'leftHip', dancer
        );

        const rightHip = this.calculatePosition(
            hips.x + scale * 0.2, hips.y,
            scale * 0.1, dancer.phase - Math.PI * 0.6, 'rightHip', dancer
        );

        const leftKnee = this.calculatePosition(
            leftHip.x - scale * 0.1, leftHip.y + scale * 0.8,
            scale * 0.3, dancer.phase + Math.PI * 0.6, 'leftKnee', dancer
        );

        const rightKnee = this.calculatePosition(
            rightHip.x + scale * 0.1, rightHip.y + scale * 0.8,
            scale * 0.3, dancer.phase - Math.PI * 0.6, 'rightKnee', dancer
        );

        const leftFoot = this.calculatePosition(
            leftKnee.x, leftKnee.y + scale * 0.7,
            scale * 0.4, dancer.phase + Math.PI * 0.7, 'leftFoot', dancer
        );

        const rightFoot = this.calculatePosition(
            rightKnee.x, rightKnee.y + scale * 0.7,
            scale * 0.4, dancer.phase - Math.PI * 0.7, 'rightFoot', dancer
        );

        // Set up drawing style
        this.ctx.save();
        this.ctx.strokeStyle = dancer.color;
        this.ctx.lineWidth = scale * 0.06;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';

        // Draw head
        this.ctx.beginPath();
        this.ctx.arc(head.x, head.y, scale * 0.22, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw neck and spine
        this.ctx.beginPath();
        this.ctx.moveTo(head.x, head.y + scale * 0.22);
        this.ctx.bezierCurveTo(
            spine.x, head.y + scale * 0.4,
            spine.x, spine.y - scale * 0.2,
            spine.x, spine.y
        );
        this.ctx.lineTo(hips.x, hips.y);
        this.ctx.stroke();

        // Draw shoulders
        this.ctx.beginPath();
        this.ctx.moveTo(leftShoulder.x, leftShoulder.y);
        this.ctx.lineTo(rightShoulder.x, rightShoulder.y);
        this.ctx.stroke();

        // Draw hips
        this.ctx.beginPath();
        this.ctx.moveTo(leftHip.x, leftHip.y);
        this.ctx.lineTo(rightHip.x, rightHip.y);
        this.ctx.stroke();

        // Draw arms
        this.drawLimb(leftShoulder, leftElbow, leftHand, scale);
        this.drawLimb(rightShoulder, rightElbow, rightHand, scale);

        // Draw legs
        this.drawLimb(leftHip, leftKnee, leftFoot, scale);
        this.drawLimb(rightHip, rightKnee, rightFoot, scale);

        this.ctx.restore();
    }

    drawLimb(start, middle, end, scale) {
        // Draw the main limb with smooth curves
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        
        // Calculate control points for natural curve
        const cp1x = start.x + (middle.x - start.x) * 0.9;
        const cp1y = start.y + (middle.y - start.y) * 0.3;
        const cp2x = middle.x + (end.x - middle.x) * 0.1;
        const cp2y = middle.y + (end.y - middle.y) * 0.3;

        // Draw first segment
        this.ctx.quadraticCurveTo(cp1x, cp1y, middle.x, middle.y);
        
        // Draw second segment
        this.ctx.moveTo(middle.x, middle.y);
        this.ctx.quadraticCurveTo(cp2x, cp2y, end.x, end.y);
        
        this.ctx.stroke();

        // Draw small dots for joints
        const jointRadius = scale * 0.04;
        this.ctx.beginPath();
        this.ctx.arc(middle.x, middle.y, jointRadius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    draw() {
        if (!this.trailEnabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = `rgba(${parseInt(this.backgroundColor.slice(1,3), 16)}, 
                                      ${parseInt(this.backgroundColor.slice(3,5), 16)}, 
                                      ${parseInt(this.backgroundColor.slice(5,7), 16)}, 0.1)`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.dancers.forEach(dancer => {
            this.ctx.strokeStyle = dancer.color;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.drawFigure(dancer);
        });

        if (this.recording && this.gif) {
            this.gif.addFrame(this.ctx, {copy: true, delay: 50});
        }
    }

    startRecording() {
        if (this.recording) return;
        
        this.gif = new GIF({
            workers: 2,
            quality: 10,
            width: this.canvas.width,
            height: this.canvas.height
        });

        this.recording = true;
        setTimeout(() => this.stopRecording(), 3000); // Record for 3 seconds
    }

    stopRecording() {
        if (!this.recording) return;
        
        this.recording = false;
        this.gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dance-animation.gif';
            a.click();
            URL.revokeObjectURL(url);
        });
        this.gif.render();
    }

    saveAsImage() {
        const link = document.createElement('a');
        link.download = 'dance-snapshot.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    shareConfiguration() {
        const config = {
            speed: this.speed,
            amplitude: this.amplitude,
            sinWeight: this.sinWeight,
            cosWeight: this.cosWeight,
            tanWeight: this.tanWeight,
            figureColor: this.figureColor,
            backgroundColor: this.backgroundColor,
            trailEnabled: this.trailEnabled,
            rainbowMode: this.rainbowMode,
            dancerCount: this.dancers.length
        };

        const url = new URL(window.location.href);
        url.search = new URLSearchParams({config: JSON.stringify(config)}).toString();
        
        navigator.clipboard.writeText(url.toString())
            .then(() => alert('Configuration URL copied to clipboard!'))
            .catch(() => alert('Failed to copy URL. Please try again.'));
    }

    animate() {
        this.time += 0.05 * this.speed;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the animation when the page loads
window.addEventListener('load', () => {
    const animation = new DanceAnimation();
    
    // Check for shared configuration in URL
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
        try {
            const config = JSON.parse(configParam);
            animation.speed = config.speed;
            animation.amplitude = config.amplitude;
            animation.sinWeight = config.sinWeight;
            animation.cosWeight = config.cosWeight;
            animation.tanWeight = config.tanWeight;
            animation.figureColor = config.figureColor;
            animation.backgroundColor = config.backgroundColor;
            animation.trailEnabled = config.trailEnabled;
            animation.rainbowMode = config.rainbowMode;
            
            // Update UI controls
            document.getElementById('speed').value = config.speed;
            document.getElementById('amplitude').value = config.amplitude;
            document.getElementById('sinWeight').value = config.sinWeight;
            document.getElementById('cosWeight').value = config.cosWeight;
            document.getElementById('tanWeight').value = config.tanWeight;
            document.getElementById('figureColor').value = config.figureColor;
            document.getElementById('backgroundColor').value = config.backgroundColor;
            document.getElementById('enableTrail').checked = config.trailEnabled;
            document.getElementById('rainbowMode').checked = config.rainbowMode;
            
            // Add dancers
            for (let i = 1; i < config.dancerCount; i++) {
                animation.dancers.push(new Dancer(0, 0, Math.PI * 2 * Math.random(), 
                    config.rainbowMode ? animation.getRandomColor() : config.figureColor));
            }
            animation.repositionDancers();
        } catch (e) {
            console.error('Failed to load shared configuration:', e);
        }
    }
}); 