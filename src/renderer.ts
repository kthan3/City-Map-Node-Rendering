/// <reference types="@webgpu/types" />
 
import { MapKey, MAP_CONFIGS, MapConfig } from './mapdata.js';
import { Node, Edge, geo2screen }         from './graph.js';
 
// ── Public Types ──────────────────────────────────────────────
// Ripple effect that expands outward when a node is clicked
export interface Ripple {
  x: number; y: number;
  col: [number, number, number];
  r: number; a: number;  // radius and alpha
}
 
// All data passed to the renderer each frame
export interface FrameData {
  ts:         number;   // timestamp in ms
  time:       number;   // frame counter for animations
  W:          number;   // canvas width
  H:          number;   // canvas height
  nodes:      Node[];
  edges:      Edge[];
  ripples:    Ripple[];
  selectedId: number | null;
  hoveredId:  number | null;
  mapKey:     MapKey;
}
 
// The three canvas elements used for layered rendering
export interface RendererCanvases {
  bg:    HTMLCanvasElement;  // background layer
  scene: HTMLCanvasElement;  // nodes and edges layer
  gpu:   HTMLCanvasElement;  // WebGPU layer
}
 
// Public interface for the renderer — works for both WebGPU and Canvas 2D
export interface Renderer {
  mode:    'webgpu' | 'canvas2d';
  draw:    (frame: FrameData) => void;
  rebuild: (mapKey: MapKey, W: number, H: number) => void;
  resize:  (W: number, H: number) => void;
  destroy: () => void;
}
 
// ── Buffer Size Constants ─────────────────────────────────────
// Maximum number of each element the GPU buffers can hold
const MAX_NODES   = 256;
const MAX_EDGES   = 1024;
const MAX_BEAMS   = 8;
const NODE_F      = 12;  // floats per node
const EDGE_F      = 12;  // floats per edge
const BEAM_F      = 8;   // floats per beam
 
// Pack beam animation data into a flat Float32Array for the GPU
function packBeams(cfg: MapConfig): Float32Array {
  const out = new Float32Array(MAX_BEAMS * BEAM_F);
  cfg.beams.forEach((b, i) => {
    if (i >= MAX_BEAMS) return;
    const base = i * BEAM_F;
    out[base]=b.x; out[base+1]=b.w/2; out[base+2]=b.hue;
    out[base+3]=b.speed; out[base+4]=b.ph;
  });
  return out;
}
 
// Pack node position, color, radius and state into a flat Float32Array for the GPU
function packNodes(nodes: Node[], selId: number|null, hovId: number|null, time: number, W: number, H: number): Float32Array {
  const out = new Float32Array(nodes.length * NODE_F);
  nodes.forEach((n, i) => {
    const b = i * NODE_F;
    const pulse = Math.sin(time * 0.038 + n.ph) * 0.5 + 0.5;  // animated pulse value 0-1
    out[b]=n.x;   out[b+1]=n.y;  out[b+2]=n.radius; out[b+3]=pulse;
    out[b+4]=n.r[0]; out[b+5]=n.r[1]; out[b+6]=n.r[2];  // RGB color
    out[b+7]=n.id===selId?1:0;   // is this node selected?
    out[b+8]=n.id===hovId?1:0;   // is this node hovered?
    out[b+9]=W;   out[b+10]=H;   out[b+11]=0;  // canvas resolution
  });
  return out;
}
 
// Pack edge endpoint positions and state into a flat Float32Array for the GPU
function packEdges(edges: Edge[], nodes: Node[], selId: number|null, time: number, accentRGB: [number,number,number], W: number, H: number): Float32Array {
  const out = new Float32Array(edges.length * EDGE_F);
  const t = (time * 0.013) % 1;  // packet animation position 0-1
  edges.forEach(({ a, b }, i) => {
    const na=nodes[a], nb=nodes[b];
    const sel = selId!==null && (na.id===selId||nb.id===selId) ? 1 : 0;
    const base = i * EDGE_F;
    out[base]=na.x; out[base+1]=na.y; out[base+2]=nb.x; out[base+3]=nb.y;
    out[base+4]=accentRGB[0]/255; out[base+5]=accentRGB[1]/255; out[base+6]=accentRGB[2]/255;  // normalize to 0-1
    out[base+7]=sel; out[base+8]=t; out[base+9]=sel?1.5:0.8;  // selected edges are thicker
    out[base+10]=W; out[base+11]=H;
  });
  return out;
}
 
