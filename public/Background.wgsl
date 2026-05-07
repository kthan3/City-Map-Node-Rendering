// Background.wgsl
// Fullscreen background shader — renders the sky gradient and animated light beams.
// The vertex shader generates a single large triangle that covers the entire screen.
// The fragment shader runs for every pixel and calculates its color.

// ── Uniforms ──────────────────────────────────────────────────
// Data sent from the CPU every frame
struct Uniforms {
  time      : f32,   // elapsed time in seconds for animations
  width     : f32,   // canvas width in pixels
  height    : f32,   // canvas height in pixels
  beamCount : f32,   // how many beams to draw for the current map
}

// ── Beam Data ─────────────────────────────────────────────────
// Per-beam configuration data sent from the CPU
struct BeamData {
  centerX : f32,   // horizontal center position 0-1
  halfW   : f32,   // half width of the beam 0-1
  hue     : f32,   // base color hue in degrees 0-360
  speed   : f32,   // how fast the beam drifts and shimmers
  phase   : f32,   // phase offset so beams animate at different times
  _pad0   : f32,   // padding to align struct to 32 bytes
  _pad1   : f32,
  _pad2   : f32,
}

// Bind the uniform buffer and beam array from the CPU
@group(0) @binding(0) var<uniform>       u     : Uniforms;
@group(0) @binding(1) var<storage, read> beams : array<BeamData>;

// ── HSL to RGB Conversion ─────────────────────────────────────
// Converts a hue/saturation/lightness color to red/green/blue
// Used to generate smooth beam colors from a hue value
fn hsl2rgb(h: f32, s: f32, l: f32) -> vec3<f32> {
  let c  = (1.0 - abs(2.0 * l - 1.0)) * s;   // chroma
  let hp = h / 60.0;                            // hue sector 0-6
  let x  = c * (1.0 - abs(fract(hp / 2.0) * 2.0 - 1.0));
  var rgb : vec3<f32>;
  // Assign RGB based on which 60 degree sector of the color wheel we are in
  if      (hp < 1.0) { rgb = vec3(c, x, 0.0); }
  else if (hp < 2.0) { rgb = vec3(x, c, 0.0); }
  else if (hp < 3.0) { rgb = vec3(0.0, c, x); }
  else if (hp < 4.0) { rgb = vec3(0.0, x, c); }
  else if (hp < 5.0) { rgb = vec3(x, 0.0, c); }
  else               { rgb = vec3(c, 0.0, x); }
  return rgb + vec3(l - c * 0.5);  // adjust for lightness
}

// ── Vertex Output ─────────────────────────────────────────────
struct VertexOut {
  @builtin(position) pos : vec4<f32>,   // clip space position
  @location(0)       uv  : vec2<f32>,   // texture coordinate 0-1
}

// ── Vertex Shader ─────────────────────────────────────────────
// Generates 3 vertices forming one large triangle that covers the entire screen.
// This is more efficient than drawing two triangles for a quad.
@vertex
fn vs_main(@builtin(vertex_index) idx: u32) -> VertexOut {
  var pos = array<vec2<f32>, 3>(
    vec2(-1.0, -1.0),   // bottom left
    vec2( 3.0, -1.0),   // bottom right (extends past screen)
    vec2(-1.0,  3.0),   // top left (extends past screen)
  );
  var out : VertexOut;
  out.pos = vec4(pos[idx], 0.0, 1.0);
  out.uv  = pos[idx] * 0.5 + 0.5;   // convert from -1..1 to 0..1 range
  return out;
}

// ── Fragment Shader ───────────────────────────────────────────
// Runs for every pixel on screen and calculates its final color
@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> 
{
  // Flip Y so uv.y=0 is at the top of the screen
  let uv = vec2(in.uv.x, 1.0 - in.uv.y);

  // Start with a dark sky gradient from blue-purple at top to deep purple at bottom
  let skyTop    = vec3(0.008, 0.016, 0.055);
  let skyBottom = vec3(0.02,  0.008, 0.035);
  var colour    = mix(skyTop, skyBottom, uv.y);

  // Loop through each beam and add its contribution to the pixel color
  let n = i32(u.beamCount);
  for (var i = 0; i < 8; i++) {
    if (i >= n) { break; }   // stop early if fewer beams than max
    let b = beams[i];

    // Drift the beam center slowly side to side using a sine wave
    let drift   = sin(u.time * b.speed + b.phase) * 0.055;
    let cx      = b.centerX + drift;

    // Calculate how far this pixel is from the beam center
    let dx      = (uv.x - cx) / b.halfW;

    // Gaussian falloff — pixel brightness drops off with distance from beam center
    let env     = exp(-dx * dx * 3.0);

    // Fade the beam out toward the bottom of the screen
    let yFade   = clamp(1.0 - uv.y / 0.70, 0.0, 1.0);

    // Shimmer effect — brightness oscillates over time
    let shimmer = 0.038 + 0.028 * sin(u.time * b.speed * 2.1 + b.phase + 1.0);

    // Shift hue slightly toward center of beam for a warmer core
    let coreH   = b.hue + 18.0 * (1.0 - abs(dx));

    // Add this beam's color contribution to the total pixel color
    colour     += hsl2rgb(coreH, 0.90, 0.62) * env * yFade * shimmer * 1.8;
  }

  // Vignette — darken pixels toward the edges of the screen
  let d   = length(uv - vec2(0.5)) * 1.6;
  let vig = clamp(1.0 - d * d, 0.0, 1.0);
  colour *= vig;

  // Scanline effect — slightly darken every 3rd horizontal line
  // to give a subtle CRT monitor look
  let scan = select(1.0, 0.978, (u32(in.pos.y) % 3u) == 0u);
  colour  *= scan;

  // Output the final color with full opacity
  return vec4(colour, 1.0);
}