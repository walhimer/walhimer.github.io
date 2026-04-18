const CONFIG = {
  complexity: 7,
  lineWeight: 1.5,
  stepMs: 22,
  showCircles: true,
  showCubes: true,
  showArrows: true,
  showZigzags: true,
  showDots: true,
  showText: true,
  showGrid: true,
  showElevation: true
};

let elevationY = 0;
let drawQueue = [];
let currentStep = 0;
let lastStepMs = 0;
var noteAssignments = [];

/** If the piano script fails to load, these stubs keep the drawing alive (silent). */
(function ensurePianoApi() {
  if (typeof shufflePool !== "function") {
    window.shufflePool = function () {
      var pool = ["C4", "D4", "E4", "G4", "A4", "C3", "D3", "E3", "G3", "A3"];
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      return pool;
    };
  }
  if (typeof playNote !== "function") {
    window.playNote = function () {};
  }
})();

const techWords = [
  "VOID", "SUSPENDED", "FLOW", "FIELD", "ZONE", "AXIS",
  "VECTOR", "NODE", "CONNECTION", "CIRCUIT", "MODULE",
  "STRUCTURE", "TENSION", "BALANCE", "SEQUENCE", "THRESHOLD",
  "GRADIENT", "INTERFACE", "MEMBRANE", "PATHWAY", "GRID"
];

function setup() {
  if (typeof window.__VISIBLE_SEED__ === 'number') {
    randomSeed(window.__VISIBLE_SEED__);
    noiseSeed(window.__VISIBLE_SEED__ | 0);
  }
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  pixelDensity(1);
  generateNew();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateNew();
}

function enqueue(fn) {
  drawQueue.push(fn);
}

/** One straight segment */
function enqueueLine(x1, y1, x2, y2, strokeW, strokeFn) {
  enqueue(() => {
    push();
    strokeFn();
    strokeWeight(strokeW);
    line(x1, y1, x2, y2);
    pop();
  });
}

function strokeGrid() {
  stroke(255, 40);
}
function strokeMain() {
  stroke(255);
}
function strokeDim() {
  stroke(255, 120);
}
function strokeParallel() {
  stroke(255, 150);
}
/** Circle outline: many small chords */
function enqueueCircleOutline(cx, cy, d, strokeW) {
  let r = d * 0.5;
  let segs = constrain(max(8, int(d / 3)), 8, 56);
  for (let i = 0; i < segs; i++) {
    let t0 = (i / segs) * TWO_PI;
    let t1 = ((i + 1) / segs) * TWO_PI;
    let x0 = cx + cos(t0) * r;
    let y0 = cy + sin(t0) * r;
    let x1 = cx + cos(t1) * r;
    let y1 = cy + sin(t1) * r;
    enqueueLine(x0, y0, x1, y1, strokeW, strokeMain);
  }
}

/** Rotated ellipse outline as short segments */
function enqueueEllipseOutline(cx, cy, w, h, rot, strokeW) {
  let segs = 28;
  for (let i = 0; i < segs; i++) {
    let t0 = (i / segs) * TWO_PI;
    let t1 = ((i + 1) / segs) * TWO_PI;
    let ax0 = (w * 0.5) * cos(t0);
    let ay0 = (h * 0.5) * sin(t0);
    let ax1 = (w * 0.5) * cos(t1);
    let ay1 = (h * 0.5) * sin(t1);
    let x0 = cx + ax0 * cos(rot) - ay0 * sin(rot);
    let y0 = cy + ax0 * sin(rot) + ay0 * cos(rot);
    let x1 = cx + ax1 * cos(rot) - ay1 * sin(rot);
    let y1 = cy + ax1 * sin(rot) + ay1 * cos(rot);
    enqueueLine(x0, y0, x1, y1, strokeW, strokeMain);
  }
}

function quadBezierPoint(t, x0, y0, cx, cy, x1, y1) {
  let u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1
  };
}

function enqueueCircleClusterSteps() {
  let x = random(width * 0.2, width * 0.8);
  let count = int(random(2, 6));
  let onElevation = CONFIG.showElevation && random() < 0.3;

  for (let i = 0; i < count; i++) {
    let r = random(20, 80);
    let offsetX = random(-30, 30);
    let offsetY = random(-30, 30);
    let cyBase;
    if (onElevation) {
      cyBase = elevationY - r/2;
      offsetY = random(-10, 0);
    } else {
      cyBase = random(height * 0.2, height * 0.8);
    }
    let cx = x + offsetX;
    let cy = cyBase + offsetY;

    enqueueCircleOutline(cx, cy, r, CONFIG.lineWeight);

    if (random() < 0.3) {
      let rd = r * 0.6;
      enqueue(() => {
        push();
        fill(200);
        noStroke();
        circle(cx, cy, rd);
        pop();
      });
    }
  }
}

