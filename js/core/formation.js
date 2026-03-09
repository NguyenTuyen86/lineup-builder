/**
 * Formation Core Logic
 * 
 * Player positioning, formation initialization, and flip calculations.
 * Pure functions - NO DOM, NO rendering.
 */

import { 
  formationDefinitions, 
  formationsManual, 
  matrixToFormation 
} from '../config/formations.js';

// ============================================
// FORMATION INITIALIZATION
// ============================================

/**
 * Get formation data for player count and formation name
 * @param {number} playerCount - 5, 7, or 11
 * @param {string} formationName - Formation name (e.g., '4-4-2')
 * @returns {Array<Object>} Formation data [{x, y, role}, ...]
 */
export function getFormationData(playerCount, formationName) {
  // Try grid-based formation
  if (formationDefinitions[playerCount] && formationDefinitions[playerCount][formationName]) {
    const matrix = formationDefinitions[playerCount][formationName];
    return matrixToFormation(matrix, playerCount);
  }
  
  // Fallback to manual formation
  return formationsManual[playerCount] || [];
}

/**
 * Get available formation names for player count
 * @param {number} playerCount - 5, 7, or 11
 * @returns {Array<string>} Formation names
 */
export function getAvailableFormations(playerCount) {
  const formations = formationDefinitions[playerCount];
  return formations ? Object.keys(formations) : [];
}

/**
 * Initialize players from formation data
 * @param {Array<Object>} formationData - [{x, y, role}, ...]
 * @returns {Array<Object>} Player objects with defaults
 */
export function initializePlayers(formationData) {
  return formationData.map((p, i) => ({
    x: p.x,
    y: p.y,
    role: p.role,
    number: i + 1,
    name: `Player ${i + 1}`,
    customColor: null,
    avatar: null,
    card: null,
    directions: {}
  }));
}

/**
 * Create complete formation (data + players)
 * @param {number} playerCount - 5, 7, or 11
 * @param {string} formationName - Formation name
 * @param {boolean} shouldFlip - Whether to flip 180°
 * @returns {Array<Object>} Initialized players
 */
export function createFormation(playerCount, formationName, shouldFlip = false) {
  const formationData = getFormationData(playerCount, formationName);
  let players = initializePlayers(formationData);
  
  if (shouldFlip) {
    players = flipPlayersPosition(players);
  }
  
  return players;
}

// ============================================
// POSITION MANIPULATION
// ============================================

/**
 * Flip player position 180 degrees around center
 * @param {Object} player - Player object
 * @returns {Object} New player object with flipped position
 */
export function flipPlayerPosition(player) {
  const centerX = 50;
  const centerY = 50;
  
  const dx = player.x - centerX;
  const dy = player.y - centerY;
  
  return {
    ...player,
    x: centerX - dx,
    y: centerY - dy
  };
}

/**
 * Flip all players' positions 180 degrees
 * @param {Array<Object>} players - Array of player objects
 * @returns {Array<Object>} New array with flipped positions
 */
export function flipPlayersPosition(players) {
  return players.map(p => flipPlayerPosition(p));
}

/**
 * Calculate center point of formation
 * @param {Array<Object>} players - Array of player objects
 * @returns {Object} {x, y} center coordinates
 */
export function getFormationCenter(players) {
  if (!players || players.length === 0) {
    return { x: 50, y: 50 };
  }
  
  const sumX = players.reduce((sum, p) => sum + p.x, 0);
  const sumY = players.reduce((sum, p) => sum + p.y, 0);
  
  return {
    x: sumX / players.length,
    y: sumY / players.length
  };
}

/**
 * Get formation bounds
 * @param {Array<Object>} players - Array of player objects
 * @returns {Object} {minX, maxX, minY, maxY, width, height}
 */
export function getFormationBounds(players) {
  if (!players || players.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100 };
  }
  
  const xValues = players.map(p => p.x);
  const yValues = players.map(p => p.y);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// ============================================
// DIRECTION FLIP UTILITIES
// ============================================

/**
 * Direction flip mapping for 180° rotation
 */
export const DIRECTION_FLIP_MAP = {
  '↖': '↘',
  '↘': '↖',
  '⬆': '⬇',
  '⬇': '⬆',
  '↗': '↙',
  '↙': '↗',
  '⬅': '➡',
  '➡': '⬅',
  '•': '•'  // Center stays
};

/**
 * Flip direction keys (for arrows)
 * @param {Object} directions - Direction object {key: value}
 * @returns {Object} Flipped directions
 */
