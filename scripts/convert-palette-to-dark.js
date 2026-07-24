#!/usr/bin/env node
/* Convert styles.css from its light palette to the 故宮 ink-green dark palette.

   Why a conversion and not an override: styles.css carries 269 distinct
   hardcoded colours, 151 of them light. Overriding them one selector at a time
   is whack-a-mole — every rule missed shows up as a white panel floating on the
   dark ground, which is exactly what went wrong. This rewrites the VALUES so
   every view goes dark together.

   Method: parse each colour to HSL, then remap by role inferred from lightness:
     L > 0.86  → page/panel surfaces      (become ink-green surfaces)
     L 0.62-86 → raised surfaces, borders (become raised/border)
     L 0.45-62 → muted ink                (become sand-muted)
     L < 0.45  → text/accents             (LIGHTENED to read on dark)
   Hue is pulled toward the palette so the result is one family rather than
   inverted rainbow. Near-neutral greys go straight to the neutral ramp.

   Accent hues are preserved in spirit: reds stay 朱砂, yellows stay 赭金,
   greens stay 青瓷 — just re-pitched for a dark ground.

   Usage:
     node scripts/convert-palette-to-dark.js            # dry run, report
     node scripts/convert-palette-to-dark.js --apply    # rewrite styles.css
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "styles.css");
const APPLY = process.argv.includes("--apply");

/* ---- 故宮 palette anchors ---- */
const P = {
  bgDeep:   "#151F1A",
  bg:       "#1B2721",   // 墨綠
  surface:  "#22302A",
  raised:   "#2A3A33",
  muted:    "#33453C",
  border:   "#3B4E45",
  inkFaint: "#9E9683",
  inkMuted: "#BEB49C",
  ink:      "#E9E1CE",   // 宣紙白
  celadon:  "#8FA898",   // 青瓷
  ochre:    "#C9A45C",   // 赭金
  cinnabar: "#C1503F"    // 朱砂
};

const hexToRgb = (h) => {
  let c = h.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (c.length === 8) c = c.slice(0, 6);
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
};

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
};

/* Choose a destination colour for a source colour. */
function convert(hex) {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  const neutral = s < 0.14;

  if (neutral) {
    // greys map straight onto the ink-green neutral ramp
    if (l > 0.93) return P.surface;
    if (l > 0.86) return P.surface;
    if (l > 0.72) return P.raised;
    if (l > 0.58) return P.border;
    if (l > 0.42) return P.inkMuted;
    if (l > 0.25) return P.ink;
    return P.ink;                       // near-black text becomes 宣紙白
  }

  // hue families, re-pitched for a dark ground
  const isRed    = h < 25 || h >= 330;
  const isOrange = h >= 25 && h < 48;
  const isYellow = h >= 48 && h < 70;
  const isGreen  = h >= 70 && h < 175;
  const isBlue   = h >= 175 && h < 260;
  const isPurple = h >= 260 && h < 330;

  if (l > 0.86) return P.surface;       // pale tints were backgrounds
  if (l > 0.70) return P.raised;
  if (l > 0.58) return P.muted;

  // saturated mid/dark tones carry meaning — keep the family, lift for contrast
  if (isRed)    return P.cinnabar;
  if (isOrange || isYellow) return P.ochre;
  if (isGreen)  return P.celadon;
  if (isBlue)   return P.celadon;        // the old teal/blue drifts to 青瓷
  if (isPurple) return P.ochre;          // stray plum/magenta joins the earth family
  return P.ink;
}

let css = fs.readFileSync(FILE, "utf8");
const seen = new Map();

css = css.replace(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (m) => {
  const out = convert(m);
  seen.set(m.toLowerCase(), out);
  return out;
});

/* rgba() surfaces: light translucent fills read as milky haze on dark. Flip the
   base to the ink ramp while keeping the author's alpha. */
css = css.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g, (m, r, g, b, a) => {
  const [, , l] = rgbToHsl([+r, +g, +b]);
  if (l > 0.6) return `rgba(233, 225, 206, ${a})`;   // light veil → sand veil
  return `rgba(21, 31, 26, ${a})`;                    // dark veil → ink veil
});

console.log(`distinct source colours remapped: ${seen.size}`);
const sample = [...seen.entries()].slice(0, 12);
sample.forEach(([from, to]) => console.log(`   ${from}  →  ${to}`));

if (!APPLY) {
  console.log("\ndry run — re-run with --apply to rewrite styles.css\n");
  process.exit(0);
}
fs.writeFileSync(FILE, css, "utf8");
console.log(`\nstyles.css rewritten to the 故宮 ink-green palette\n`);