function enqueueOvalSteps() {
  let cx = random(width * 0.2, width * 0.8);
  let cy = random(height * 0.2, height * 0.8);
  let rot = random(TWO_PI);
  let w = random(40, 120);
  let h = random(20, 60);
  enqueueEllipseOutline(cx, cy, w, h, rot, CONFIG.lineWeight);
}

function enqueueRectPatternSteps() {
  let x = random(width * 0.1, width * 0.9);
  let w = random(50, 150);
  let h = random(50, 150);
  let y;
  if (CONFIG.showElevation && random() < 0.5) {
    y = elevationY - h;
  } else {
    y = random(height * 0.1, height * 0.9);
  }

  enqueueLine(x, y, x + w, y, CONFIG.lineWeight, strokeMain);
  enqueueLine(x + w, y, x + w, y + h, CONFIG.lineWeight, strokeMain);
  enqueueLine(x + w, y + h, x, y + h, CONFIG.lineWeight, strokeMain);
  enqueueLine(x, y + h, x, y, CONFIG.lineWeight, strokeMain);

  if (random() < 0.5) {
    enqueueLine(x, y + h/2, x + w, y + h/2, CONFIG.lineWeight, strokeMain);
  }
  if (random() < 0.5) {
    enqueueLine(x + w/2, y, x + w/2, y + h, CONFIG.lineWeight, strokeMain);
  }
}

function enqueueLinearPatternSteps() {
  let x1 = random(width * 0.1, width * 0.9);
  let y1 = random(height * 0.1, height * 0.9);
  let x2 = random(width * 0.1, width * 0.9);
  let y2 = random(height * 0.1, height * 0.9);

  enqueueLine(x1, y1, x2, y2, CONFIG.lineWeight, strokeMain);

  if (random() < 0.6) {
    let angle = atan2(y2 - y1, x2 - x1);
    let perpAngle = angle + PI/2;
    let spacing = 10;
    for (let i = 1; i <= 2; i++) {
      let ox = cos(perpAngle) * spacing * i;
      let oy = sin(perpAngle) * spacing * i;
      enqueueLine(x1 + ox, y1 + oy, x2 + ox, y2 + oy, CONFIG.lineWeight, strokeParallel);
    }
  }
}

function enqueueCurvePatternSteps() {
  let x1 = random(width * 0.1, width * 0.9);
  let y1 = random(height * 0.1, height * 0.9);
  let x2 = random(width * 0.1, width * 0.9);
  let y2 = random(height * 0.1, height * 0.9);
  let cx = (x1 + x2) / 2 + random(-100, 100);
  let cy = (y1 + y2) / 2 + random(-100, 100);

  let samples = 28;
  for (let i = 0; i < samples; i++) {
    let t0 = i / samples;
    let t1 = (i + 1) / samples;
    let p0 = quadBezierPoint(t0, x1, y1, cx, cy, x2, y2);
    let p1 = quadBezierPoint(t1, x1, y1, cx, cy, x2, y2);
    enqueueLine(p0.x, p0.y, p1.x, p1.y, CONFIG.lineWeight, strokeMain);
  }
}

function enqueuePerspectiveSteps() {
  let vanishX = random(width * 0.3, width * 0.7);
  let vanishY = random(height * 0.3, height * 0.7);
  let n = int(random(3, 6));
  for (let i = 0; i < n; i++) {
    let sx = random(width);
    let sy = random(height);
    enqueueLine(sx, sy, vanishX, vanishY, CONFIG.lineWeight, strokeDim);
  }
}

function enqueueIsometricCubeSteps() {
  let x = random(width * 0.2, width * 0.8);
  let size = random(30, 80);
  let y = elevationY - size;
  let angle1 = radians(30);
  let angle2 = radians(150);

  let topCenter = { x: x, y: y };
  let topRight = { x: x + cos(angle1) * size, y: y + sin(angle1) * size };
  let topLeft = { x: x + cos(angle2) * size, y: y + sin(angle2) * size };
  let far = {
    x: x + cos(angle1) * size + cos(angle2) * size,
    y: y + sin(angle1) * size + sin(angle2) * size
  };
  let bottomCenter = { x: x, y: y + size };
  let bottomRight = { x: topRight.x, y: topRight.y + size };
  let bottomLeft = { x: topLeft.x, y: topLeft.y + size };

  let w = CONFIG.lineWeight;

  enqueueLine(topCenter.x, topCenter.y, topRight.x, topRight.y, w, strokeMain);
  enqueueLine(topCenter.x, topCenter.y, topLeft.x, topLeft.y, w, strokeMain);
  enqueueLine(topLeft.x, topLeft.y, far.x, far.y, w, strokeMain);
  enqueueLine(topRight.x, topRight.y, far.x, far.y, w, strokeMain);
  enqueueLine(topCenter.x, topCenter.y, bottomCenter.x, bottomCenter.y, w, strokeMain);
  enqueueLine(topRight.x, topRight.y, bottomRight.x, bottomRight.y, w, strokeMain);
  enqueueLine(topLeft.x, topLeft.y, bottomLeft.x, bottomLeft.y, w, strokeMain);
  enqueueLine(bottomCenter.x, bottomCenter.y, bottomRight.x, bottomRight.y, w, strokeMain);
  enqueueLine(bottomCenter.x, bottomCenter.y, bottomLeft.x, bottomLeft.y, w, strokeMain);

  if (random() < 0.4) {
    enqueue(() => {
      push();
      fill(100);
      noStroke();
      beginShape();
      vertex(topRight.x, topRight.y);
      vertex(bottomRight.x, bottomRight.y);
      vertex(bottomCenter.x, bottomCenter.y);
      vertex(topCenter.x, topCenter.y);
      endShape(CLOSE);
      pop();
    });
  }
}

