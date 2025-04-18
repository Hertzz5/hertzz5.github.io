
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

        
        const anchor = document.createElement('a');
        anchor.classList.add('link-item');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';

      
        const iconEl = document.createElement('i');
        iconEl.className = iconClass;

        
        const textSpan = document.createElement('span');
        textSpan.textContent = title;

        
        anchor.appendChild(iconEl);
        anchor.appendChild(textSpan);
        linksContainer.appendChild(anchor);
      });
    })
    .catch((error) => {
      console.error('Error loading socials:', error);
    });
}


let canvas, ctx;
const shapes = [];
const shapeCount = 60; // Number of shapes
let mouseX = -9999, mouseY = -9999;


let mouseDownStart = 0;

const shapeColors = [
  '#7ad5bc', '#f8923c', '#69f6ff', '#827f84',
  '#ee8f94', '#00ffff', '#ffff00', '#ff00ff'
];
const shapeTypes = [ 'circle', 'square', 'triangle', 'plus', 'line' ];


const mouseRadius = 400;        
const mouseRepelStrength = 2.5; 
const shapeRepelMultiplier = 2.0; 

class Shape {
  constructor() {
    
    this.type = randomFromArray(shapeTypes);
    this.color = randomFromArray(shapeColors);

    
    this.x = Math.random() * innerWidth;
    this.y = Math.random() * innerHeight;

    
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 0.5;

   
    this.size = Math.random() * canvas.width / 30 + 15;

    
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.ax = (Math.random() - 0.5) * 0.02;
    this.ay = (Math.random() - 0.5) * 0.02;

    
    this.maxSpeed = 2.5;
    this.minSpeed = 0.3;
  }

  
  boostMotion(holdDuration) {
    
    let factor = holdDuration / 300;
    
    factor = Math.min(factor, 10); 

    
    this.vx = (Math.random() - 0.5) * 2 * factor;
    this.vy = (Math.random() - 0.5) * 2 * factor;

    
    this.ax = (Math.random() - 0.5) * 0.02 * factor;
    this.ay = (Math.random() - 0.5) * 0.02 * factor;

    
    this.rotationSpeed = (Math.random() - 0.5) * 0.5 * factor;
  }

  update(shapes) {
    
    this.vx += this.ax;
    this.vy += this.ay;

   
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

   
    const wanderStrength = 0.0008;
    this.vx += (Math.random() - 0.5) * wanderStrength;
    this.vy += (Math.random() - 0.5) * wanderStrength;

    
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
        
        this.x -= ux * push * shapeRepelMultiplier;
        this.y -= uy * push * shapeRepelMultiplier;
        other.x += ux * push * shapeRepelMultiplier;
        other.y += uy * push * shapeRepelMultiplier;
      }
    }

    
    this.x += this.vx;
    this.y += this.vy;

    
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


function setupCanvas() {
  canvas = document.getElementById('arcade-canvas');
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  
  for (let i = 0; i < shapeCount; i++) {
    shapes.push(new Shape());
  }

  
  requestAnimationFrame(animate);
}


function onMouseDown() {
  mouseDownStart = Date.now();
}

function onMouseUp() {
  
  const holdDuration = Date.now() - mouseDownStart;
  
  shapes.forEach(shape => {
    shape.boostMotion(holdDuration);
  });
}


function animate() {
  
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].update(shapes);
    shapes[i].draw(ctx);
  }

  requestAnimationFrame(animate);
}


document.addEventListener('DOMContentLoaded', () => {
  loadSocialLinks();
  setupCanvas();

  
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
});
