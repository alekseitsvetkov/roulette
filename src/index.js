const sectors = Array.from({ length: 30 }, (_, i) => {
  const labelNumber = i + 1;
  let color;
  let text;

  if (labelNumber === 21) {
    color = "#4CAF50";
    text = "#FFFFFF";
  } else if (i % 2 === 0) {
    color = "#000000";
    text = "#FFFFFF";
  } else {
    color = "#FF5722";
    text = "#000";
  }

  return {
    color,
    text,
    label: `${labelNumber}`,
  };
});

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.995; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 48px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  //

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = !angVel ? "Крутить колесо" : sector.label;
  spinEl.style.fontSize = '30px';
  spinEl.style.background = '#E7BB7E';
  spinEl.style.color = '#000';
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false; // reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine
  spinEl.addEventListener("click", () => {
    if (!angVel) angVel = rand(0.15, 0.25);
    spinButtonClicked = true;
  });
}

init();

events.addListener("spinEnd", (sector) => {
  const resultEl = document.querySelector("#result");
  const winningNumber = parseInt(sector.label, 10);

  if (winningNumber === 21) {
    resultEl.innerHTML = `🎉🍰 ПОЗДРАВЛЯЕМ! Выпало число 21 - это ТОРТ! 🍰🎉`;
  } else {
    resultEl.innerHTML = `Выпало число: ${winningNumber}<br/>К сожалению, мимо. 😔`;
  }
});
