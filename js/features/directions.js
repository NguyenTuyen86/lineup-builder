/**
 * Direction Arrows Feature
 * 
 * Direction arrows logic, flip mapping, and recreation.
 * NO UI button handling, NO direct rendering.
 */

// ============================================
// DIRECTION CONFIGURATION
// ============================================

/**
 * Direction symbols and their grid offsets
 * Grid is 3x3 around player center
 */
export const DIRECTION_SYMBOLS = {
  '↖': { dx: -1, dy: -1 },  // Up-Left
  '⬆': { dx: 0,  dy: -1 },  // Up
  '↗': { dx: 1,  dy: -1 },  // Up-Right
  '⬅': { dx: -1, dy: 0  },  // Left
  '•': { dx: 0,  dy: 0  },  // Center (rarely used)
  '➡': { dx: 1,  dy: 0  },  // Right
  '↙': { dx: -1, dy: 1  },  // Down-Left
  '⬇': { dx: 0,  dy: 1  },  // Down
  '↘': { dx: 1,  dy: 1  }   // Down-Right
};

/**
 * Direction flip mapping for 180° rotation
 * Used when flipping formation
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
 * Arrow positioning relative to player element
 * Based on 60px player size, arrows positioned outside
 */
export const ARROW_POSITIONS = {
  '↖': { x: -10, y: -10 },
  '⬆': { x: 30,  y: -10 },
  '↗': { x: 70,  y: -10 },
  '⬅': { x: -10, y: 30  },
  '•': { x: 30,  y: 30  },
  '➡': { x: 70,  y: 30  },
  '↙': { x: -10, y: 70  },
  '⬇': { x: 30,  y: 70  },
  '↘': { x: 70,  y: 70  }
};

/**
 * Calculate arrow position from grid offset
 * @param {number} dx - Delta X (-1, 0, 1)
 * @param {number} dy - Delta Y (-1, 0, 1)
 * @returns {Object} {x, y} position in pixels
 */
export function calculateArrowPosition(dx, dy) {
  return {
    x: 30 + dx * 38,  // Center (30px) + offset
    y: 30 + dy * 38
  };
}

// ============================================
// DIRECTION STATE MANAGEMENT
// ============================================

/**
 * Check if direction exists on player
 * @param {Object} player - Player object
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if direction exists
 */
export function hasDirection(player, directionKey) {
  return !!(player.directions && player.directions[directionKey]);
}

/**
 * Get all direction keys for player
 * @param {Object} player - Player object
 * @returns {Array<string>} Direction symbols
 */
export function getDirectionKeys(player) {
  if (!player.directions || typeof player.directions !== 'object') {
    return [];
  }
  return Object.keys(player.directions);
}

/**
 * Add direction to player
 * @param {Object} player - Player object
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if added (false if already exists)
 */
export function addDirection(player, directionKey) {
  if (!player.directions) {
    player.directions = {};
  }
  
  if (player.directions[directionKey]) {
    return false; // Already exists
  }
  
  player.directions[directionKey] = true; // Set to true (or DOM element later)
  return true;
}

/**
 * Remove direction from player
 * @param {Object} player - Player object
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if removed (false if didn't exist)
 */
export function removeDirection(player, directionKey) {
  if (!player.directions || !player.directions[directionKey]) {
    return false;
  }
  
  delete player.directions[directionKey];
  return true;
}

/**
 * Toggle direction on player
 * @param {Object} player - Player object
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} New state (true = added, false = removed)
 */
export function toggleDirection(player, directionKey) {
  if (hasDirection(player, directionKey)) {
    removeDirection(player, directionKey);
    return false;
  } else {
    addDirection(player, directionKey);
    return true;
  }
}

/**
 * Clear all directions for player
 * @param {Object} player - Player object
 */
export function clearDirections(player) {
  player.directions = {};
}

/**
 * Set directions from array of keys
 * @param {Object} player - Player object
 * @param {Array<string>} directionKeys - Direction symbols
 */
export function setDirections(player, directionKeys) {
  player.directions = {};
  directionKeys.forEach(key => {
    player.directions[key] = true;
  });
}

// ============================================
// MULTI-PLAYER OPERATIONS
// ============================================

/**
 * Check if direction exists on ANY selected player
 * @param {Array<Object>} players - Players array
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if any player has this direction
 */
export function anyPlayerHasDirection(players, directionKey) {
  return players.some(p => hasDirection(p, directionKey));
}

/**
 * Check if direction exists on ALL selected players
 * @param {Array<Object>} players - Players array
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if all players have this direction
 */
export function allPlayersHaveDirection(players, directionKey) {
  if (players.length === 0) return false;
  return players.every(p => hasDirection(p, directionKey));
}

/**
 * Toggle direction on multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} New state (true = added to all, false = removed from all)
 */
export function toggleDirectionMulti(players, directionKey) {
  const anyHasIt = anyPlayerHasDirection(players, directionKey);
  
  if (anyHasIt) {
    // Remove from all
    players.forEach(p => removeDirection(p, directionKey));
    return false;
  } else {
    // Add to all
    players.forEach(p => addDirection(p, directionKey));
    return true;
  }
}

/**
 * Add direction to multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} directionKey - Direction symbol
 */
export function addDirectionMulti(players, directionKey) {
  players.forEach(p => addDirection(p, directionKey));
}

/**
 * Remove direction from multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} directionKey - Direction symbol
 */
