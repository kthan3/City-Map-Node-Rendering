// edges.wgsl
// Draws the lines connecting city nodes on the map.
// Each edge is rendered as a thin rectangular quad (two triangles)
// aligned along the line between two city positions.
// Uses a signed distance field for smooth anti-aliased edges.

// ── Edge Instance Data ────────────────────────────────────────
// All data for one edge, uploaded from the CPU each frame
struct EdgeInstance {
  posA       : vec2<f32>,   // start point in screen pixels
  posB       : vec2<f32>,   // end point in screen pixels
  accentRGB  : vec3<f32>,   // map accent color 0-1
  selected   : f32,          // 1.0 if either endpoint is the selected node
  packetT    : f32,          // 0-1 position of the animated dot travelling along the edge
  lineWidth  : f32,          // desired line width in pixels
  resolution : vec2<f32>,   // canvas width and height for converting to clip space
  _pad       : f32,          // padding to align struct size to 16 bytes
}

// Array of all edges uploaded from the CPU
@group(0) @binding(0) var<storage, read> edges : array<EdgeInstance>;

// ── Vertex Output ─────────────────────────────────────────────
// Data passed from vertex shader to fragment shader for each vertex
struct VertexOut {
  @builtin(position) clipPos    : vec4<f32>,
  @location(0)       lineT      : f32,   // 0 at posA end, 1 at posB end
  @location(1)       sdfDist    : f32,   // perpendicular distance from the line center axis
  @location(2)       halfWidth  : f32,   // half width of the quad in pixels
  @location(3)       accentRGB  : vec3<f32>,
  @location(4)       selected   : f32,
  @location(5)       packetT    : f32,
  @location(6)       segLen     : f32,   // pixel length of the edge segment
}

// ── Vertex Shader ─────────────────────────────────────────────
// Runs 6 times per edge (6 vertices = 2 triangles = 1 quad)
// Builds a thin rectangle aligned along the direction of the edge
@vertex
fn vs_main(
  @builtin(vertex_index)   vIdx : u32,   // 0-5, which corner of the quad
  @builtin(instance_index) iIdx : u32,   // which edge we are drawing
) -> VertexOut {
  let e  = edges[iIdx];
  let hw = e.lineWidth * 0.5 + 2.0;  // add 2px extra for anti-aliasing fringe

  // Calculate direction vector along the edge and normalize it
  let dir  = e.posB - e.posA;
  let len  = max(length(dir), 0.0001);  // avoid divide by zero for zero length edges
  let tang = dir / len;                  // unit vector pointing along the edge
  let norm = vec2(-tang.y, tang.x);     // unit vector perpendicular to the edge

  // Define the 6 quad corners using along and perpendicular sign patterns
  // Two triangles share vertices 1-2 and 3-5 to form the rectangle
  let alongSigns = array<f32, 6>(0.0, 1.0, 0.0,  1.0, 1.0, 0.0);
  let perpSigns  = array<f32, 6>(-1.0,-1.0, 1.0,-1.0, 1.0, 1.0);
  let aS = alongSigns[vIdx];
  let pS = perpSigns[vIdx];

  // Position each corner by moving from posA toward posB (aS)
  // and outward from the line center perpendicular (pS)
  let screenPos = mix(e.posA, e.posB, aS) + norm * pS * hw;

  // Convert screen pixel position to clip space (-1 to 1)
  let clip = (screenPos / e.resolution) * 2.0 - 1.0;

  var out : VertexOut;
  out.clipPos   = vec4(clip.x, -clip.y, 0.0, 1.0);  // flip Y for WebGPU convention
  out.lineT     = aS;          // interpolates 0 to 1 along the edge length
  out.sdfDist   = pS * hw;     // signed distance from center — negative on one side, positive on other
  out.halfWidth = hw;
  out.accentRGB = e.accentRGB;
  out.selected  = e.selected;
  out.packetT   = e.packetT;
  out.segLen    = len;
  return out;
}

// ── Fragment Shader ───────────────────────────────────────────
// Runs for every pixel inside the quad and decides if it should be drawn
@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
  let dist = abs(in.sdfDist);  // how far this pixel is from the center of the line

  // Selected edges are slightly wider than unselected ones
  let coreW = select(0.4, 0.75, in.selected > 0.5);
  let aaW   = 1.0;  // 1 pixel wide anti-aliasing fringe

  // Calculate how much of this pixel is covered by the line core
  // Pixels inside the core get full coverage, pixels in the fringe get partial coverage
  let coverage = clamp((coreW + aaW - dist) / aaW, 0.0, 1.0);

  // Discard pixels that are completely outside the line
  if (coverage <= 0.0) { discard; }

  // Selected edges are more opaque than unselected ones
  let baseAlpha = select(0.20, 0.52, in.selected > 0.5);
  var alpha     = baseAlpha * coverage;

  // ── Animated Data Packet Dot ──────────────────────────────────────────────
  // Only draw the travelling dot on selected edges
  if (in.selected > 0.5) {
    // Calculate distance from this pixel to the current packet position
    let packDist = abs(in.lineT - in.packetT) * in.segLen;
    let dotR     = 3.5;  // dot radius in pixels

    // If this pixel is within the dot radius draw a bright circular dot
    if (packDist < dotR && dist < dotR) {
      let r    = length(vec2(packDist, dist));  // radial distance from dot center
      let fade = clamp(1.0 - r / dotR, 0.0, 1.0);  // smooth fade toward dot edge
      alpha    = max(alpha, 0.95 * fade);
    }
  }

  // Output the edge color with calculated alpha
  return vec4(in.accentRGB, 1.0);
}