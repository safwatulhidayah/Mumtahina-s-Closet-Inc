/**
 * Color utilities for modest fashion catalog.
 * Maps human-entered color names to representative visual hex codes.
 */

const KNOWN_COLORS: Record<string, string> = {
  // Pinks & Roses
  'dusty rose pink': '#DCAEAE',
  'dusty rose': '#DCAEAE',
  'rose pink': '#E89EB0',
  'rose': '#D9777F',
  'pink': '#F4A5B8',
  'blush': '#DE5D83',
  'blush pink': '#FFD1DC',
  'peach': '#FBB6CE',
  'coral': '#F87171',
  'salmon': '#FA8072',

  // Monochromes
  'black': '#111827',
  'jet black': '#09090B',
  'midnight black': '#0B0D13',
  'white': '#FFFFFF',
  'pure white': '#FFFFFF',
  'off white': '#FAF7F5',
  'off-white': '#FAF7F5',
  'ivory': '#FFFFF0',
  'cream': '#FFFDD0',
  'pearl': '#FDFBF7',

  // Blues & Navies
  'navy': '#0F1E36',
  'navy blue': '#0F1E36',
  'midnight navy': '#0A1424',
  'dark navy': '#0B1528',
  'royal blue': '#1D4ED8',
  'cobalt': '#0047AB',
  'sky blue': '#7DD3FC',
  'baby blue': '#BAE6FD',
  'powder blue': '#B0E0E6',
  'slate blue': '#64748B',

  // Greens
  'emerald': '#0F5132',
  'emerald green': '#0F5132',
  'forest green': '#14532D',
  'dark green': '#14532D',
  'olive': '#556B2F',
  'olive green': '#556B2F',
  'sage': '#9CAF88',
  'sage green': '#9CAF88',
  'muted sage': '#9CAF88',
  'mint': '#A7F3D0',
  'mint green': '#A7F3D0',
  'moss green': '#8A9A5B',
  'army green': '#4B5320',

  // Neutrals, Earth tones & Golds
  'beige': '#E5D3B3',
  'sand': '#D8C3A5',
  'tan': '#D2B48C',
  'camel': '#C19A6B',
  'nude': '#E8C5B0',
  'khaki': '#C3B091',
  'champagne': '#F7E7CE',
  'champagne gold': '#E6C280',
  'gold': '#D4AF37',
  'metallic gold': '#DAA520',
  'bronze': '#CD7F32',
  'copper': '#B87333',

  // Browns & Warm Darks
  'brown': '#4A3525',
  'dark brown': '#38220F',
  'chocolate': '#3E2723',
  'mocha': '#4E3629',
  'mocha brown': '#4E3629',
  'coffee': '#4B382A',
  'taupe': '#8B8589',
  'terracotta': '#C05621',
  'rust': '#B7410E',

  // Reds, Purples & Berries
  'burgundy': '#6B1D2F',
  'maroon': '#800000',
  'wine': '#722F37',
  'deep red': '#991B1B',
  'crimson': '#DC2626',
  'red': '#DC2626',
  'plum': '#701A75',
  'purple': '#6B21A8',
  'mauve': '#9370DB',
  'lavender': '#E9D5FF',
  'lilac': '#C8A2C8',
  'violet': '#8B5CF6',

  // Grays
  'grey': '#64748B',
  'gray': '#64748B',
  'light grey': '#CBD5E1',
  'light gray': '#CBD5E1',
  'dark grey': '#334155',
  'dark gray': '#334155',
  'charcoal': '#1F2937',
  'slate': '#475569',
  'silver': '#C0C0C0',

  // Teals & Others
  'teal': '#0F766E',
  'dark teal': '#115E59',
  'turquoise': '#14B8A6',
  'mustard': '#D97706',
  'mustard yellow': '#D97706',
  'yellow': '#EAB308',
};

/**
 * Derives a hex color code from a color name.
 */
export function getColorHex(name: string): string {
  if (!name || typeof name !== 'string') return '#0F1E36';
  const clean = name.trim().toLowerCase();

  if (KNOWN_COLORS[clean]) {
    return KNOWN_COLORS[clean];
  }

  // Look for partial matches (e.g. "Dark Dusty Rose")
  for (const [key, hex] of Object.entries(KNOWN_COLORS)) {
    if (clean.includes(key)) {
      return hex;
    }
  }

  // Consistent pleasant pastel fallback based on name hash
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 35%, 45%)`;
}

/**
 * Formats a color name nicely (e.g. "dusty rose pink" -> "Dusty Rose Pink").
 */
export function formatColorName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parses raw color input (string list, comma separated string, or objects)
 * into a standardized { name: string, hex: string }[] array.
 */
export function parseColorsInput(
  input: string | string[] | { name: string; hex?: string }[] | undefined
): { name: string; hex: string }[] {
  if (!input) return [];

  if (typeof input === 'string') {
    return input
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((name) => {
        const formatted = formatColorName(name);
        return {
          name: formatted,
          hex: getColorHex(formatted),
        };
      });
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (typeof item === 'string') {
          const formatted = formatColorName(item);
          return { name: formatted, hex: getColorHex(formatted) };
        }
        if (item && typeof item === 'object') {
          const formatted = formatColorName(item.name || 'Default');
          return {
            name: formatted,
            hex: item.hex || getColorHex(formatted),
          };
        }
        return null;
      })
      .filter((item): item is { name: string; hex: string } => item !== null && item.name.length > 0);
  }

  return [];
}
