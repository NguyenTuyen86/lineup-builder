/**
 * Save Lineup Module
 * 
 * Serializes lineup data to JSON.
 * NO UI - pure data serialization.
 * Returns JSON string or data object.
 */

import { serializeDirections } from '../features/directions.js';
import { serializeCustomizations } from '../features/customization.js';

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serialize player data for save (Version 2.0 - with squad)
 * @param {Object} player - Player object
 * @returns {Object} Serializable player data
 */
export function serializePlayer(player) {
  return {
    x: player.x,
    y: player.y,
    number: player.number,
    name: player.name,
    role: player.role,
    location: player.location || 'lineup',  // ✅ NEW: lineup/bench
    slotIndex: player.slotIndex !== undefined ? player.slotIndex : null,  // ✅ NEW
    benchIndex: player.benchIndex !== undefined ? player.benchIndex : null,  // ✅ NEW
    customColor: player.customColor || null,
    avatar: player.avatar || null,
    card: player.card || null,
    directions: serializeDirections(player)
  };
}

/**
 * Serialize all players
 * @param {Array<Object>} players - Players array
 * @returns {Array<Object>} Serialized players
 */
export function serializePlayers(players) {
  return players.map(p => serializePlayer(p));
}

/**
 * Serialize colors configuration
 * @param {Object} colors - Color values
 * @returns {Object} Serialized colors
 */
export function serializeColors(colors) {
  return {
    pitch: colors.pitch || '#0b5d34',
    player: colors.player || '#333333',
    gk: colors.gk || '#1e4dbb',
    border: colors.border || '#00ff40',
    arrow: colors.arrow || '#ff3333'
  };
}

/**
 * Create metadata for save file
 * @param {Object} options - Optional metadata
 * @returns {Object} Metadata object
 */
export function createMetadata(options = {}) {
  const now = new Date();
  const timestamp = formatTimestamp(now);
  
  return {
    id: options.id || timestamp,
    createdAt: options.createdAt || now.toISOString(),
    app: options.app || 'Lineup Builder',
    version: options.version || '2.0'  // ✅ Updated to 2.0
  };
}

/**
 * Create complete lineup data object (Version 2.0)
 * @param {Object} config - Configuration
 * @param {Array<Object>} config.squad - Squad array (lineup + bench)
 * @param {string} config.formation - Formation name
 * @param {number} config.playerCount - Player count (5, 7, 11)
 * @param {boolean} config.isFlipped - Whether formation is flipped
 * @param {Object} config.colors - Color configuration
 * @param {Array<Object>} config.staff - Staff array (future use)
 * @param {Object} config.metadata - Optional metadata
 * @returns {Object} Complete lineup data
 */
export function createLineupData(config) {
  const {
    squad,
    formation,
    playerCount,
    isFlipped = false,
    colors,
    staff = [],
    team = {},  // ✅ NEW: Team info
    metadata = {}
  } = config;
  
  return {
    version: '2.0',
    meta: createMetadata(metadata),
    settings: {
      formation: formation,
      playerCount: playerCount,
      isFlipped: isFlipped
    },
    colors: serializeColors(colors),
    squad: serializePlayers(squad),
    staff: staff,
    team: team  // ✅ NEW: Save team info
  };
}

// ============================================
// JSON CONVERSION
// ============================================

/**
 * Convert lineup data to JSON string
 * @param {Object} lineupData - Lineup data object
 * @param {boolean} pretty - Whether to format JSON (default: true)
 * @returns {string} JSON string
 */
export function lineupToJSON(lineupData, pretty = true) {
  if (pretty) {
    return JSON.stringify(lineupData, null, 2);
  }
  return JSON.stringify(lineupData);
}

/**
 * Create lineup JSON string
 * @param {Object} config - Configuration (same as createLineupData)
 * @param {boolean} pretty - Whether to format JSON
 * @returns {string} JSON string
 */
export function createLineupJSON(config, pretty = true) {
  const data = createLineupData(config);
  return lineupToJSON(data, pretty);
}

// ============================================
// FILE DOWNLOAD
// ============================================

/**
 * Create Blob from JSON string
 * @param {string} jsonString - JSON string
 * @returns {Blob} Blob object
 */
