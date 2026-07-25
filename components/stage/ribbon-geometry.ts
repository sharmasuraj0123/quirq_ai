import * as THREE from "three";

type RibbonOptions = {
  /** Radius of the loop the ribbon is swept around. */
  radius?: number;
  /** Width of the ribbon face: the broad surface light disperses through. */
  width?: number;
  /** Ribbon thickness. Thin reads as glass; the refraction depth is set on the material. */
  thickness?: number;
  /** Steps around the loop. */
  segments?: number;
  /** Whole rotations of the cross-section across the loop. Integers close the seam. */
  twists?: number;
  /** Vertical amplitude, lifting the loop off-plane into a saddle. */
  wave?: number;
  /** How many vertical oscillations per revolution. */
  waveFreq?: number;
};

/**
 * A closed, twisted glass ribbon: the quirq mark's mobius, built procedurally.
 *
 * Swept as four separate quad strips (one per face of the rectangular
 * cross-section) rather than one welded tube. Each face owns its vertices, so
 * `computeVertexNormals` leaves the long edges crisp instead of rounding them
 * into a soft tube: those hard edges are what throw the sharp caustics and
 * split light into the spectrum.
 */
export function createRibbonGeometry({
  radius = 2.2,
  width = 0.6,
  thickness = 0.22,
  segments = 512,
  twists = 2,
  wave = 0.5,
  waveFreq = 2,
}: RibbonOptions = {}): THREE.BufferGeometry {
  const hw = width / 2;
  const ht = thickness / 2;

  // Cross-section corners, counter-clockwise in the (normal, binormal) plane.
  const section: Array<[number, number]> = [
    [hw, ht],
    [-hw, ht],
    [-hw, -ht],
    [hw, -ht],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Scratch vectors, reused across the sweep.
  const centre = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const rolledN = new THREE.Vector3();
  const rolledB = new THREE.Vector3();
  const point = new THREE.Vector3();

  for (let side = 0; side < 4; side++) {
    const [ax, ay] = section[side];
    const [bx, by] = section[(side + 1) % 4];
    const base = positions.length / 3;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const u = t * Math.PI * 2;

      centre.set(radius * Math.cos(u), wave * Math.sin(waveFreq * u), radius * Math.sin(u));

      // dC/du, normalised.
      tangent
        .set(
          -radius * Math.sin(u),
          wave * waveFreq * Math.cos(waveFreq * u),
          radius * Math.cos(u),
        )
        .normalize();

      // Gram-Schmidt the radial direction against the tangent so the frame stays
      // perpendicular even where the vertical wave tilts the path.
      radial.set(Math.cos(u), 0, Math.sin(u));
      normal.copy(radial).addScaledVector(tangent, -radial.dot(tangent)).normalize();
      binormal.crossVectors(tangent, normal).normalize();

      // Roll the cross-section as it travels: this is the twist.
      const phi = twists * u;
      const cos = Math.cos(phi);
      const sin = Math.sin(phi);
      rolledN.copy(normal).multiplyScalar(cos).addScaledVector(binormal, sin);
      rolledB.copy(normal).multiplyScalar(-sin).addScaledVector(binormal, cos);

      point.copy(centre).addScaledVector(rolledN, ax).addScaledVector(rolledB, ay);
      positions.push(point.x, point.y, point.z);
      uvs.push(t, side / 4);

      point.copy(centre).addScaledVector(rolledN, bx).addScaledVector(rolledB, by);
      positions.push(point.x, point.y, point.z);
      uvs.push(t, (side + 1) / 4);
    }

    // Wind each quad so its normal faces outward: with the corners ordered
    // counter-clockwise and B = T × N, (a,b,c) and (b,d,c) both point away.
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
