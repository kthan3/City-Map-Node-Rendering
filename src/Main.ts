// Main.ts — Entry point for the application
// Initializes the renderer, builds the graph, runs the animation loop
// and handles all user input events

import { MAP_CONFIGS, MapKey }                              from './mapdata.js';
import { Node, Edge, buildNodes, buildEdges, refreshNodePositions } from './graph.js';
import { Ripple, Renderer, RendererCanvases, initRenderer, FrameData } from './renderer.js';
import {
  showTooltip, hideTooltip, notify, updateStats,
  updateHeaderColors, updateHeaderText, setActiveMapButton, fadeTransition,
} from './ui.js';

// ── Canvas References ─────────────────────────────────────────
// Grab the three canvas elements from the HTML for layered rendering
const canvases: RendererCanvases = {
  bg:    document.getElementById('c-bg')    as HTMLCanvasElement,  // background layer
  scene: document.getElementById('c-scene') as HTMLCanvasElement,  // nodes and edges layer
  gpu:   document.getElementById('c-gpu')   as HTMLCanvasElement,  // WebGPU layer
};

// Invisible div that sits on top and captures all mouse events
const hitC = document.getElementById('hit-layer') as HTMLCanvasElement;

// ── Application State ─────────────────────────────────────────
let currentMap:   MapKey      = 'usa';        // which country is currently displayed
let nodes:        Node[]      = [];           // list of city nodes on the current map
let edges:        Edge[]      = [];           // list of connections between nodes
let selectedNode: Node | null = null;         // currently clicked node
let hoveredNode:  Node | null = null;         // node the mouse is over
const ripples:    Ripple[]    = [];           // active ripple animations
let time = 0;                                 // frame counter used for animations
let renderer: Renderer;                       // the active renderer instance

// Helper functions to get the current canvas dimensions
function getW() { return window.innerWidth;  }
function getH() { return window.innerHeight; }

// ── Graph Builder ─────────────────────────────────────────────
// Builds the node and edge data for the current map and tells the renderer to rebuild
function buildGraph(): void {
  const W = getW(), H = getH();
  nodes = buildNodes(MAP_CONFIGS[currentMap], W, H);   // convert city coords to screen positions
  edges = buildEdges(nodes, 3);                         // connect each city to its 3 nearest neighbors
  updateStats(nodes.length, edges.length, selectedNode);
  renderer?.rebuild(currentMap, W, H);
}

// ── Hit Test ──────────────────────────────────────────────────
// Returns the node at the given mouse position, or null if none found
function hitNode(mx: number, my: number): Node | null {
  return nodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.radius + 7) ?? null;
}

// ── Mouse Events ──────────────────────────────────────────────

// Show tooltip and change cursor when hovering over a node
hitC.addEventListener('mousemove', e => {
  hoveredNode = hitNode(e.clientX, e.clientY);
  if (hoveredNode) {
    showTooltip(hoveredNode, e.clientX, e.clientY, MAP_CONFIGS[currentMap].accentRGB);
    hitC.style.cursor = 'pointer';
  } else {
    hideTooltip();
    hitC.style.cursor = 'crosshair';
  }
});

// Select or deselect a node on click, show notification card and spawn ripple effect
hitC.addEventListener('click', e => {
  const hit = hitNode(e.clientX, e.clientY);
  if (hit) {
    // Clicking the same node again deselects it
    selectedNode = selectedNode?.id === hit.id ? null : hit;
    updateStats(nodes.length, edges.length, selectedNode);
    if (selectedNode) {
      notify(selectedNode);                                         // show info card top right
      ripples.push({ x: hit.x, y: hit.y, col: hit.r, r: 0, a: 0.9 }); // spawn ripple
    }
  } else {
    // Clicking empty space deselects the current node
    selectedNode = null;
    updateStats(nodes.length, edges.length, null);
  }
});

// ── Map Switcher ──────────────────────────────────────────────
// Called from the HTML buttons — fades screen to black, switches map, fades back in
(window as any).switchMap = (mapKey: MapKey): void => {
  if (mapKey === currentMap) return;  // do nothing if already on this map
  fadeTransition(() => {
    currentMap = mapKey;
    selectedNode = null;
    hoveredNode  = null;
    updateHeaderText(mapKey);
    updateHeaderColors(mapKey);
    setActiveMapButton(mapKey);
    buildGraph();  // rebuild nodes and edges for the new map
  });
};

// ── Resize Handler ────────────────────────────────────────────
// When the window is resized, update canvas size and recalculate node positions
window.addEventListener('resize', () => {
  const W = getW(), H = getH();
  canvases.gpu.width  = W;
  canvases.gpu.height = H;
  refreshNodePositions(nodes, MAP_CONFIGS[currentMap], W, H);  // reproject coords to new size
  renderer.resize(W, H);
});

// ── Animation Loop ────────────────────────────────────────────
// Runs 60 times per second via requestAnimationFrame
function loop(ts: number): void {
  time++;  // increment frame counter for animations

  // Update all active ripples — expand radius and fade out alpha each frame
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].r += 2.8;   // grow the ripple outward
    ripples[i].a -= 0.016; // fade it out
    if (ripples[i].a <= 0) ripples.splice(i, 1);  // remove when fully faded
  }

  const W = getW(), H = getH();

  // Send all current state to the renderer to draw this frame
  renderer.draw({
    ts, time, W, H,
    nodes, edges, ripples,
    selectedId: selectedNode?.id ?? null,
    hoveredId:  hoveredNode?.id  ?? null,
    mapKey: currentMap,
  });

  requestAnimationFrame(loop);  // schedule the next frame
}

// ── Boot ──────────────────────────────────────────────────────
// Initializes everything and starts the animation loop
async function boot(): Promise<void> {
  updateHeaderColors(currentMap);  // set initial accent colors
  updateHeaderText(currentMap);    // set initial title text

  renderer = await initRenderer(canvases, currentMap);  // initialize Canvas 2D renderer
  buildGraph();                                          // build initial node/edge graph

  requestAnimationFrame(loop);  // start the animation loop
}

// Clean up GPU resources when the page is closed
window.addEventListener('unload', () => renderer?.destroy());

// Start the application
boot();