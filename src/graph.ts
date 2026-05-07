import { MapConfig, City } from './mapdata.js';
 
export interface Node extends City {
  x: number;
  y: number;
  radius: number;
  id: number;
  ph: number;
  r: [number, number, number]; 
}
 
export interface Edge {
  a: number; 
  b: number; 
}
 

export function geo2screen(
  lat: number,
  lon: number,
  W: number,
  H: number,
  cfg: MapConfig,
  pad = 60,
): [number, number] {
  const x = pad + ((lon - cfg.lonMin) / (cfg.lonMax - cfg.lonMin)) * (W - pad * 2);
  const y = pad + (1 - (lat - cfg.latMin) / (cfg.latMax - cfg.latMin)) * (H - pad * 2);
  return [x, y];
}
 
export function buildNodes(cfg: MapConfig, W: number, H: number): Node[] {
  const maxPop = Math.max(...cfg.cities.map((c) => c.pop));
  return cfg.cities.map((c, i) => {
    const [x, y] = geo2screen(c.lat, c.lon, W, H, cfg);
    const col = cfg.regionColors[c.region] ?? ([0.5, 0.5, 1.0] as [number, number, number]);
    return {
      ...c,
      x,
      y,
      r: col as [number, number, number],
      radius: 5 + Math.sqrt(c.pop / maxPop) * 14,
      id: i,
      ph: Math.random() * Math.PI * 2,
    };
  });
}
 
export function buildEdges(nodes: Node[], nearestK = 3): Edge[] {
  const edgeSet = new Set<string>();
  const edges: Edge[] = [];
 
  nodes.forEach((n, i) => {
    const sorted = nodes
      .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, nearestK);
 
    sorted.forEach(({ j }) => {
      const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ a: i, b: j });
      }
    });
  });
 
  return edges;
}
 
export function refreshNodePositions(
  nodes: Node[],
  cfg: MapConfig,
  W: number,
  H: number,
): void {
  nodes.forEach((n) => {
    const [x, y] = geo2screen(n.lat, n.lon, W, H, cfg);
    n.x = x;
    n.y = y;
  });
}