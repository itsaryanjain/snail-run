const playfield = document.getElementById("playfield");
const snail = document.getElementById("snail");
const trail = document.getElementById("trail");
const target = document.getElementById("target");
const boostBtn = document.getElementById("boost");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let position = { x: 140, y: 180 };
let goal = { ...position };
let speed = 0.06;
let boost = 1;
let paused = false;
let lastStamp = null;
let trailQueue = [];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setSnail = (point) => {
  snail.style.left = `${point.x}px`;
  snail.style.top = `${point.y}px`;
};

const setTarget = (point) => {
  target.style.left = `${point.x}px`;
  target.style.top = `${point.y}px`;
  target.classList.add("is-active");
};

const addTrailDot = (point) => {
  const dot = document.createElement("span");
  dot.style.left = `${point.x}px`;
  dot.style.top = `${point.y}px`;
  trail.appendChild(dot);
  trailQueue.push(dot);
  if (trailQueue.length > 24) {
    const old = trailQueue.shift();
    if (old) {
      old.remove();
    }
  }
};

const getPointFromEvent = (event) => {
  const rect = playfield.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: clamp(clientX - rect.left, 50, rect.width - 50),
    y: clamp(clientY - rect.top, 40, rect.height - 40),
  };
};

const update = (timestamp) => {
  if (!lastStamp) {
    lastStamp = timestamp;
  }
  const delta = timestamp - lastStamp;
  lastStamp = timestamp;

  if (!paused) {
    const dx = goal.x - position.x;
    const dy = goal.y - position.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0.5) {
      const step = delta * speed * boost;
      position.x += (dx / distance) * Math.min(step, distance);
      position.y += (dy / distance) * Math.min(step, distance);
      setSnail(position);
      addTrailDot(position);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      snail.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }
  }

  requestAnimationFrame(update);
};

const handleMove = (event) => {
  if (paused) {
    return;
  }
  const point = getPointFromEvent(event);
  goal = point;
  setTarget(point);
};

playfield.addEventListener("pointerdown", (event) => {
  handleMove(event);
});

playfield.addEventListener("pointermove", (event) => {
  if (event.pressure > 0) {
    handleMove(event);
  }
});

playfield.addEventListener("touchstart", handleMove, { passive: true });
playfield.addEventListener("touchmove", handleMove, { passive: true });

boostBtn.addEventListener("click", () => {
  boost = boost === 1 ? 2.2 : 1;
  boostBtn.textContent = boost === 1 ? "Boost" : "Chill";
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  target.classList.toggle("is-active", !paused);
});

resetBtn.addEventListener("click", () => {
  position = { x: 140, y: 180 };
  goal = { ...position };
  setSnail(position);
  trail.innerHTML = "";
  trailQueue = [];
});

setSnail(position);
requestAnimationFrame(update);
