import * as THREE from 'three';
import gsap from 'gsap';

// Ashima Arts 3D simplex noise
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
${NOISE}
uniform float uTime; uniform float uMorph; uniform float uIntro; uniform float uPixel; uniform float uSize;
uniform vec2 uMouse; uniform float uMouseStrength; uniform float uAspect;
attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4; attribute vec3 aRand;
varying float vMix; varying float vAlpha;

vec3 pick(float i){
  if(i<0.5) return aP0; if(i<1.5) return aP1; if(i<2.5) return aP2; if(i<3.5) return aP3; if(i<4.5) return aP4; return aP0;
}
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}

void main(){
  float seg=floor(uMorph); float t=smoothstep(0.0,1.0,uMorph-seg);
  vec3 p=mix(pick(seg),pick(min(seg+1.0,5.0)),t);

  // organic motion
  float n=snoise(p*0.55+vec3(0.0,uTime*0.05,aRand.x*3.0));
  float n2=snoise(p*1.3-vec3(uTime*0.035,0.0,aRand.y*3.0));
  p+=normalize(p+vec3(1e-4))*(n*0.20+n2*0.07)*(0.5+aRand.z);
  p.xz*=rot(uTime*0.02+p.y*0.04);

  // intro: explode in from far
  vec3 far=(aRand-0.5)*16.0;
  p=mix(far,p,smoothstep(0.0,1.0,uIntro));

  vec4 mv=modelViewMatrix*vec4(p,1.0);
  vec4 clip=projectionMatrix*mv;

  // mouse repulsion in screen space
  vec2 ndc=clip.xy/clip.w; vec2 d=ndc-uMouse; d.x*=uAspect;
  float f=exp(-dot(d,d)*14.0)*uMouseStrength;
  vec2 dir=normalize(d+vec2(1e-4)); dir.x/=uAspect;
  clip.xy+=dir*f*0.22*clip.w;

  gl_Position=clip;
  float size=uSize*uPixel*(0.45+aRand.y*0.9)*(1.0+f*1.4);
  gl_PointSize=size*(6.0/-mv.z);

  vMix=clamp(0.5+0.5*sin(p.y*0.7+p.x*0.45+uTime*0.07+aRand.z*6.2831),0.0,1.0);
  vAlpha=(0.4+0.45*aRand.x)*smoothstep(0.0,0.35,uIntro);
}`;

const FRAG = /* glsl */ `
uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uColC; uniform float uOpacity;
varying float vMix; varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5);
  float a=smoothstep(0.5,0.0,d); a=pow(a,1.25);
  vec3 col=mix(uColA,uColB,vMix);
  col=mix(col,uColC,smoothstep(0.78,1.0,vMix)*0.55);
  col=mix(vec3(dot(col,vec3(0.333))),col,1.08);
  gl_FragColor=vec4(col,a*vAlpha*uOpacity*1.0);
}`;

function fib(i, n) { // fibonacci sphere direction
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = Math.PI * (3 - Math.sqrt(5)) * i;
  return [Math.cos(th) * r, y, Math.sin(th) * r];
}

function buildShapes(n) {
  const S = [0, 1, 2, 3, 4].map(() => new Float32Array(n * 3));
  const rnd = Math.random;
  for (let i = 0; i < n; i++) {
    const k = i * 3;
    // 0: sphere shell
    const [dx, dy, dz] = fib(i, n);
    const R = 2.05 + (rnd() - 0.5) * 0.28;
    S[0][k] = dx * R; S[0][k + 1] = dy * R; S[0][k + 2] = dz * R;
    // 1: spiral galaxy disc
    const arm = i % 3, rr = Math.pow(rnd(), 0.6) * 3.5 + 0.15;
    const ang = rr * 1.9 + (arm * Math.PI * 2) / 3 + (rnd() - 0.5) * (0.9 / (rr * 0.6 + 0.5));
    S[1][k] = Math.cos(ang) * rr; S[1][k + 1] = (rnd() - 0.5) * 0.5 * (1.2 - rr / 4); S[1][k + 2] = Math.sin(ang) * rr;
    // 2: DNA double helix with rungs
    const t = (i / n) * 2 - 1; const y = t * 3.1; const strand = i % 2; const hA = y * 2.6 + strand * Math.PI;
    if (i % 9 === 0) { const f = rnd() * 2 - 1; S[2][k] = Math.cos(hA) * 1.25 * f; S[2][k + 1] = y; S[2][k + 2] = Math.sin(hA) * 1.25 * f; }
    else { S[2][k] = Math.cos(hA) * 1.25 + (rnd() - 0.5) * 0.18; S[2][k + 1] = y + (rnd() - 0.5) * 0.12; S[2][k + 2] = Math.sin(hA) * 1.25 + (rnd() - 0.5) * 0.18; }
    // 3: cube lattice (points on a gridded cube surface)
    const face = Math.floor(rnd() * 6), u = (Math.round((rnd() * 2 - 1) * 6) / 6) * 1.75, v = (Math.round((rnd() * 2 - 1) * 6) / 6) * 1.75, h = 1.75 * (face % 2 ? 1 : -1);
    const jit = () => (rnd() - 0.5) * 0.05;
    if (face < 2) { S[3][k] = h; S[3][k + 1] = u + jit(); S[3][k + 2] = v + jit(); }
    else if (face < 4) { S[3][k] = u + jit(); S[3][k + 1] = h; S[3][k + 2] = v + jit(); }
    else { S[3][k] = u + jit(); S[3][k + 1] = v + jit(); S[3][k + 2] = h; }
    // 4: torus
    const tu = rnd() * Math.PI * 2, tv = rnd() * Math.PI * 2, TR = 2.1, Tr = 0.85;
    S[4][k] = (TR + Tr * Math.cos(tv)) * Math.cos(tu); S[4][k + 1] = Tr * Math.sin(tv) * 1.1; S[4][k + 2] = (TR + Tr * Math.cos(tv)) * Math.sin(tu);
  }
  return S;
}

const PALETTE = {
  hero: ['#7c5cff', '#2ee6c5', '#ff5fa2'],
  about: ['#ff5fa2', '#ffd166', '#7c5cff'],
  experience: ['#2ee6c5', '#7c5cff', '#5cc8ff'],
  projects: ['#5cc8ff', '#7c5cff', '#2ee6c5'],
  skills: ['#ffd166', '#ff7a59', '#ff5fa2'],
  education: ['#ffd166', '#2ee6c5', '#7c5cff'],
  contact: ['#7c5cff', '#ff5fa2', '#2ee6c5'],
};
// morph index + group placement per section (x offset as fraction of view width; opacity; scale)
const STATE = {
  hero: { m: 0, x: 0.25, y: 0, s: 0.95, o: 0.95, camZ: 7.4, rx: 0, rz: 0 },
  about: { m: 1, x: 0.0, y: 0, s: 1.6, o: 0.55, camZ: 7.8, rx: 1.12, rz: 0.22 },
  experience: { m: 2, x: 0.36, y: 0, s: 0.9, o: 0.5, camZ: 7.6, rx: 0, rz: 0.2 },
  projects: { m: 3, x: 0.0, y: 0, s: 1.05, o: 0.28, camZ: 9.2, rx: 0.5, rz: 0.25 },
  skills: { m: 4, x: 0.0, y: 0, s: 1.3, o: 0.42, camZ: 7.8, rx: 0.9, rz: 0 },
  education: { m: 4, x: 0.0, y: 0, s: 1.3, o: 0.38, camZ: 7.8, rx: 0.9, rz: 0.1 },
  contact: { m: 5, x: 0.27, y: 0, s: 1.05, o: 0.85, camZ: 7.4, rx: 0.2, rz: 0 },
};

export function createScene(canvas, { reduced = false } = {}) {
  const isSmall = window.innerWidth < 800;
  const COUNT = reduced ? 9000 : isSmall ? 11000 : 28000;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const geo = new THREE.BufferGeometry();
  const shapes = buildShapes(COUNT);
  geo.setAttribute('position', new THREE.BufferAttribute(shapes[0], 3));
  shapes.forEach((a, i) => geo.setAttribute('aP' + i, new THREE.BufferAttribute(a, 3)));
  const rand = new Float32Array(COUNT * 3);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uIntro: { value: 0 }, uPixel: { value: dpr }, uSize: { value: 6.4 },
    uMouse: { value: new THREE.Vector2(9, 9) }, uMouseStrength: { value: 0 }, uAspect: { value: 1 },
    uColA: { value: new THREE.Color(PALETTE.hero[0]) }, uColB: { value: new THREE.Color(PALETTE.hero[1]) }, uColC: { value: new THREE.Color(PALETTE.hero[2]) },
    uOpacity: { value: 1 },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);
  const base = new THREE.Group();
  base.add(group);
  scene.add(base);

  let viewW = 1, viewH = 1;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = camera.aspect;
    const d = camera.position.z;
    viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * d;
    viewW = viewH * camera.aspect;
    applyState(current, true);
  }

  const target = { x: 0, y: 0, s: 1 };
  let current = 'hero';
  function applyState(name, instant = false) {
    const st = STATE[name]; if (!st) return;
    current = name;
    const narrow = window.innerWidth < 900;
    const px = narrow ? 0 : st.x * viewW;
    const opacity = narrow ? Math.min(st.o, name === 'hero' || name === 'contact' ? 0.45 : 0.16) : st.o;
    const dur = instant ? 0 : 3.6;
    gsap.to(uniforms.uMorph, { value: st.m, duration: dur, ease: 'power3.inOut', overwrite: true });
    gsap.to(base.position, { x: px, y: st.y, duration: dur, ease: 'power3.inOut' });
    gsap.to(base.rotation, { x: st.rx, z: st.rz, duration: dur, ease: 'power3.inOut' });
    gsap.to(base.scale, { x: st.s, y: st.s, z: st.s, duration: dur, ease: 'power3.inOut' });
    gsap.to(uniforms.uOpacity, { value: opacity, duration: dur * 0.8, ease: 'power2.out' });
    gsap.to(camera.position, { z: st.camZ, duration: dur, ease: 'power3.inOut', onUpdate: () => { if (!instant) camera.updateProjectionMatrix(); } });
    const pal = PALETTE[name];
    ['uColA', 'uColB', 'uColC'].forEach((u, i) => {
      const c = new THREE.Color(pal[i]);
      gsap.to(uniforms[u].value, { r: c.r, g: c.g, b: c.b, duration: dur, ease: 'power2.inOut' });
    });
  }

  // pointer
  const mouse = new THREE.Vector2(9, 9), mouseS = new THREE.Vector2(9, 9);
  let mActive = 0;
  window.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    mActive = 1;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { mActive = 0; });

  let scrollVel = 0, last = performance.now(), running = true, tiltX = 0, tiltY = 0;
  let lastT = performance.now();
  function frame() {
    if (!running) return;
    const nowT = performance.now(); const dt = Math.min((nowT - lastT) / 1000, 0.05); lastT = nowT;
    uniforms.uTime.value += dt * (reduced ? 0.4 : 1);
    mouseS.lerp(mouse, 0.12);
    uniforms.uMouse.value.copy(mouseS);
    uniforms.uMouseStrength.value = 0;
    // gentle parallax tilt following the pointer + scroll velocity
    const tx = mActive ? -mouse.y * 0.05 : 0, ty = mActive ? mouse.x * 0.09 : 0;
    tiltX += (tx - tiltX) * 0.05; tiltY += (ty - tiltY) * 0.05;
    group.rotation.x = tiltX + scrollVel * 0.0004;
    group.rotation.y = tiltY + uniforms.uTime.value * 0.03;
    scrollVel *= 0.92;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { lastT = performance.now(); requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);

  return {
    uniforms,
    setSection: (name) => applyState(name),
    intro: () => gsap.to(uniforms.uIntro, { value: 1, duration: reduced ? 0.01 : 2.8, ease: 'power3.out' }),
    onScroll: (v) => { scrollVel = v; },
  };
}
