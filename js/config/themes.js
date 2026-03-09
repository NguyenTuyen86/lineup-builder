/**
 * Theme Configuration
 * 
 * Color theme presets and matching utilities.
 * Pure data - NO DOM manipulation.
 */

// ============================================
// THEME DEFINITIONS
// ============================================

/**
 * Available color themes
 * Each theme defines colors for all elements
 */
export const themes = {
  classic: {
    pitch: '#0b5d34',   // Traditional green
    player: '#333333',  // Dark gray
    gk: '#1e4dbb',      // Blue
    border: '#00ff40',  // Bright green
    arrow: '#ff3333'    // Red
  },
  
  dark: {
    pitch: '#1a1a1a',   // Near black
    player: '#2d2d2d',  // Dark gray
    gk: '#4a4a4a',      // Medium gray
    border: '#888888',  // Light gray
    arrow: '#ff6b6b'    // Light red
  },
  
  modern: {
    pitch: '#2c5f2d',   // Modern green
    player: '#1c1c1c',  // Very dark gray
    gk: '#ff6b35',      // Orange
    border: '#00d4ff',  // Cyan
    arrow: '#ff3864'    // Pink-red
  },
  
  retro: {
    pitch: '#4a7c59',   // Muted green
    player: '#8b4513',  // Brown
    gk: '#ffd700',      // Gold
    border: '#ffffff',  // White
    arrow: '#ff4500'    // Orange-red
  }
};

/**
 * Default theme name
 */
export const DEFAULT_THEME = 'classic';

/**
 * Get default theme colors
 * @returns {Object} Default theme colors
 */
export function getDefaultTheme() {
  return { ...themes[DEFAULT_THEME] };
}

// ============================================
// THEME UTILITIES
// ============================================

/**
 * Get theme by name
 * @param {string} name - Theme name
 * @returns {Object|null} Theme colors or null if not found
 */
export function getTheme(name) {
  return themes[name] ? { ...themes[name] } : null;
}

/**
 * Get all theme names
 * @returns {Array<string>} Theme names
 */
export function getThemeNames() {
  return Object.keys(themes);
}

/**
 * Check if theme exists
 * @param {string} name - Theme name
 * @returns {boolean} True if theme exists
 */
export function hasTheme(name) {
  return !!themes[name];
}

/**
 * Match current colors to a theme
 * @param {Object} currentColors - Current color values
 * @param {string} currentColors.pitch - Pitch color
 * @param {string} currentColors.player - Player color
 * @param {string} currentColors.gk - Goalkeeper color
 * @param {string} currentColors.border - Border color
 * @param {string} currentColors.arrow - Arrow color
 * @returns {string} Matched theme name, or '' if no match
 */
export function matchTheme(currentColors) {
  for (const [themeName, themeColors] of Object.entries(themes)) {
    if (
      currentColors.pitch === themeColors.pitch &&
      currentColors.player === themeColors.player &&
      currentColors.gk === themeColors.gk &&
      currentColors.border === themeColors.border &&
      currentColors.arrow === themeColors.arrow
    ) {
      return themeName;
    }
  }
  return ''; // No match (custom colors)
}

/**
 * Compare two color sets
 * @param {Object} colors1 - First color set
 * @param {Object} colors2 - Second color set
 * @returns {boolean} True if all colors match
 */
export function colorsMatch(colors1, colors2) {
  return (
    colors1.pitch === colors2.pitch &&
    colors1.player === colors2.player &&
    colors1.gk === colors2.gk &&
    colors1.border === colors2.border &&
    colors1.arrow === colors2.arrow
  );
}

/**
 * Validate color object structure
 * @param {Object} colors - Color object to validate
 * @returns {boolean} True if valid
 */
export function validateColors(colors) {
  if (!colors || typeof colors !== 'object') return false;
  
  const requiredKeys = ['pitch', 'player', 'gk', 'border', 'arrow'];
  
  for (const key of requiredKeys) {
    if (!(key in colors)) return false;
    if (typeof colors[key] !== 'string') return false;
    // Basic hex color validation
    if (!/^#[0-9A-Fa-f]{6}$/.test(colors[key])) return false;
  }
  
  return true;
}

/**
 * Create a custom color set
 * @param {Object} partial - Partial colors (will merge with default)
 * @returns {Object} Complete color set
 */
export function createColorSet(partial = {}) {
  const defaults = getDefaultTheme();
  return {
    pitch: partial.pitch || defaults.pitch,
    player: partial.player || defaults.player,
    gk: partial.gk || defaults.gk,
    border: partial.border || defaults.border,
    arrow: partial.arrow || defaults.arrow
  };
}

/**
 * Serialize colors for storage
 * @param {Object} colors - Color object
 * @returns {Object} Serializable color object
 */
export function serializeColors(colors) {
  return {
    pitch: colors.pitch,
    player: colors.player,
    gk: colors.gk,
    border: colors.border,
    arrow: colors.arrow
  };
}

/**
 * Get color by role
 * @param {string} role - Player role ('GK' or other)
 * @param {Object} colors - Color set
 * @returns {string} Color hex
 */
export function getColorForRole(role, colors) {
  return role === 'GK' ? colors.gk : colors.player;
}

/**
 * Check if colors are custom (not matching any theme)
 * @param {Object} colors - Color object
 * @returns {boolean} True if custom
 */
export function isCustomColors(colors) {
  return matchTheme(colors) === '';
}

/**
 * Get theme metadata
 * @param {string} name - Theme name
 * @returns {Object|null} Theme info with name, colors, and description
 */
export function getThemeMetadata(name) {
  if (!themes[name]) return null;
  
  const descriptions = {
    classic: 'Traditional green pitch with bright colors',
    dark: 'Dark mode with muted tones',
    modern: 'Contemporary style with vibrant accents',
    retro: 'Vintage look with warm earth tones'
  };
  
  return {
    name: name,
    colors: { ...themes[name] },
    description: descriptions[name] || ''
  };
}

/**
 * Get all themes with metadata
 * @returns {Array<Object>} Array of theme metadata
 */
export function getAllThemesMetadata() {
  return getThemeNames().map(name => getThemeMetadata(name));
}