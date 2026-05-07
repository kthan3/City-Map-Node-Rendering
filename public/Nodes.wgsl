// nodes.wgsl
// WebGPU vertex + fragment shader for city node rendering.
//
// Each node is rendered as a screen-space quad (two triangles = 6 vertices).
// Node data is stored in a storage buffer and indexed by instance ID.
//
// Per-node buffer layout (NodeInstance, 48 bytes):
//   vec2  position   — screen-space pixel coords
//   f32   radius     — outer glow radius in pixels
//   f32   pulse      — 0–1 animated pulse value (updated each frame on CPU)
//   vec3  color      — RGB 0–1 from region palette
//   f32   selected   — 1.0 if selected, 0.0 otherwise
//   f32   hovered    — 1.0 if hovered,  0.0 otherwise
//   vec2  resolution — canvas size in pixels (duplicated per instance for convenience)

struct NodeInstance {
  position   : vec2<f32>,
  radius     : f32,
  pulse      : f32,
  color      : vec3<f32>,
  selected   : f32,
  hovered    : f32,
  resolution : vec2<f32>,
  _pad       : f32,   // align to 16 bytes
}

@group(0) @binding(0) var<storage, read> nodes : array<NodeInstance>;

// ─── Vertex shader ─────────────────────────────────────────────────────────────

struct VertexOut {
  @builtin(position) clipPos  : vec4<f32>,
  @location(0)       localPos : vec2<f32>,   // pixel offset from node centre
  @location(1)       color    : vec3<f32>,
  @location(2)       radius   : f32,
  @location(3)       pulse    : f32,
  @location(4)       selected : f32,
  @location(5)       hovered  : f32,
}

// Six vertices per instance (two triangles forming a quad).
// `vertex_index` cycles 0–5 and `instance_index` picks the node.
@vertex
fn vs_main(
  @builtin(vertex_index)   vIdx : u32,
  @builtin(instance_index) iIdx : u32,
) -> VertexOut {
  let n = nodes[iIdx];

  // Quad corners in local space (pixel offsets from centre).
  // The quad is sized to fit the largest possible glow radius.
  let glowR = n.radius + select(14.0, 22.0, n.selected > 0.5);
  let corners = array<vec2<f32>, 6>(
    vec2(-glowR, -glowR), vec2( glowR, -glowR), vec2(-glowR,  glowR),
    vec2( glowR, -glowR), vec2( glowR,  glowR), vec2(-glowR,  glowR),
  );
  let local = corners[vIdx];

  // Convert pixel position to clip space [-1, 1].
  let screenPos = n.position + local;
  let clip = (screenPos / n.resolution) * 2.0 - 1.0;

  var out : VertexOut;
  out.clipPos  = vec4(clip.x, -clip.y, 0.0, 1.0);  // flip Y for WebGPU convention
  out.localPos = local;
  out.color    = n.color;
  out.radius   = n.radius;
  out.pulse    = n.pulse;
  out.selected = n.selected;
  out.hovered  = n.hovered;
  return out;
}

// ─── Fragment shader ───────────────────────────────────────────────────────────

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4<f32> {
  let dist     = length(in.localPos);
  let isSel    = in.selected > 0.5;
  let isHov    = in.hovered  > 0.5;
  let glowR    = in.radius + select(14.0, 22.0, isSel);

  // Discard pixels outside the glow radius (keeps quad overdraw cheap).
  if (dist > glowR) { discard; }

  var alpha = 0.0;

  // ── Glow halo ────────────────────────────────────────────────────────────
  let haloAlpha = select(0.06 + in.pulse * 0.06, select(0.22, 0.30, isSel), isHov);
  let haloFade  = clamp(1.0 - dist / glowR, 0.0, 1.0);
  alpha        += haloAlpha * haloFade * haloFade;  // quadratic fall-off

  // ── Node body ─────────────────────────────────────────────────────────────
  if (dist <= in.radius) {
    let bodyAlpha = select(0.13, select(0.28, 0.40, isSel), isHov);
    alpha = max(alpha, bodyAlpha);
  }

  // ── Stroke ring ───────────────────────────────────────────────────────────
  let strokeW  = select(1.2, 2.0, isSel);
  let strokeA  = select(0.55, select(0.90, 1.0, isSel), isHov);
  let inner    = in.radius - strokeW;
  if (dist > inner && dist <= in.radius) {
    alpha = strokeA;
  }

  // ── Centre dot ────────────────────────────────────────────────────────────
  if (dist <= 2.5) {
    alpha = select(0.78, 1.0, isSel);
  }

  // ── Selection pulse rings ─────────────────────────────────────────────────
  if (isSel) {
    let ring1 = in.radius + 8.0  + in.pulse * 4.0;
    let ring2 = in.radius + 18.0 + in.pulse * 7.0;
    let rw    = 1.5;
    if (abs(dist - ring1) <= rw) { alpha = max(alpha, 0.85 * (1.0 - abs(dist - ring1) / rw)); }
    if (abs(dist - ring2) <= rw) { alpha = max(alpha, 0.28 * (1.0 - abs(dist - ring2) / rw)); }
  }

 return vec4(in.color, 1.0);
}
