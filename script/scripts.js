/************************
 * 1) Load Social Links
 ************************/
function loadSocialLinks() {
  const linksContainer = document.getElementById('links-container');
  const socialsFilePath = 'socials.txt';

  fetch(socialsFilePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Could not load socials.txt');
      }
      return response.text();
    })
    .then((data) => {
      const lines = data.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const parts = trimmed.split(',');
        if (parts.length < 3) return;

        const iconClass = parts[0].trim();
        const title = parts[1].trim();
        const url = parts[2].trim();

        // Create clickable <a>
        const anchor = document.createElement('a');
        anchor.classList.add('link-item');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';

        // Icon
        const iconEl = document.createElement('i');
        iconEl.className = iconClass;

        // Text
        const textSpan = document.createElement('span');
        textSpan.textContent = title;

        // Combine
        anchor.appendChild(iconEl);
        anchor.appendChild(textSpan);
        linksContainer.appendChild(anchor);
      });
    })
    .catch((error) => {
      console.error('Error loading socials:', error);
    });
}

/************************
 * 2) Animated Arcade Background
 ************************/
let canvas, ctx;
const shapes = [];
const shapeCount = 60; // Number of shapes
let mouseX = -9999, mouseY = -9999;

// We'll track mouse hold time
let mouseDownStart = 0;

const shapeColors = [
  '#7ad5bc', '#f8923c', '#69f6ff', '#827f84',
  '#ee8f94', '#00ffff', '#ffff00', '#ff00ff'
];
const shapeTypes = [ 'circle', 'square', 'triangle', 'plus', 'line' ];

// Repulsion constants
const mouseRadius = 400;        // Mouse repel radius
const mouseRepelStrength = 2.5; // Mouse repel force
const shapeRepelMultiplier = 2.0; // How strongly shapes repel each other

class Shape {
  constructor() {
    // Basic shape properties
    this.type = randomFromArray(shapeTypes);
    this.color = randomFromArray(shapeColors);

    // Position
    this.x = Math.random() * innerWidth;
    this.y = Math.random() * innerHeight;

    // Rotation
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 0.5;

    // Size (treat as radius for collisions)
    this.size = Math.random() * canvas.width / 30 + 15;

    // Velocity & Acceleration
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.ax = (Math.random() - 0.5) * 0.02;
    this.ay = (Math.random() - 0.5) * 0.02;

    // Speed limits
    this.maxSpeed = 2.5;
    this.minSpeed = 0.3;
  }

  /** 
   * Called when the mouse is released. 
   * We scale velocity, acceleration, rotation based on holdDuration.
   */
  boostMotion(holdDuration) {
    // For example, let’s convert holdDuration (ms) into a factor
    // by dividing by 300. You can tweak or clamp this as you like.
    let factor = holdDuration / 300;
    // Optionally clamp it so it doesn't get too huge:
    factor = Math.min(factor, 10); // e.g. max factor of 10

    // Random direction, scaled by the factor
    this.vx = (Math.random() - 0.5) * 2 * factor;
    this.vy = (Math.random() - 0.5) * 2 * factor;

    // Accelerations also scaled
    this.ax = (Math.random() - 0.5) * 0.02 * factor;
    this.ay = (Math.random() - 0.5) * 0.02 * factor;

    // Rotation speed also scaled
    this.rotationSpeed = (Math.random() - 0.5) * 0.5 * factor;
  }

  update(shapes) {
    // 1) Apply acceleration
    this.vx += this.ax;
    this.vy += this.ay;

    // 2) Clamp velocity
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    } else if (speed < this.minSpeed) {
      const scale = this.minSpeed / speed;
      this.vx *= scale;
      this.vy *= scale;
    }

    // 3) Small random "wander"
    const wanderStrength = 0.0008;
    this.vx += (Math.random() - 0.5) * wanderStrength;
    this.vy += (Math.random() - 0.5) * wanderStrength;

    // 4) Mouse repulsion
    const dxMouse = this.x - mouseX;
    const dyMouse = this.y - mouseY;
    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
    if (distMouse < mouseRadius) {
      const force = (mouseRadius - distMouse) / mouseRadius;
      const ux = dxMouse / distMouse;
      const uy = dyMouse / distMouse;
      this.vx += ux * force * mouseRepelStrength;
      this.vy += uy * force * mouseRepelStrength;
    }

    // 5) Inter-shape repulsion
    for (const other of shapes) {
      if (other === this) continue;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = this.size + other.size;
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const push = overlap / 2;

        const ux = dx / dist;
        const uy = dy / dist;
        // Repel each shape
        this.x -= ux * push * shapeRepelMultiplier;
        this.y -= uy * push * shapeRepelMultiplier;
        other.x += ux * push * shapeRepelMultiplier;
        other.y += uy * push * shapeRepelMultiplier;
      }
    }

    // 6) Move
    this.x += this.vx;
    this.y += this.vy;

    // 7) Bounce off walls (flip velocity)
    if (this.x - this.size < 0) {
      this.x = this.size;
      this.vx = -Math.abs(this.vx);
    }
    if (this.x + this.size > canvas.width) {
      this.x = canvas.width - this.size;
      this.vx = Math.abs(this.vx) * -1;
    }

    if (this.y - this.size < 0) {
      this.y = this.size;
      this.vy = -Math.abs(this.vy);
    }
    if (this.y + this.size > canvas.height) {
      this.y = canvas.height - this.size;
      this.vy = Math.abs(this.vy) * -1;
    }

    // 8) Rotation
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((Math.PI / 180) * this.rotation);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = canvas.width / 240;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    switch (this.type) {
      case 'circle':
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.rect(-this.size, -this.size, this.size * 2, this.size * 2);
        break;
      case 'triangle':
        ctx.moveTo(0, -this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(this.size, this.size);
        ctx.closePath();
        break;
      case 'plus':
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        break;
      case 'line':
        ctx.moveTo(-this.size, -this.size);
        ctx.lineTo(this.size, this.size);
        break;
    }
    ctx.stroke();
    ctx.restore();
  }
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/***************
 * SETUP CANVAS
 ***************/
function setupCanvas() {
  canvas = document.getElementById('arcade-canvas');
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Create shapes
  for (let i = 0; i < shapeCount; i++) {
    shapes.push(new Shape());
  }

  // Animate
  requestAnimationFrame(animate);
}

/***************
 *  MOUSE DOWN / UP
 ***************/
function onMouseDown() {
  mouseDownStart = Date.now();
}

function onMouseUp() {
  // Calculate how long mouse was held
  const holdDuration = Date.now() - mouseDownStart;
  // Give each shape a “boost” based on that duration
  shapes.forEach(shape => {
    shape.boostMotion(holdDuration);
  });
}

/******************
 * ANIMATION LOOP
 ******************/
function animate() {
  // Clear background
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update & draw shapes
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].update(shapes);
    shapes[i].draw(ctx);
  }

  requestAnimationFrame(animate);
}

/************************
 * MAIN INIT
 ************************/
document.addEventListener('DOMContentLoaded', () => {
  loadSocialLinks();
  setupCanvas();

  // On mousedown, record time
  document.addEventListener('mousedown', onMouseDown);
  // On mouseup, compute hold duration -> randomize shapes more
  document.addEventListener('mouseup', onMouseUp);
});