// Create a GPU buffer and immediately upload data to it
function makeBuf(device: GPUDevice, data: Float32Array, usage: GPUBufferUsageFlags): GPUBuffer {
  const buf = device.createBuffer({ size: Math.max(data.byteLength, 16), usage: usage | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(buf, 0, data);
  return buf;
}
 
// Create an empty GPU buffer to be filled later each frame
function makeDynBuf(device: GPUDevice, byteSize: number, usage: GPUBufferUsageFlags): GPUBuffer {
  return device.createBuffer({ size: Math.max(byteSize, 16), usage: usage | GPUBufferUsage.COPY_DST });
}
 
// Create a uniform buffer aligned to 16 bytes as required by WebGPU
function makeUniBuf(device: GPUDevice, byteSize: number): GPUBuffer {
  return device.createBuffer({ size: Math.ceil(byteSize/16)*16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
}
 
// Fetch a WGSL shader file from the server and compile it on the GPU
async function loadShader(device: GPUDevice, url: string): Promise<GPUShaderModule> {
  const src = await fetch(url).then(r => {
    if (!r.ok) throw new Error(`Failed to load shader ${url}: ${r.status}`);
    return r.text();
  });
  return device.createShaderModule({ code: src });
}
 
// Additive blending — colors add together, good for glowing effects
const BLEND_ADD: GPUBlendState = {
  color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
  alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' },
};
 
// Standard alpha blending — new pixels blend over existing ones
const BLEND_OVER: GPUBlendState = {
  color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
  alpha: { srcFactor: 'one',       dstFactor: 'one-minus-src-alpha', operation: 'add' },
};
 
// WebGPU renderer — currently disabled, returns null to use Canvas 2D instead
async function createWebGPURenderer(canvas: HTMLCanvasElement, mapKey: MapKey): Promise<Renderer | null> {
  return null;
}
 
// ── Canvas 2D Fallback ────────────────────────────────────────
 
// Generate 300 random star particles with position, size, speed and phase
interface StarParticle { x: number; y: number; r: number; sp: number; ph: number; }
const STARS: StarParticle[] = Array.from({ length: 300 }, () => ({
  x: Math.random(), y: Math.random() * 0.75,
  r: Math.random() * 1.5 + 0.2,
  sp: Math.random() * 0.5 + 0.1,
  ph: Math.random() * Math.PI * 2,
}));
 
// Pre-render the nebula glow blobs to an offscreen canvas for performance
// This only runs when the map changes, not every frame
function buildNebulaCache(W: number, H: number, mapKey: MapKey): HTMLCanvasElement {
  const oc = document.createElement('canvas');
  oc.width = W; oc.height = H;
  const g = oc.getContext('2d')!;
  MAP_CONFIGS[mapKey].nebula.forEach(b => {
    const cx=b.x*W, cy=b.y*H, rr=Math.max(b.rx*W, b.ry*H);
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
    grd.addColorStop(0, `hsla(${b.hue},80%,28%,${b.a})`);
    grd.addColorStop(1, `hsla(${b.hue},80%,10%,0)`);
    g.save(); g.translate(cx, cy); g.scale(b.rx*W/rr, b.ry*H/rr);
    g.beginPath(); g.arc(0, 0, rr, 0, Math.PI*2);
    g.fillStyle = grd; g.fill(); g.restore();
  });
  return oc;
}
 
// Draw the background layer — runs at ~15fps to save performance
// Draws sky gradient, nebula, animated light beams, stars, country outline and vignette
function draw2DBg(bg: CanvasRenderingContext2D, W: number, H: number, ts: number, mapKey: MapKey, nebulaCache: HTMLCanvasElement|null) {
  const cfg = MAP_CONFIGS[mapKey];
 
  // Sky gradient using the country's configured colors
  const sky = bg.createLinearGradient(0, 0, W*0.6, H);
  sky.addColorStop(0, cfg.skyColors[0]); sky.addColorStop(0.45, cfg.skyColors[1]); sky.addColorStop(1, cfg.skyColors[2]);
  bg.fillStyle = sky; bg.fillRect(0, 0, W, H);
 
  // Draw the pre-rendered nebula blobs
  if (nebulaCache) bg.drawImage(nebulaCache, 0, 0);
 
  // Draw animated light beams that slowly drift side to side
  cfg.beams.forEach(b => {
    const drift = Math.sin(ts*b.speed+b.ph)*0.055;
    const cx=(b.x+drift)*W, hw=b.w*W/2;
    const a=0.038+0.028*Math.sin(ts*b.speed*2.1+b.ph+1);
    const grd = bg.createLinearGradient(cx-hw, 0, cx+hw, 0);
    grd.addColorStop(0, `hsla(${b.hue},90%,55%,0)`);
    grd.addColorStop(0.5, `hsla(${b.hue+18},85%,70%,${a*1.5})`);
    grd.addColorStop(1, `hsla(${b.hue},90%,55%,0)`);
    bg.save(); bg.globalCompositeOperation='screen';
    bg.fillStyle=grd; bg.fillRect(cx-hw, 0, hw*2, H*0.7); bg.restore();
  });
 
  // Draw twinkling stars with a sine wave brightness animation
  STARS.forEach(s => {
    const tw = 0.3+0.7*(0.5+0.5*Math.sin(ts*s.sp*0.003+s.ph));
    bg.beginPath(); bg.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
    bg.fillStyle=`rgba(200,220,255,${tw*0.9})`; bg.fill();
  });
 
  // Draw the country outline shape from geographic coordinate data
  const path = new Path2D();
  cfg.outline.forEach(([lon,lat],i) => {
    const [x,y] = geo2screen(lat, lon, W, H, cfg);
    i===0 ? path.moveTo(x,y) : path.lineTo(x,y);
  });
  path.closePath();
 
  // Fill outline and draw grid lines inside it
  bg.save(); bg.fillStyle=cfg.fillColor; bg.fill(path); bg.clip(path);
  bg.strokeStyle=cfg.strokeCols[0]; bg.lineWidth=0.8;
  for(let x=0;x<W;x+=50){bg.beginPath();bg.moveTo(x,0);bg.lineTo(x,H);bg.stroke();}
  for(let y=0;y<H;y+=50){bg.beginPath();bg.moveTo(0,y);bg.lineTo(W,y);bg.stroke();}
  bg.restore();
 
  // Draw the country border with two stroke passes for a glowing effect
  bg.save(); bg.strokeStyle=cfg.strokeCols[1]; bg.lineWidth=1.5; bg.stroke(path);
  bg.strokeStyle=cfg.strokeCols[2]; bg.lineWidth=4; bg.stroke(path); bg.restore();
 
  // Draw a dark vignette around the edges to focus attention on the center
  const vig = bg.createRadialGradient(W/2,H/2,H*0.18,W/2,H/2,H*0.9);
  vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,8,0.75)');
  bg.fillStyle=vig; bg.fillRect(0,0,W,H);
}
 
// Draw the interactive scene layer — runs every frame at 60fps
// Draws edges, nodes, labels and ripple effects
function draw2DScene(sc: CanvasRenderingContext2D, W: number, H: number, time: number, nodes: Node[], edges: Edge[], ripples: Ripple[], selNode: Node|null, hovNode: Node|null, mapKey: MapKey) {
  sc.clearRect(0,0,W,H);  // clear previous frame
  const cfg = MAP_CONFIGS[mapKey];
  const [ar,ag,ab] = cfg.accentRGB;
  const AF = `rgba(${ar},${ag},${ab}`;
  const maxPop = Math.max(...nodes.map(n=>n.pop));
 
  // Draw edges as lines between connected city nodes
  // Selected edges are brighter and thicker
  edges.forEach(({a:i,b:j}) => {
    const na=nodes[i], nb=nodes[j];
    const sel = selNode&&(selNode.id===i||selNode.id===j);
    sc.beginPath(); sc.moveTo(na.x,na.y); sc.lineTo(nb.x,nb.y);
    sc.strokeStyle = sel?`${AF},0.52)`:`rgba(30,80,40,0.20)`;
    sc.lineWidth = sel?1.5:0.8; sc.stroke();
  });
 
  // Draw each city node as a glowing circle
  nodes.forEach(n => {
    const isSel=!!selNode&&selNode.id===n.id;
    const isHov=!!hovNode&&hovNode.id===n.id;
    const [r,g2,b2]=n.r;
    const C=`rgba(${Math.round(r*255)},${Math.round(g2*255)},${Math.round(b2*255)}`;
    const pulse=Math.sin(time*0.038+n.ph)*0.5+0.5;  // animated pulse 0-1
 
    // Outer glow using a radial gradient — larger when selected or hovered
    const gr2=isSel?n.radius+22:isHov?n.radius+14:n.radius+7;
    const grd=sc.createRadialGradient(n.x,n.y,0,n.x,n.y,gr2);
    const ga=isSel?0.30:isHov?0.22:0.06+pulse*0.06;
    grd.addColorStop(0,`${C},${ga})`); grd.addColorStop(1,`${C},0)`);
    sc.beginPath(); sc.arc(n.x,n.y,gr2,0,Math.PI*2); sc.fillStyle=grd; sc.fill();
 
    // Node body circle
    sc.beginPath(); sc.arc(n.x,n.y,n.radius,0,Math.PI*2);
    sc.fillStyle=`${C},${isSel?0.40:isHov?0.28:0.13})`; sc.fill();
 
    // Node border stroke
    sc.strokeStyle=`${C},${isSel?1:isHov?0.9:0.55})`; sc.lineWidth=isSel?2:1.2; sc.stroke();
 
    // Center dot
    sc.beginPath(); sc.arc(n.x,n.y,2.5,0,Math.PI*2);
    sc.fillStyle=`${C},${isSel?1:0.78})`; sc.fill();
 
    // Show city name label for selected, hovered, or major cities
    if(isSel||isHov||n.pop>maxPop*0.25){
      sc.font=`${isSel?9:8}px 'Space Mono',monospace`; sc.textAlign='center';
      sc.fillStyle='rgba(0,0,0,0.6)'; sc.fillText(n.name,n.x+1,n.y-n.radius-5);  // shadow
      sc.fillStyle=`${C},${isSel?1:0.82})`; sc.fillText(n.name,n.x,n.y-n.radius-6);  // text
    }
  });
 
  // Draw expanding ripple rings when a node is clicked
  ripples.forEach(rp => {
    const [r,g2,b2]=rp.col;
    sc.beginPath(); sc.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
    sc.strokeStyle=`rgba(${Math.round(r*255)},${Math.round(g2*255)},${Math.round(b2*255)},${Math.max(0,rp.a)})`;
    sc.lineWidth=1.5; sc.stroke();
  });
}
 
// Create the Canvas 2D renderer object with draw, rebuild and resize methods
function createCanvas2DRenderer(canvases: RendererCanvases, mapKey: MapKey): Renderer {
  const bgCtx = canvases.bg.getContext('2d')!;
  const scCtx = canvases.scene.getContext('2d')!;
  let nebulaCache: HTMLCanvasElement|null = null;
  let lastBgTs = -Infinity;
  let curKey = mapKey;
 
  // Only resize canvases when dimensions actually change to avoid clearing them unnecessarily
  function ensureSize(W: number, H: number) {
    if (canvases.bg.width !== W || canvases.bg.height !== H) {
      canvases.bg.width = canvases.scene.width  = W;
      canvases.bg.height = canvases.scene.height = H;
      lastBgTs = -Infinity;  // force background redraw after resize
    }
  }
 
  // Build the initial nebula cache and set canvas sizes on startup
  nebulaCache = buildNebulaCache(window.innerWidth, window.innerHeight, mapKey);
  canvases.bg.width = canvases.scene.width  = window.innerWidth;
  canvases.bg.height = canvases.scene.height = window.innerHeight;
  console.info('[renderer] Canvas 2D fallback active');
 
  return {
    mode: 'canvas2d',
    draw(f: FrameData) {
      const { ts, time, W, H, nodes, edges, ripples } = f;
      const sel = nodes.find(n=>n.id===f.selectedId)??null;
      const hov = nodes.find(n=>n.id===f.hoveredId)??null;
      ensureSize(W, H);
      // Only redraw background every ~66ms (15fps) for performance
      if (ts - lastBgTs > 66) { draw2DBg(bgCtx, W, H, ts/1000, f.mapKey, nebulaCache); lastBgTs = ts; }
      // Redraw scene every frame at 60fps
      draw2DScene(scCtx, W, H, time, nodes, edges, ripples, sel, hov, f.mapKey);
    },
    // Rebuild nebula cache when switching maps
    rebuild(mk, W, H) { curKey=mk; nebulaCache=buildNebulaCache(W, H, mk); lastBgTs=-Infinity; },
    // Rebuild nebula cache when window is resized
    resize(W, H)       { nebulaCache=buildNebulaCache(W, H, curKey); lastBgTs=-Infinity; },
    destroy() {},
  };
}
 
// ── Public Factory ────────────────────────────────────────────
// Tries WebGPU first, falls back to Canvas 2D if unavailable
// Sizes all canvases, hides unused ones, and returns the active renderer
export async function initRenderer(canvases: RendererCanvases, mapKey: MapKey): Promise<Renderer> {
  const W = window.innerWidth;
  const H = window.innerHeight;
 
  // Set all canvas sizes to match the window
  canvases.bg.width    = canvases.scene.width  = W;
  canvases.bg.height   = canvases.scene.height = H;
  canvases.gpu.width   = W;
  canvases.gpu.height  = H;
 
  // Hide GPU canvas by default, show the 2D canvases
  canvases.gpu.style.display   = 'none';
  canvases.bg.style.display    = 'block';
  canvases.scene.style.display = 'block';
 
  // Try to create a WebGPU renderer
  const gpu = await createWebGPURenderer(canvases.gpu, mapKey);
  if (gpu) {
    // WebGPU succeeded — remove the 2D canvases and show the GPU canvas
    canvases.bg.remove();
    canvases.scene.remove();
    canvases.gpu.style.display = 'block';
    return gpu;
  }
 
  // WebGPU unavailable — use Canvas 2D fallback instead
  return createCanvas2DRenderer(canvases, mapKey);
}