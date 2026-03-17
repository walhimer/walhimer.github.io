// Radial Gradient Artwork – P5.js WebGL
let gradientShader;
let c1, c2, c3;
let baseW, baseH;
let rects = [];
let depthT;
const Z_EPS = 1.0;
const RECT_COUNT = 5;

const vertShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aTexCoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

const fragShader = `
precision highp float;
varying vec2 vTexCoord;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uTime;
void main() {
  vec2 center = vec2(0.5, 0.5);
  float scale = 1.0 + 0.07 * sin(uTime);
  vec2 uv = center + (vTexCoord - center) * scale;
  float dist = distance(uv, center);
  vec3 color;
  if (dist < 0.3) {
    color = mix(uC1, uC2, dist / 0.3);
  } else {
    color = mix(uC2, uC3, (dist - 0.3) / 0.4);
  }
  gl_FragColor = vec4(color, 0.35);
}
`;

function setup() {
  pixelDensity(5);
  createCanvas(1000, 1000, WEBGL);
  gradientShader = createShader(vertShader, fragShader);
  noStroke();
  c1 = hsbToRgb(random(360), 100, 100);
  c2 = hsbToRgb(random(360), 100, 100);
  c3 = hsbToRgb(random(360), 100, 100);
  baseW = random(600, 600);
  baseH = random(600, 6000);
  depthT = random(60, 100);
  rects = [];
  for (let i = 0; i < RECT_COUNT; i++) {
    let w = baseW * random(0.4, 1.8);
    let h = baseH * random(0.4, 1.8);
    rects.push({
      w, h,
      z: (i - (RECT_COUNT - 1) / 2) * (depthT + Z_EPS)
    });
  }
}

function draw() {
  background(255);
  shader(gradientShader);
  gradientShader.setUniform("uC1", c1);
  gradientShader.setUniform("uC2", c2);
  gradientShader.setUniform("uC3", c3);
  gradientShader.setUniform("uTime", millis() * 0.0003);
  push();
  rotateY(millis() * 0.0005);
  for (let r of rects) {
    push();
    translate(0, 0, r.z);
    box(r.w, r.h, depthT);
    pop();
  }
  pop();
}

function hsbToRgb(h, s, b) {
  colorMode(HSB, 360, 100, 100);
  let c = color(h, s, b);
  colorMode(RGB, 255);
  return [red(c) / 255, green(c) / 255, blue(c) / 255];
}