function enqueueArrowSteps() {
  let x1 = random(width * 0.2, width * 0.8);
  let y1 = random(height * 0.2, height * 0.8);
  let len = random(40, 100);
  let angle = random(TWO_PI);
  let x2 = x1 + cos(angle) * len;
  let y2 = y1 + sin(angle) * len;
  let arrowSize = 12;
  let arrowAngle = PI / 6;

  enqueueLine(x1, y1, x2, y2, CONFIG.lineWeight, strokeMain);
  enqueueLine(
    x2, y2,
    x2 - arrowSize * cos(angle - arrowAngle),
    y2 - arrowSize * sin(angle - arrowAngle),
    CONFIG.lineWeight, strokeMain
  );
  enqueueLine(
    x2, y2,
    x2 - arrowSize * cos(angle + arrowAngle),
    y2 - arrowSize * sin(angle + arrowAngle),
    CONFIG.lineWeight, strokeMain
  );
}

function enqueueZigzagSteps() {
  let x = random(width * 0.2, width * 0.8);
  let y = random(height * 0.2, height * 0.8);
  let isVertical = random() < 0.5;
  let count = int(random(5, 12));
  let amplitude = random(8, 15);
  let spacing = random(5, 12);

  let verts = [];
  for (let i = 0; i < count; i++) {
    if (isVertical) {
      verts.push({
        x: x + (i % 2 === 0 ? amplitude : -amplitude),
        y: y + i * spacing
      });
    } else {
      verts.push({
        x: x + i * spacing,
        y: y + (i % 2 === 0 ? amplitude : -amplitude)
      });
    }
  }
  for (let i = 0; i < verts.length - 1; i++) {
    let a = verts[i];
    let b = verts[i + 1];
    enqueueLine(a.x, a.y, b.x, b.y, CONFIG.lineWeight, strokeMain);
  }
}

function enqueueDotPatternSteps() {
  let x = random(width * 0.1, width * 0.9);
  let y = random(height * 0.1, height * 0.9);
  let count = int(random(3, 8));
  let isVertical = random() < 0.5;
  let spacing = 8;
  let d = 4;

  for (let i = 0; i < count; i++) {
    let cx = isVertical ? x : x + i * spacing;
    let cy = isVertical ? y + i * spacing : y;
    enqueueCircleOutline(cx, cy, d, 0.8);
  }
}

function enqueueTextLabelSteps() {
  let x = random(width * 0.1, width * 0.8);
  let y = random(height * 0.1, height * 0.9);
  let word = random(techWords);
  let ts = random(10, 14);
  let doUnderline = random() < 0.3;

  enqueue(() => {
    push();
    fill(255);
    noStroke();
    textFont('Courier Prime');
    textSize(ts);
    text(word, x, y);
    pop();
  });

  if (doUnderline) {
    enqueue(() => {
      push();
      textFont('Courier Prime');
      textSize(ts);
      let tw = textWidth(word);
      stroke(255);
      strokeWeight(0.5);
      line(x, y + 2, x + tw, y + 2);
      pop();
    });
  }
}

function updateTimelineFade() {
  var wrap = document.getElementById('emergent-dna-wrap');
  if (!wrap || !drawQueue.length) return;
  var p = Math.min(1, currentStep / drawQueue.length);
  var fadeStart = 0.72;
  var op = 1;
  if (p >= fadeStart) {
    op = 1 - ((p - fadeStart) / (1 - fadeStart)) * 0.58;
  }
  wrap.style.opacity = op;
}

function updateLifeBar() {
  var bar = document.getElementById('lifebar');
  if (!bar || !drawQueue.length) return;
  var pct = (currentStep / drawQueue.length) * 100;
  bar.style.width = pct + '%';
  updateTimelineFade();
}