export function flipDirectionKeys(directions) {
  if (!directions || typeof directions !== 'object') {
    return {};
  }
  
  const flipped = {};
  Object.keys(directions).forEach(key => {
    const flippedKey = DIRECTION_FLIP_MAP[key] || key;
    flipped[flippedKey] = true; // Value is true for data storage
  });
  
  return flipped;
}

/**
 * Flip players with their directions
 * @param {Array<Object>} players - Array of player objects
 * @returns {Array<Object>} Players with flipped positions and direction keys
 */
export function flipPlayersWithDirections(players) {
  return players.map(p => {
    const flipped = flipPlayerPosition(p);
    
    // Flip direction keys (not DOM arrows, just the keys)
    if (p.directions && Object.keys(p.directions).length > 0) {
      flipped.directions = flipDirectionKeys(p.directions);
    }
    
    return flipped;
  });
}

// ============================================
// PLAYER QUERIES
// ============================================

/**
 * Get players by role
 * @param {Array<Object>} players - Array of player objects
 * @param {string} role - Role name ('GK', 'CB', etc.)
 * @returns {Array<Object>} Filtered players
 */
export function getPlayersByRole(players, role) {
  return players.filter(p => p.role === role);
}

/**
 * Get player at index
 * @param {Array<Object>} players - Array of player objects
 * @param {number} index - Player index
 * @returns {Object|null} Player object or null
 */
export function getPlayerAtIndex(players, index) {
  return players[index] || null;
}

/**
 * Find player by position (nearest)
 * @param {Array<Object>} players - Array of player objects
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} threshold - Max distance threshold (default 10)
 * @returns {Object|null} Nearest player or null
 */
export function findPlayerAtPosition(players, x, y, threshold = 10) {
  let nearest = null;
  let minDistance = threshold;
  
  players.forEach(p => {
    const distance = Math.sqrt(
      Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = p;
    }
  });
  
  return nearest;
}

// ============================================
// FORMATION VALIDATION
// ============================================

/**
 * Validate formation data structure
 * @param {Array<Object>} formationData - Formation data to validate
 * @returns {boolean} True if valid
 */
export function validateFormationData(formationData) {
  if (!Array.isArray(formationData)) return false;
  if (formationData.length === 0) return false;
  
  return formationData.every(p => 
    typeof p.x === 'number' &&
    typeof p.y === 'number' &&
    typeof p.role === 'string' &&
    p.x >= 0 && p.x <= 100 &&
    p.y >= 0 && p.y <= 100
  );
}

/**
 * Validate player count
 * @param {number} count - Player count
 * @returns {boolean} True if valid (5, 7, or 11)
 */
export function isValidPlayerCount(count) {
  return count === 5 || count === 7 || count === 11;
}

/**
 * Check if formation exists for player count
 * @param {number} playerCount - 5, 7, or 11
 * @param {string} formationName - Formation name
 * @returns {boolean} True if exists
 */
export function formationExists(playerCount, formationName) {
  return !!(
    formationDefinitions[playerCount] &&
    formationDefinitions[playerCount][formationName]
  );
}

// ============================================
// RESET & UPDATES
// ============================================

/**
 * Reset player to formation defaults
 * @param {Object} player - Player to reset
 * @param {number} index - Player index
 * @param {Array<Object>} formationData - Formation data
 * @param {boolean} isFlipped - Whether formation is flipped
 * @returns {Object} New player object with reset values
 */
export function resetPlayerToFormation(player, index, formationData, isFlipped = false) {
  if (!formationData[index]) {
    return player;
  }
  
  let newPlayer = {
    ...player,
    x: formationData[index].x,
    y: formationData[index].y,
    role: formationData[index].role,
    number: index + 1,
    name: `Player ${index + 1}`,
    customColor: null,
    avatar: null,
    card: null,
    directions: {}
  };
  
  if (isFlipped) {
    newPlayer = flipPlayerPosition(newPlayer);
  }
  
  return newPlayer;
}

/**
 * Update player position
 * @param {Object} player - Player object
 * @param {number} x - New X coordinate
 * @param {number} y - New Y coordinate
 * @returns {Object} New player object with updated position
 */
export function updatePlayerPosition(player, x, y) {
  return {
    ...player,
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y))
  };
}

/**
 * Batch update multiple players
 * @param {Array<Object>} players - Players array
 * @param {Array<number>} indices - Indices to update
 * @param {Function} updateFn - Update function (player => newPlayer)
 * @returns {Array<Object>} New players array
 */
export function batchUpdatePlayers(players, indices, updateFn) {
  return players.map((p, i) => {
    if (indices.includes(i)) {
      return updateFn(p);
    }
    return p;
  });
}