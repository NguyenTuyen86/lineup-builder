/**
 * Load Lineup Module
 * 
 * Deserializes lineup data from JSON.
 * NO rendering - pure state restoration.
 * Returns state objects for app to apply.
 */

import { deserializeDirections } from '../features/directions.js';
import { deserializeCustomizations } from '../features/customization.js';
import { matchTheme } from '../config/themes.js';

// ============================================
// DESERIALIZATION
// ============================================

/**
 * Deserialize player data from save (Version 2.0)
 * @param {Object} savedPlayer - Saved player data
 * @returns {Object} Player object (without DOM refs)
 */
export function deserializePlayer(savedPlayer) {
  return {
    x: Number(savedPlayer.x),
    y: Number(savedPlayer.y),
    number: savedPlayer.number,
    name: savedPlayer.name,
    role: savedPlayer.role,
    location: savedPlayer.location || 'lineup',  // ✅ NEW
    slotIndex: savedPlayer.slotIndex !== undefined ? savedPlayer.slotIndex : null,  // ✅ NEW
    benchIndex: savedPlayer.benchIndex !== undefined ? savedPlayer.benchIndex : null,  // ✅ NEW
    customColor: savedPlayer.customColor || null,
    avatar: savedPlayer.avatar || null,
    card: savedPlayer.card || null,
    directions: {}, // Will be populated by recreateDirections
    _savedDirectionKeys: savedPlayer.directions || [] // Temp storage
  };
}

/**
 * Deserialize all players
 * @param {Array<Object>} savedPlayers - Saved players array
 * @returns {Array<Object>} Players array
 */
export function deserializePlayers(savedPlayers) {
  if (!Array.isArray(savedPlayers)) {
    return [];
  }
  return savedPlayers.map(p => deserializePlayer(p));
}

/**
 * Deserialize colors configuration
 * @param {Object} savedColors - Saved colors
 * @returns {Object} Colors object
 */
export function deserializeColors(savedColors) {
  if (!savedColors || typeof savedColors !== 'object') {
    return {
      pitch: '#0b5d34',
      player: '#333333',
      gk: '#1e4dbb',
      border: '#00ff40',
      arrow: '#ff3333'
    };
  }
  
  return {
    pitch: savedColors.pitch || '#0b5d34',
    player: savedColors.player || '#333333',
    gk: savedColors.gk || '#1e4dbb',
    border: savedColors.border || '#00ff40',
    arrow: savedColors.arrow || '#ff3333'
  };
}

// ============================================
// LOAD LINEUP DATA
// ============================================

/**
 * Load lineup from JSON data (Version 2.0)
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} Loaded state {squad, settings, colors, staff, metadata}
 */
export function loadLineupFromJSON(jsonData) {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid JSON data');
  }
  
  // Check version
  if (jsonData.version !== '2.0') {
    throw new Error('Unsupported file version. Please use a file saved with version 2.0 or later.');
  }
  
  if (!Array.isArray(jsonData.squad)) {
    throw new Error('Missing or invalid squad array');
  }
  
  return {
    squad: deserializePlayers(jsonData.squad),
    settings: {
      formation: jsonData.settings?.formation || '',
      playerCount: Number(jsonData.settings?.playerCount) || 11,
      isFlipped: jsonData.settings?.isFlipped || false
    },
    colors: deserializeColors(jsonData.colors),
    staff: jsonData.staff || [],
    team: jsonData.team || { name: '', logo: null, showOnPitch: true },  // ✅ Load team
    metadata: jsonData.meta || null
  };
}

/**
 * Parse JSON string and load lineup
 * @param {string} jsonString - JSON string
 * @returns {Object} Loaded state
 */
export function loadLineupFromString(jsonString) {
  const data = JSON.parse(jsonString);
  return loadLineupFromJSON(data);
}

/**
 * Load lineup from file
 * @param {File} file - File object
 * @returns {Promise<Object>} Loaded state
 */
export function loadLineupFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target.result;
        const state = loadLineupFromString(jsonString);
        resolve(state);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// ============================================
// DIRECTION RECREATION
// ============================================