function appendEmergentDna(noteName) {
  var el = document.getElementById('emergent-dna');
  if (!el) return;
  var s = el.textContent === '—' ? '' : el.textContent + ' · ';
  s += noteName;
  if (s.length > 280) s = s.slice(-280);
  el.textContent = s;
}

function buildQueue() {
  drawQueue = [];
  elevationY = height * 0.7;

  let complexity = CONFIG.complexity;

  if (CONFIG.showGrid) {
    let spacing = min(width, height) / random(8, 12);
    for (let gx = 0; gx < width; gx += spacing) {
      let x0 = gx;
      enqueueLine(x0, 0, x0, height, 0.5, strokeGrid);
    }
    for (let gy = 0; gy < height; gy += spacing) {
      let y0 = gy;
      enqueueLine(0, y0, width, y0, 0.5, strokeGrid);
    }
  }

  if (CONFIG.showElevation) {
    enqueueLine(0, elevationY, width, elevationY, CONFIG.lineWeight * 1.5, strokeMain);

    let tickSpacing = width / 8;
    for (let tx = tickSpacing; tx < width; tx += tickSpacing) {
      enqueueLine(tx, elevationY - 5, tx, elevationY + 5, CONFIG.lineWeight * 1.5, strokeMain);
    }

    let hatchSpacing = 15;
    for (let hx = 0; hx < width; hx += hatchSpacing) {
      enqueueLine(hx, elevationY + 2, hx - 8, elevationY + 12, 0.5, () => stroke(255, 100));
    }
  }

  for (let i = 0; i < complexity; i++) {
    let type = random(['circle', 'oval', 'rect', 'line', 'curve', 'perspective']);

    switch(type) {
      case 'circle':
        if (CONFIG.showCircles) enqueueCircleClusterSteps();
        break;
      case 'oval':
        if (CONFIG.showCircles) enqueueOvalSteps();
        break;
      case 'rect':
        enqueueRectPatternSteps();
        break;
      case 'line':
        enqueueLinearPatternSteps();
        break;
      case 'curve':
        enqueueCurvePatternSteps();
        break;
      case 'perspective':
        enqueuePerspectiveSteps();
        break;
    }
  }

  if (CONFIG.showCubes) {
    for (let i = 0; i < int(random(2, 5)); i++) {
      enqueueIsometricCubeSteps();
    }
  }

  if (CONFIG.showArrows) {
    for (let i = 0; i < int(random(3, 8)); i++) {
      enqueueArrowSteps();
    }
  }

  if (CONFIG.showZigzags) {
    for (let i = 0; i < int(random(2, 5)); i++) {
      enqueueZigzagSteps();
    }
  }

  if (CONFIG.showDots) {
    for (let i = 0; i < int(random(10, 30)); i++) {
      enqueueDotPatternSteps();
    }
  }

  if (CONFIG.showText) {
    for (let i = 0; i < int(random(2, 5)); i++) {
      enqueueTextLabelSteps();
    }
  }
}

function generateNew() {
  buildQueue();
  currentStep = 0;
  lastStepMs = millis();
  noteAssignments = shufflePool();
  var dna = document.getElementById('emergent-dna');
  if (dna) dna.textContent = '—';
  var wrap = document.getElementById('emergent-dna-wrap');
  if (wrap) wrap.style.opacity = '1';
  updateLifeBar();
  loop();
}

window.resetDrawing = function () {
  if (typeof window.__VISIBLE_SEED__ === 'number') {
    randomSeed(window.__VISIBLE_SEED__);
    noiseSeed(window.__VISIBLE_SEED__ | 0);
  }
  generateNew();
};

function draw() {
  if (drawQueue.length === 0) {
    noLoop();
    return;
  }

  if (currentStep >= drawQueue.length) {
    var lb = document.getElementById('lifebar');
    if (lb) lb.style.width = '100%';
    updateTimelineFade();
    if (typeof window.__visibleFinishRun === 'function') {
      window.__visibleFinishRun();
      window.__visibleFinishRun = null;
    }
    noLoop();
    return;
  }

  if (currentStep > 0 && millis() - lastStepMs < CONFIG.stepMs) {
    return;
  }
  lastStepMs = millis();

  if (currentStep === 0) {
    background(0);
    stroke(255);
    strokeWeight(CONFIG.lineWeight);
    noFill();
  }

  drawQueue[currentStep]();
  if (window.audioReady && noteAssignments.length) {
    var note = noteAssignments[currentStep % noteAssignments.length];
    playNote(note, 0.16 + Math.random() * 0.11);
    appendEmergentDna(note);
  }
  currentStep++;
  updateLifeBar();
}
