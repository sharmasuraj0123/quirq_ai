"""
Procedural banner art for the research notes ported from xo-docs.

The house look, read off the six existing banners: pure void black, one source
of light, spectral dispersion rather than flat colour, and glass that bends
light instead of reflecting it. Nothing here depicts anything the article has
to prove; the art is atmosphere, so each composition is abstract and the alt
text in research.ts describes only the picture.

Every image is deterministic in its slug, so re-running this reproduces the set
byte for byte, and swapping one banner for real art later is a file drop.
"""

import hashlib
import numpy as np
from PIL import Image, ImageFilter

W, H = 1600, 900

# Sampled off the existing banners: a warm-to-cool spectral sweep that never
# reaches full saturation, so the light reads as dispersed rather than neon.
SPECTRUM = np.array(
    [
        [255, 92, 84],
        [255, 156, 72],
        [255, 214, 96],
        [150, 232, 140],
        [96, 208, 236],
        [120, 150, 255],
        [186, 122, 255],
    ],
    dtype=np.float64,
)


def spectral(t):
    """Sample the spectrum at t in [0, 1]; t outside the range clamps."""
    t = np.clip(t, 0.0, 1.0) * (len(SPECTRUM) - 1)
    lo = np.floor(t).astype(int)
    hi = np.minimum(lo + 1, len(SPECTRUM) - 1)
    f = (t - lo)[..., None]
    return SPECTRUM[lo] * (1 - f) + SPECTRUM[hi] * f


def seed_of(slug):
    return int(hashlib.sha256(slug.encode()).hexdigest()[:8], 16)


def grid():
    y, x = np.mgrid[0:H, 0:W].astype(np.float64)
    return x / W, y / H


def starburst(rng, cx, cy, rays):
    """Light thrown from one point, dispersed by angle."""
    x, y = grid()
    dx, dy = (x - cx) * (W / H), y - cy
    r = np.hypot(dx, dy) + 1e-6
    a = np.arctan2(dy, dx)

    beam = np.zeros_like(r)
    tint = np.zeros(r.shape + (3,))
    for _ in range(rays):
        ang = rng.uniform(0, 2 * np.pi)
        width = rng.uniform(0.004, 0.05)
        power = rng.uniform(0.4, 1.0)
        d = np.abs(np.angle(np.exp(1j * (a - ang))))
        lobe = np.exp(-(d**2) / (2 * width**2)) * power
        lobe *= np.exp(-r * rng.uniform(1.4, 3.6))
        beam += lobe
        tint += lobe[..., None] * spectral(rng.random())

    core = np.exp(-(r**2) / (2 * 0.055**2)) * 1.6
    beam += core
    tint += core[..., None] * np.array([255.0, 246.0, 232.0])
    return beam, tint


def prism(rng, angle, bands):
    """A wedge of glass fanning one beam into ordered bands."""
    x, y = grid()
    u = x * np.cos(angle) + y * np.sin(angle)
    v = -x * np.sin(angle) + y * np.cos(angle)

    beam = np.zeros_like(u)
    tint = np.zeros(u.shape + (3,))
    origin = rng.uniform(0.18, 0.34)
    for i in range(bands):
        t = i / max(bands - 1, 1)
        offset = origin + t * rng.uniform(0.30, 0.52)
        width = rng.uniform(0.008, 0.030) * (0.5 + t)
        lobe = np.exp(-((v - offset) ** 2) / (2 * width**2))
        # The fan opens with distance, so the bands are a spray, not stripes.
        lobe *= np.clip((u - 0.12) * rng.uniform(1.1, 2.0), 0, None)
        lobe *= np.exp(-np.clip(u - 0.5, 0, None) * rng.uniform(0.4, 1.4))
        beam += lobe * rng.uniform(0.5, 1.0)
        tint += lobe[..., None] * spectral(t)

    edge = np.exp(-((u - 0.12) ** 2) / (2 * 0.010**2)) * 1.3
    beam += edge
    tint += edge[..., None] * np.array([236.0, 240.0, 255.0])
    return beam, tint


def caustics(rng, scale, layers):
    """
    Light bent through a moving surface: a few wide filaments, not a weave.

    The obvious construction (sin(x) * cos(y)) is separable, and a separable
    field paints a plaid, which is the one thing this house style is not. So
    each layer is a single low-frequency wavefront whose argument is warped by
    another, and only the crest of it is kept.
    """
    x, y = grid()
    beam = np.zeros_like(x)
    tint = np.zeros(x.shape + (3,))

    # One shared warp field keeps the filaments related to each other, the way
    # caustics from one surface are.
    wx, wy = rng.uniform(0.6, 1.3), rng.uniform(0.5, 1.1)
    wp = rng.uniform(0, 2 * np.pi)
    warp = np.sin(x * wx * 2 * np.pi + y * wy * 1.3 * np.pi + wp)

    for i in range(layers):
        t = i / max(layers - 1, 1)
        ang = rng.uniform(-0.6, 0.6)
        freq = rng.uniform(0.7, 1.5) * scale
        ph = rng.uniform(0, 2 * np.pi)
        u = x * np.cos(ang) + y * np.sin(ang)
        wave = np.sin(u * freq * 2 * np.pi + warp * rng.uniform(1.2, 2.6) + ph)

        # A narrow crest is a filament; a wide one is fog.
        ridge = np.exp(-((wave - 1.0) ** 2) / (2 * 0.16**2))
        # Confine it to a band, so the frame keeps its void.
        ridge *= np.exp(-((y - rng.uniform(0.34, 0.66)) ** 2) / (2 * 0.17**2))
        ridge *= np.clip(1.0 - np.abs(x - rng.uniform(0.25, 0.75)) * 1.35, 0, None)

        beam += ridge * rng.uniform(0.35, 0.75)
        tint += ridge[..., None] * spectral(t)
    return beam, tint