/**
 * Prepare direction keys for recreation
 * Extracts saved direction keys from players
 * @param {Array<Object>} players - Players with _savedDirectionKeys
 * @returns {Map<Object, Array<string>>} Map of player -> direction keys
 */
export function extractDirectionKeys(players) {
  const directionMap = new Map();
  
  players.forEach(player => {
    if (player._savedDirectionKeys && player._savedDirectionKeys.length > 0) {
      directionMap.set(player, [...player._savedDirectionKeys]);
    }
  });
  
  return directionMap;
}

/**
 * Restore direction keys to players
 * Sets direction keys without creating DOM elements
 * @param {Array<Object>} players - Players array
 * @param {Map<Object, Array<string>>} directionMap - Direction keys map
 */
export function restoreDirectionKeys(players, directionMap) {
  directionMap.forEach((directionKeys, player) => {
    player.directions = {};
    directionKeys.forEach(key => {
      player.directions[key] = true; // Will be replaced with DOM element later
    });
  });
}

/**
 * Clean up temporary direction storage
 * @param {Array<Object>} players - Players array
 */
export function cleanupDirectionStorage(players) {
  players.forEach(player => {
    delete player._savedDirectionKeys;
  });
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate loaded JSON data
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} {valid: boolean, errors: Array<string>, warnings: Array<string>}
 */
export function validateLoadedData(jsonData) {
  const errors = [];
  const warnings = [];
  
  if (!jsonData || typeof jsonData !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors, warnings };
  }
  
  // Required fields
  if (!jsonData.formation || typeof jsonData.formation !== 'string') {
    errors.push('Missing or invalid formation');
  }
  
  if (!jsonData.playerCount || ![5, 7, 11].includes(Number(jsonData.playerCount))) {
    errors.push('Invalid player count (must be 5, 7, or 11)');
  }
  
  if (!Array.isArray(jsonData.players)) {
    errors.push('Missing or invalid players array');
  } else {
    // Validate player count matches
    if (jsonData.players.length !== Number(jsonData.playerCount)) {
      warnings.push(`Player array length (${jsonData.players.length}) doesn't match playerCount (${jsonData.playerCount})`);
    }
    
    // Validate each player
    jsonData.players.forEach((player, index) => {
      if (typeof player.x !== 'number' || typeof player.y !== 'number') {
        errors.push(`Player ${index}: invalid position`);
      }
      if (!player.role || typeof player.role !== 'string') {
        errors.push(`Player ${index}: invalid role`);
      }
    });
  }
  
  if (!jsonData.colors || typeof jsonData.colors !== 'object') {
    warnings.push('Missing colors - using defaults');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate and load lineup
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} {state: Object|null, validation: Object}
 */
export function validateAndLoad(jsonData) {
  const validation = validateLoadedData(jsonData);
  
  if (!validation.valid) {
    return {
      state: null,
      validation
    };
  }
  
  try {
    const state = loadLineupFromJSON(jsonData);
    return {
      state,
      validation
    };
  } catch (error) {
    validation.errors.push(error.message);
    validation.valid = false;
    return {
      state: null,
      validation
    };
  }
}

// ============================================
// THEME DETECTION
// ============================================

/**
 * Detect theme from colors
 * @param {Object} colors - Color object
 * @returns {string} Theme name or '' if custom
 */
export function detectThemeFromColors(colors) {
  return matchTheme(colors);
}

// ============================================
// MIGRATION & COMPATIBILITY
// ============================================

/**
 * Migrate old format to current format
 * @param {Object} oldData - Old format data
 * @returns {Object} Migrated data
 */
export function migrateOldFormat(oldData) {
  // Handle data without meta field (old format)
  if (!oldData.meta) {
    oldData.meta = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      app: 'Lineup Builder',
      version: '1.0'
    };
  }
  
  // Handle old color format
  if (!oldData.colors) {
    oldData.colors = {
      pitch: '#0b5d34',
      player: '#333333',
      gk: '#1e4dbb',
      border: '#00ff40',
      arrow: '#ff3333'
    };
  }
  
  // Handle players without directions array
  if (oldData.players) {
    oldData.players = oldData.players.map(p => ({
      ...p,
      directions: p.directions || []
    }));
  }
  
  return oldData;
}