export function createJSONBlob(jsonString) {
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Generate filename for lineup save
 * @param {string} prefix - Filename prefix (default: 'lineup')
 * @param {Date} date - Date for timestamp (default: now)
 * @returns {string} Filename with timestamp
 */
export function generateFilename(prefix = 'lineup', date = new Date()) {
  const timestamp = formatTimestamp(date);
  return `${prefix}_${timestamp}.json`;
}

/**
 * Download lineup as JSON file
 * @param {Object} config - Configuration (same as createLineupData)
 * @param {string} filename - Optional custom filename
 */
export function downloadLineupJSON(config, filename = null) {
  const jsonString = createLineupJSON(config, true);
  const blob = createJSONBlob(jsonString);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || generateFilename();
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Download JSON string as file
 * @param {string} jsonString - JSON string
 * @param {string} filename - Filename
 */
export function downloadJSON(jsonString, filename) {
  const blob = createJSONBlob(jsonString);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

// ============================================
// UTILITIES
// ============================================

/**
 * Format timestamp for filenames
 * @param {Date} date - Date object
 * @returns {string} Formatted timestamp (YYYYMMDD_HHMMSS)
 */
export function formatTimestamp(date) {
  const pad = n => String(n).padStart(2, '0');
  
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) + '_' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Validate lineup data structure
 * @param {Object} data - Data to validate
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validateLineupData(data) {
  const errors = [];
  
  if (!data) {
    errors.push('Data is null or undefined');
    return { valid: false, errors };
  }
  
  // Check required fields
  if (!data.players || !Array.isArray(data.players)) {
    errors.push('Missing or invalid players array');
  }
  
  if (!data.formation || typeof data.formation !== 'string') {
    errors.push('Missing or invalid formation');
  }
  
  if (!data.playerCount || ![5, 7, 11].includes(Number(data.playerCount))) {
    errors.push('Invalid player count (must be 5, 7, or 11)');
  }
  
  if (!data.colors || typeof data.colors !== 'object') {
    errors.push('Missing or invalid colors');
  }
  
  // Validate players
  if (data.players && Array.isArray(data.players)) {
    data.players.forEach((player, index) => {
      if (typeof player.x !== 'number' || typeof player.y !== 'number') {
        errors.push(`Player ${index}: missing or invalid position`);
      }
      if (!player.role || typeof player.role !== 'string') {
        errors.push(`Player ${index}: missing or invalid role`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get save file size estimate
 * @param {Object} lineupData - Lineup data
 * @returns {number} Size in bytes
 */
export function getFileSizeEstimate(lineupData) {
  const jsonString = lineupToJSON(lineupData, false);
  return new Blob([jsonString]).size;
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 KB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================
// CLIPBOARD OPERATIONS
// ============================================

/**
 * Copy lineup JSON to clipboard
 * @param {Object} config - Configuration (same as createLineupData)
 * @returns {Promise<void>}
 */
export async function copyLineupToClipboard(config) {
  const jsonString = createLineupJSON(config, true);
  await navigator.clipboard.writeText(jsonString);
}

/**
 * Copy JSON string to clipboard
 * @param {string} jsonString - JSON string
 * @returns {Promise<void>}
 */
export async function copyJSONToClipboard(jsonString) {
  await navigator.clipboard.writeText(jsonString);
}

// ============================================
// EXPORT PRESETS
// ============================================

/**
 * Create minimal save (positions only)
 * @param {Array<Object>} players - Players array
 * @param {string} formation - Formation name
 * @param {number} playerCount - Player count
 * @returns {Object} Minimal lineup data
 */
export function createMinimalSave(players, formation, playerCount) {
  return {
    formation,
    playerCount,
    players: players.map(p => ({
      x: p.x,
      y: p.y,
      role: p.role
    }))
  };
}

/**
 * Create full save (all data)
 * @param {Object} config - Full configuration
 * @returns {Object} Complete lineup data
 */
export function createFullSave(config) {
  return createLineupData(config);
}

/**
 * Create template save (no customizations)
 * @param {Object} config - Configuration
 * @returns {Object} Template lineup data
 */
export function createTemplateSave(config) {
  const data = createLineupData(config);
  
  // Remove customizations
  data.players = data.players.map(p => ({
    x: p.x,
    y: p.y,
    number: p.number,
    name: p.name,
    role: p.role,
    customColor: null,
    avatar: null,
    card: null,
    directions: []
  }));
  
  return data;
}

// ============================================
// QUICK SAVE HELPERS
// ============================================

/**
 * Quick save lineup (Version 2.0)
 * Convenience function for common save operation
 * @param {Array<Object>} squad - Squad array
 * @param {Object} settings - Lineup settings
 * @param {Object} colors - Color configuration
 * @param {Array<Object>} staff - Staff array
 * @returns {string} JSON string
 */
export function quickSave(squad, settings, colors, staff = []) {
  return createLineupJSON({
    squad,
    formation: settings.formation,
    playerCount: settings.playerCount,
    isFlipped: settings.isFlipped,
    colors,
    staff
  });
}

/**
 * Quick download lineup (Version 2.0)
 * @param {Array<Object>} squad - Squad array (lineup + bench)
 * @param {Object} settings - Lineup settings
 * @param {Object} colors - Color configuration
 * @param {Array<Object>} staff - Staff array (future use)
 */
export function quickDownload(squad, settings, colors, staff = [], team = {}) {
  downloadLineupJSON({
    squad,
    formation: settings.formation,
    playerCount: settings.playerCount,
    isFlipped: settings.isFlipped,
    colors,
    staff,
    team  // ✅ NEW: Include team info
  });
}