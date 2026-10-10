// src/constants/specTemplates.js

/**
 * Category-based specification templates.
 * `match` — lowercase substrings checked against the category name.
 *           First matching template wins.
 * `specs` — ordered list of { name, value } entries to pre-fill.
 */
export const SPEC_TEMPLATES = [
  // ── LAPTOPS ─────────────────────────────────────────────
  {
    match: ['laptop', 'notebook', 'pc portable', 'ordinateur portable'],
    specs: [
      { name: 'Processor',        value: '' },
      { name: 'RAM',              value: '' },
      { name: 'Storage',          value: '' },
      { name: 'Screen Size',      value: '' },
      { name: 'Resolution',       value: '' },
      { name: 'Graphics (GPU)',   value: '' },
      { name: 'Operating System', value: '' },
      { name: 'Battery',          value: '' },
      { name: 'Weight',           value: '' },
      { name: 'Ports',            value: '' },
    ],
  },

  // ── DESKTOPS ────────────────────────────────────────────
  {
    match: ['desktop', 'pc bureau', 'tour', 'bureau'],
    specs: [
      { name: 'Processor',        value: '' },
      { name: 'RAM',              value: '' },
      { name: 'Storage',          value: '' },
      { name: 'Graphics (GPU)',   value: '' },
      { name: 'Motherboard',      value: '' },
      { name: 'Power Supply',     value: '' },
      { name: 'Operating System', value: '' },
      { name: 'Case',             value: '' },
    ],
  },

  // ── MONITORS ────────────────────────────────────────────
  {
    match: ['monitor', 'écran', 'ecran', 'display'],
    specs: [
      { name: 'Screen Size',   value: '' },
      { name: 'Resolution',    value: '' },
      { name: 'Panel Type',    value: '' },
      { name: 'Refresh Rate',  value: '' },
      { name: 'Response Time', value: '' },
      { name: 'Ports',         value: '' },
      { name: 'VESA Mount',    value: '' },
    ],
  },

  // ── MICE ────────────────────────────────────────────────
  {
    match: ['mouse', 'souris'],
    specs: [
      { name: 'Type',          value: '' }, // Wired / Wireless
      { name: 'DPI',           value: '' },
      { name: 'Buttons',       value: '' },
      { name: 'Connectivity',  value: '' }, // USB / Bluetooth / 2.4GHz
      { name: 'Battery',       value: '' },
      { name: 'Weight',        value: '' },
    ],
  },

  // ── KEYBOARDS ───────────────────────────────────────────
  {
    match: ['keyboard', 'clavier'],
    specs: [
      { name: 'Type',         value: '' }, // Mechanical / Membrane
      { name: 'Layout',       value: '' }, // AZERTY / QWERTY
      { name: 'Connectivity', value: '' },
      { name: 'Backlight',    value: '' },
      { name: 'Switch Type',  value: '' },
      { name: 'Layout Size',  value: '' }, // 60% / TKL / Full
    ],
  },

  // ── HEADPHONES / SPEAKERS ───────────────────────────────
  {
    match: ['headphone', 'headset', 'casque', 'écouteur', 'ecouteur', 'speaker', 'enceinte'],
    specs: [
      { name: 'Type',              value: '' },
      { name: 'Connectivity',      value: '' },
      { name: 'Driver Size',       value: '' },
      { name: 'Battery Life',      value: '' },
      { name: 'Noise Cancellation', value: '' },
      { name: 'Microphone',        value: '' },
    ],
  },

  // ── PHONES / TABLETS ────────────────────────────────────
  {
    match: ['phone', 'smartphone', 'téléphone', 'telephone', 'tablet', 'tablette'],
    specs: [
      { name: 'Screen Size',   value: '' },
      { name: 'Resolution',    value: '' },
      { name: 'RAM',           value: '' },
      { name: 'Storage',       value: '' },
      { name: 'Camera',        value: '' },
      { name: 'Battery',       value: '' },
      { name: 'Operating System', value: '' },
      { name: 'SIM',           value: '' },
    ],
  },

  // ── STORAGE (HDD / SSD / USB) ───────────────────────────
  {
    match: ['ssd', 'hdd', 'hard drive', 'disque', 'storage', 'usb', 'flash'],
    specs: [
      { name: 'Capacity',    value: '' },
      { name: 'Type',        value: '' }, // HDD / SSD / NVMe
      { name: 'Interface',   value: '' }, // SATA / PCIe / USB 3.0
      { name: 'Read Speed',  value: '' },
      { name: 'Write Speed', value: '' },
      { name: 'Form Factor', value: '' },
    ],
  },

  // ── MEMORY (RAM MODULES) ────────────────────────────────
  {
    match: ['ram', 'mémoire', 'memoire', 'ddr'],
    specs: [
      { name: 'Capacity',    value: '' },
      { name: 'Type',        value: '' }, // DDR4 / DDR5
      { name: 'Speed',       value: '' }, // 3200 MHz
      { name: 'Form Factor', value: '' }, // DIMM / SO-DIMM
      { name: 'Voltage',     value: '' },
    ],
  },

  // ── PRINTERS ────────────────────────────────────────────
  {
    match: ['printer', 'imprimante'],
    specs: [
      { name: 'Type',         value: '' }, // Inkjet / Laser
      { name: 'Color',        value: '' },
      { name: 'Connectivity', value: '' },
      { name: 'Print Speed',  value: '' },
      { name: 'Paper Size',   value: '' },
      { name: 'Duplex',       value: '' },
    ],
  },

  // ── CHARGERS / CABLES ───────────────────────────────────
  {
    match: ['charger', 'chargeur', 'cable', 'câble', 'adapter', 'adaptateur'],
    specs: [
      { name: 'Wattage',      value: '' },
      { name: 'Connector',    value: '' },
      { name: 'Cable Length', value: '' },
      { name: 'Type',         value: '' },
    ],
  },

  // ── GRAPHICS CARDS ──────────────────────────────────────
  {
    match: ['gpu', 'graphics card', 'carte graphique'],
    specs: [
      { name: 'Chipset',     value: '' },
      { name: 'Memory',      value: '' },
      { name: 'Memory Type', value: '' },
      { name: 'Interface',   value: '' },
      { name: 'Power',       value: '' },
      { name: 'Ports',       value: '' },
    ],
  },
];

/**
 * Look up a spec template by category name.
 * Returns an array of { name, value, display_order } or [] if nothing matches.
 */
export function getSpecTemplate(categoryName) {
  if (!categoryName) return [];
  const lower = String(categoryName).toLowerCase();
  const found = SPEC_TEMPLATES.find((t) =>
    t.match.some((m) => lower.includes(m))
  );
  if (!found) return [];
  return found.specs.map((s, i) => ({ ...s, display_order: i }));
}