/**
 * Check if data needs migration
 * @param {Object} jsonData - Parsed JSON data
 * @returns {boolean} True if needs migration
 */
export function needsMigration(jsonData) {
  if (!jsonData) return false;
  
  // Check for old format indicators
  if (!jsonData.meta) return true;
  if (!jsonData.colors) return true;
  if (jsonData.players && jsonData.players.some(p => !Array.isArray(p.directions))) return true;
  
  return false;
}

/**
 * Load with auto-migration
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} Loaded state
 */
export function loadWithMigration(jsonData) {
  if (needsMigration(jsonData)) {
    jsonData = migrateOldFormat(jsonData);
  }
  
  return loadLineupFromJSON(jsonData);
}

// ============================================
// CLIPBOARD OPERATIONS
// ============================================

/**
 * Load lineup from clipboard
 * @returns {Promise<Object>} Loaded state
 */
export async function loadLineupFromClipboard() {
  const text = await navigator.clipboard.readText();
  return loadLineupFromString(text);
}

// ============================================
// PARTIAL LOAD
// ============================================

/**
 * Load only formation data (positions)
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} {formation, playerCount, players (positions only)}
 */
export function loadFormationOnly(jsonData) {
  if (!jsonData || !Array.isArray(jsonData.players)) {
    throw new Error('Invalid JSON data');
  }
  
  return {
    formation: jsonData.formation || '',
    playerCount: Number(jsonData.playerCount) || 11,
    players: jsonData.players.map(p => ({
      x: Number(p.x),
      y: Number(p.y),
      role: p.role
    }))
  };
}

/**
 * Load only colors
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object} Colors object
 */
export function loadColorsOnly(jsonData) {
  return deserializeColors(jsonData.colors);
}

/**
 * Merge loaded data with existing state
 * @param {Object} currentState - Current state
 * @param {Object} loadedState - Loaded state
 * @param {Object} options - Merge options
 * @returns {Object} Merged state
 */
export function mergeLineupState(currentState, loadedState, options = {}) {
  const {
    mergeColors = true,
    mergeSettings = true,
    mergePlayers = true,
    preserveCustomizations = false
  } = options;
  
  const merged = { ...currentState };
  
  if (mergeSettings) {
    merged.settings = loadedState.settings;
  }
  
  if (mergeColors) {
    merged.colors = loadedState.colors;
  }
  
  if (mergePlayers) {
    if (preserveCustomizations) {
      // Keep positions from loaded, customizations from current
      merged.players = loadedState.players.map((loadedPlayer, i) => {
        const currentPlayer = currentState.players[i];
        if (!currentPlayer) return loadedPlayer;
        
        return {
          ...loadedPlayer,
          customColor: currentPlayer.customColor,
          avatar: currentPlayer.avatar,
          card: currentPlayer.card
        };
      });
    } else {
      merged.players = loadedState.players;
    }
  }
  
  return merged;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get load summary
 * @param {Object} loadedState - Loaded state
 * @returns {Object} Summary info
 */
export function getLoadSummary(loadedState) {
  const customizedPlayers = loadedState.players.filter(p => 
    p.customColor || p.avatar || p.card
  );
  
  const playersWithDirections = loadedState.players.filter(p => 
    p._savedDirectionKeys && p._savedDirectionKeys.length > 0
  );
  
  return {
    formation: loadedState.settings.formation,
    playerCount: loadedState.settings.playerCount,
    isFlipped: loadedState.settings.isFlipped,
    customizedCount: customizedPlayers.length,
    directionsCount: playersWithDirections.length,
    hasMetadata: !!loadedState.metadata,
    theme: detectThemeFromColors(loadedState.colors)
  };
}

/**
 * Extract metadata from loaded data
 * @param {Object} jsonData - Parsed JSON data
 * @returns {Object|null} Metadata object
 */
export function extractMetadata(jsonData) {
  return jsonData.meta || null;
}