export function removeDirectionMulti(players, directionKey) {
  players.forEach(p => removeDirection(p, directionKey));
}

// ============================================
// DIRECTION FLIP
// ============================================

/**
 * Flip single direction key
 * @param {string} directionKey - Direction symbol
 * @returns {string} Flipped direction symbol
 */
export function flipDirectionKey(directionKey) {
  return DIRECTION_FLIP_MAP[directionKey] || directionKey;
}

/**
 * Flip all directions for player
 * @param {Object} player - Player object
 * @returns {Object} Flipped directions object
 */
export function flipPlayerDirections(player) {
  if (!player.directions || typeof player.directions !== 'object') {
    return {};
  }
  
  const flipped = {};
  Object.keys(player.directions).forEach(key => {
    const flippedKey = flipDirectionKey(key);
    flipped[flippedKey] = true;
  });
  
  return flipped;
}

/**
 * Apply flipped directions to player (mutates)
 * @param {Object} player - Player object
 */
export function applyFlippedDirections(player) {
  const flipped = flipPlayerDirections(player);
  player.directions = flipped;
}

/**
 * Flip directions for multiple players
 * @param {Array<Object>} players - Players array
 */
export function flipDirectionsMulti(players) {
  players.forEach(p => applyFlippedDirections(p));
}

// ============================================
// DIRECTION SERIALIZATION
// ============================================

/**
 * Serialize player directions for storage
 * @param {Object} player - Player object
 * @returns {Array<string>} Direction keys array
 */
export function serializeDirections(player) {
  return getDirectionKeys(player);
}

/**
 * Deserialize directions (load from saved data)
 * @param {Object} player - Player object
 * @param {Array<string>} directionKeys - Saved direction keys
 */
export function deserializeDirections(player, directionKeys) {
  if (!Array.isArray(directionKeys)) {
    player.directions = {};
    return;
  }
  
  player.directions = {};
  directionKeys.forEach(key => {
    player.directions[key] = true;
  });
}

// ============================================
// DIRECTION VALIDATION
// ============================================

/**
 * Check if direction symbol is valid
 * @param {string} directionKey - Direction symbol
 * @returns {boolean} True if valid
 */
export function isValidDirection(directionKey) {
  return directionKey in DIRECTION_SYMBOLS;
}

/**
 * Validate and filter direction keys
 * @param {Array<string>} directionKeys - Direction keys to validate
 * @returns {Array<string>} Valid direction keys only
 */
export function validateDirectionKeys(directionKeys) {
  if (!Array.isArray(directionKeys)) return [];
  return directionKeys.filter(key => isValidDirection(key));
}

/**
 * Get opposite direction
 * @param {string} directionKey - Direction symbol
 * @returns {string} Opposite direction
 */
export function getOppositeDirection(directionKey) {
  return flipDirectionKey(directionKey);
}

// ============================================
// DIRECTION UTILITIES
// ============================================

/**
 * Get all available direction symbols
 * @returns {Array<string>} All direction symbols
 */
export function getAllDirectionSymbols() {
  return Object.keys(DIRECTION_SYMBOLS);
}

/**
 * Get direction offset
 * @param {string} directionKey - Direction symbol
 * @returns {Object|null} {dx, dy} or null if invalid
 */
export function getDirectionOffset(directionKey) {
  return DIRECTION_SYMBOLS[directionKey] || null;
}

/**
 * Find direction by offset
 * @param {number} dx - Delta X (-1, 0, 1)
 * @param {number} dy - Delta Y (-1, 0, 1)
 * @returns {string|null} Direction symbol or null
 */
export function findDirectionByOffset(dx, dy) {
  for (const [symbol, offset] of Object.entries(DIRECTION_SYMBOLS)) {
    if (offset.dx === dx && offset.dy === dy) {
      return symbol;
    }
  }
  return null;
}

/**
 * Get arrow visual position
 * @param {string} directionKey - Direction symbol
 * @returns {Object|null} {x, y} position in pixels or null
 */
export function getArrowPosition(directionKey) {
  return ARROW_POSITIONS[directionKey] || null;
}

/**
 * Calculate direction count for player
 * @param {Object} player - Player object
 * @returns {number} Number of directions
 */
export function getDirectionCount(player) {
  return getDirectionKeys(player).length;
}

/**
 * Check if player has any directions
 * @param {Object} player - Player object
 * @returns {boolean} True if has directions
 */
export function hasAnyDirection(player) {
  return getDirectionCount(player) > 0;
}

/**
 * Copy directions from one player to another
 * @param {Object} source - Source player
 * @param {Object} target - Target player
 */
export function copyDirections(source, target) {
  const keys = getDirectionKeys(source);
  setDirections(target, keys);
}

/**
 * Merge directions from multiple players
 * @param {Array<Object>} players - Players array
 * @returns {Array<string>} Union of all direction keys
 */
export function mergeDirections(players) {
  const allKeys = new Set();
  players.forEach(p => {
    getDirectionKeys(p).forEach(key => allKeys.add(key));
  });
  return Array.from(allKeys);
}

/**
 * Get common directions across players
 * @param {Array<Object>} players - Players array
 * @returns {Array<string>} Intersection of direction keys
 */
export function getCommonDirections(players) {
  if (players.length === 0) return [];
  if (players.length === 1) return getDirectionKeys(players[0]);
  
  const firstKeys = getDirectionKeys(players[0]);
  return firstKeys.filter(key => 
    players.every(p => hasDirection(p, key))
  );
}