def slab(rng, count):
    """Depth planes: sheets of glass edge-lit, receding into the void."""
    x, y = grid()
    beam = np.zeros_like(x)
    tint = np.zeros(x.shape + (3,))
    for i in range(count):
        t = i / max(count - 1, 1)
        cy = rng.uniform(0.16, 0.86)
        tiltz = rng.uniform(-0.20, 0.20)
        line = cy + (x - 0.5) * tiltz
        width = rng.uniform(0.004, 0.016)
        lobe = np.exp(-((y - line) ** 2) / (2 * width**2))
        # Each sheet is lit from one side and dies out across the frame.
        lobe *= np.clip(1.0 - np.abs(x - rng.uniform(0.2, 0.8)) * rng.uniform(1.2, 2.4), 0, None)
        beam += lobe * rng.uniform(0.5, 1.1)
        tint += lobe[..., None] * spectral(t)

        # A tight halo reads as bloom around an edge. A wide one reads as grey
        # fog and flattens the void, so this stays close to the edge itself.
        halo = np.exp(-((y - line) ** 2) / (2 * (width * 4.0) ** 2)) * 0.07
        halo *= np.clip(1.0 - np.abs(x - 0.5) * 1.1, 0, None)
        beam += halo
        tint += halo[..., None] * spectral(t)
    return beam, tint


ARCHETYPES = ["starburst", "prism", "caustics", "slab"]


def compose(slug, archetype):
    rng = np.random.default_rng(seed_of(slug))

    if archetype == "starburst":
        beam, tint = starburst(
            rng, rng.uniform(0.30, 0.70), rng.uniform(0.36, 0.64), rng.integers(14, 30)
        )
    elif archetype == "prism":
        beam, tint = prism(rng, rng.uniform(-0.5, 0.5), rng.integers(7, 13))
    elif archetype == "caustics":
        beam, tint = caustics(rng, rng.uniform(0.9, 1.9), rng.integers(4, 8))
    else:
        beam, tint = slab(rng, rng.integers(5, 10))

    # Normalise on the beam, then colour by it: the tint carries hue, the beam
    # carries where the light is, so dispersion survives the exposure step.
    peak = np.percentile(beam, 99.9)
    beam = beam / max(peak, 1e-6)
    tint = tint / max(peak, 1e-6)

    img = tint * 0.85 + beam[..., None] * np.array([26.0, 24.0, 30.0])

    # Filmic shoulder: highlights roll off instead of clipping to white, which
    # is what keeps these reading as light rather than as paint.
    img = 255.0 * (1.0 - np.exp(-img / 118.0))

    # The void is never pure zero; a faint cool floor gives the black depth.
    x, y = grid()
    floor = 5.0 * np.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) / 0.7)
    img += floor[..., None] * np.array([0.7, 0.8, 1.0])

    # Vignette, matching the page's own.
    vig = 1.0 - 0.55 * ((x - 0.5) ** 2 * 1.4 + (y - 0.5) ** 2 * 2.2)
    img *= np.clip(vig, 0.25, 1.0)[..., None]

    # Grain, at the same weight the site puts over its stage.
    img += rng.normal(0, 2.1, img.shape)

    out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB")
    return out.filter(ImageFilter.GaussianBlur(0.5))


# One archetype per slug, chosen so neighbours in the reading order never repeat
# a composition and the two "analysis" pieces do not look like a matched pair.
PLAN = [
    ("research-series", "slab"),
    ("environment-and-token-cost", "prism"),
    ("the-self-sufficient-agent", "starburst"),
    ("relevance-not-volume", "caustics"),
    ("curiosity-comparison", "starburst"),
    ("coding-model-eval-harness", "prism"),
    ("harvey-case-study", "slab"),
    ("alignment-environments", "caustics"),
    ("tokenizer-not-the-language", "prism"),
    ("organic-vs-synthetic-evaluation-data", "caustics"),
]

if __name__ == "__main__":
    import os
    import sys

    dest = sys.argv[1]
    os.makedirs(dest, exist_ok=True)
    for slug, archetype in PLAN:
        path = os.path.join(dest, f"{slug}.jpg")
        compose(slug, archetype).save(path, "JPEG", quality=90, optimize=True)
        print(f"{archetype:10} {os.path.getsize(path) // 1024:>4} KB  {path}")
