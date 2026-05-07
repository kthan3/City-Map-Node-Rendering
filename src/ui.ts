import { Node } from './graph.js';
import { MapKey, MAP_CONFIGS } from './mapdata.js';

// ── DOM Element References ────────────────────────────────────
// Grab all the HTML elements we need to update from the page
const tooltip    = document.getElementById('tooltip')!;
const notifEl    = document.getElementById('notifications')!;
const statN      = document.getElementById('sn')!;       // node count display
const statE      = document.getElementById('se')!;       // edge count display
const statS      = document.getElementById('ss')!;       // selected city display
const mapTitle   = document.getElementById('map-title')!;
const mapSub     = document.getElementById('map-sub')!;
const mapHeader  = document.querySelector<HTMLElement>('#header h1')!;
const overlay    = document.getElementById('transition-overlay')!;

// ── Tooltip ───────────────────────────────────────────────────
// Shows a small label with the city name when hovering over a node
export function showTooltip(node: Node, mx: number, my: number, accentRGB: [number, number, number]): void {
  const col = `rgb(${accentRGB[0]},${accentRGB[1]},${accentRGB[2]})`;
  tooltip.style.display    = 'block';
  tooltip.style.left       = mx + 'px';  // position at mouse X
  tooltip.style.top        = my + 'px';  // position at mouse Y
  tooltip.style.color      = col;        // color matches the country accent
  tooltip.style.borderColor = col;
  tooltip.textContent      = node.name;  // display the city name
}

// Hides the tooltip when the mouse leaves a node
export function hideTooltip(): void {
  tooltip.style.display = 'none';
}

// ── Notification Card ─────────────────────────────────────────
// Creates and displays a card in the top right when a city is clicked
export function notify(node: Node): void {
  const el = document.createElement('div');
  el.className = 'notif';

  // Convert the node's 0-1 color values to 0-255 RGB for CSS
  const [r, g, b] = node.r;
  const col = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  el.style.borderColor     = col;
  el.style.borderLeftColor = col;

  // Determine N/S and E/W direction labels from the coordinates
  const lonDir = node.lon < 0 ? 'W' : 'E';
  const latDir = node.lat < 0 ? 'S' : 'N';

  // Build the card HTML showing city name, region, population and coordinates
  el.innerHTML = `
    <div class="notif-city" style="color:${col}">${node.name}</div>
    <div class="notif-region">REGION: ${node.region}</div>
    <div class="notif-data">
      POP: ${node.pop.toLocaleString()} &nbsp;·&nbsp;
      ${Math.abs(node.lat).toFixed(2)}°${latDir}
      ${Math.abs(node.lon).toFixed(2)}°${lonDir}
    </div>`;

  // Add card to the top of the notifications list
  notifEl.prepend(el);

  // Automatically remove the card after 3.2 seconds with a fade out animation
  setTimeout(() => {
    el.classList.add('exit');
    setTimeout(() => el.remove(), 400);
  }, 3200);
}

// ── Status Bar ────────────────────────────────────────────────
// Updates the bottom left stats showing node count, edge count and selected city
export function updateStats(nodeCount: number, edgeCount: number, selected: Node | null): void {
  statN.textContent = String(nodeCount);
  statE.textContent = String(edgeCount);
  statS.textContent = selected ? selected.name : 'NONE';
}

// ── Header Colors ─────────────────────────────────────────────
// Updates the header and status bar text color to match the current country's accent color
export function updateHeaderColors(mapKey: MapKey): void {
  const [r, g, b] = MAP_CONFIGS[mapKey].accentRGB;
  const col = `rgb(${r},${g},${b})`;
  mapHeader.style.color = col;
  document.querySelectorAll<HTMLElement>('#status-bar span').forEach((s) => {
    s.style.color = col;
  });
}

// Updates the title and subtitle text at the top left when switching maps
export function updateHeaderText(mapKey: MapKey): void {
  const cfg = MAP_CONFIGS[mapKey];
  mapTitle.textContent = cfg.title;
  mapSub.textContent   = cfg.sub;
}

// ── Map Switcher Buttons ──────────────────────────────────────
// Highlights the currently active country button in the nav bar
export function setActiveMapButton(mapKey: MapKey): void {
  document.querySelectorAll<HTMLElement>('.map-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.classList.contains(mapKey));
  });
}

// ── Transition Animation ──────────────────────────────────────
// Fades the screen to black, runs the map switch, then fades back in
export function fadeTransition(callback: () => void, fadeDuration = 220): void {
  overlay.classList.add('fading');       // trigger fade to black
  setTimeout(() => {
    callback();                          // switch the map while screen is black
    setTimeout(() => overlay.classList.remove('fading'), 50); // fade back in
  }, fadeDuration);
}