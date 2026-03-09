/**
 * Flip Feature
 * 
 * Orchestrates formation flip (180° rotation).
 * Coordinates position flip + direction flip.
 * NO rendering, NO UI - pure coordination logic.
 */

import { flipPlayerPosition } from '../core/formation.js';
import { flipPlayerDirections } from './directions.js';

// ============================================
// FLIP CONFIGURATION
// ============================================

/**
 * Pitch center point (percentage)
 */
const FLIP_CENTER = {
  x: 50,
  y: 50
};

// ============================================
// SINGLE PLAYER FLIP
// ============================================

/**
 * Flip player position and directions
 * @param {Object} player - Player object
 * @param {Object} center - Center point {x, y} (default: 50, 50)
 * @returns {Object} Flip result {position: {x, y}, directions: {...}}
 */
export function flipPlayer(player, center = FLIP_CENTER) {
  // Flip position
  const dx = player.x - center.x;
  const dy = player.y - center.y;
  
  const newPosition = {
    x: center.x - dx,
    y: center.y - dy
  };
  
  // Flip directions
  const newDirections = flipPlayerDirections(player);
  
  return {
    position: newPosition,
    directions: newDirections
  };
}

/**
 * Apply flip to player (mutates)
 * @param {Object} player - Player object
 * @param {Object} center - Center point {x, y}
 */
export function applyFlipToPlayer(player, center = FLIP_CENTER) {
  const result = flipPlayer(player, center);
  
  // Update position
  player.x = result.position.x;
  player.y = result.position.y;
  
  // Update directions (store for later recreation)
  player.flippedDirections = result.directions;
  player.directions = {}; // Clear old (will be recreated by render)
}

// ============================================
// LINEUP FLIP
// ============================================

/**
 * Flip entire lineup (positions + directions)
 * @param {Array<Object>} players - Players array
 * @param {Object} options - Flip options
 * @param {Object} options.center - Center point {x, y}
 * @param {boolean} options.preserveDirections - Keep direction DOM elements (default: false)
 * @returns {Object} Flip result with metadata
 */
export function flipLineup(players, options = {}) {
  const {
    center = FLIP_CENTER,
    preserveDirections = false
  } = options;
  
  const flippedData = players.map(player => {
    const result = flipPlayer(player, center);
    return {
      player,
      originalPosition: { x: player.x, y: player.y },
      originalDirections: { ...player.directions },
      newPosition: result.position,
      newDirections: result.directions
    };
  });
  
  // Apply flip to all players
  flippedData.forEach(({ player, newPosition, newDirections }) => {
    player.x = newPosition.x;
    player.y = newPosition.y;
    
    if (preserveDirections) {
      // Keep existing direction objects, just update keys
      player.directions = newDirections;
    } else {
      // Store for recreation
      player.flippedDirections = newDirections;
      player.directions = {};
    }
  });
  
  return {
    flippedCount: players.length,
    center,
    canUndo: true,
    originalData: flippedData.map(d => ({
      player: d.player,
      position: d.originalPosition,
      directions: d.originalDirections
    }))
  };
}

/**
 * Flip lineup with direction cleanup
 * Standard flip - clears direction DOM, stores keys for recreation
 * @param {Array<Object>} players - Players array
 * @param {Object} center - Center point
 * @returns {Object} Flip result
 */
export function flipLineupStandard(players, center = FLIP_CENTER) {
  return flipLineup(players, {
    center,
    preserveDirections: true
  });
}

/**
 * Toggle flip state
 * Flip if not flipped, unflip if flipped
 * @param {Array<Object>} players - Players array
 * @param {boolean} isCurrentlyFlipped - Current flip state
 * @param {Object} center - Center point
 * @returns {Object} Result with new state
 */
export function toggleFlip(players, isCurrentlyFlipped, center = FLIP_CENTER) {
  // Flip is symmetric - just flip again
  const result = flipLineup(players, { center, preserveDirections: true });
  
  return {
    ...result,
    isFlipped: !isCurrentlyFlipped
  };
}

// ============================================
// PARTIAL FLIP (SELECTED PLAYERS)
// ============================================

/**
 * Flip only selected players
 * @param {Array<Object>} allPlayers - All players
 * @param {Array<Object>} selectedPlayers - Players to flip
 * @param {Object} center - Center point (default: center of selection)
 * @returns {Object} Flip result
 */
export function flipSelected(allPlayers, selectedPlayers, center = null) {
  // Calculate center from selection if not provided
  const flipCenter = center || calculateSelectionCenter(selectedPlayers);
  
  // Only flip selected
  const result = flipLineup(selectedPlayers, {
    center: flipCenter,
    preserveDirections: false
  });
  
  return {
    ...result,
    totalPlayers: allPlayers.length,
    flippedPlayers: selectedPlayers
  };
}

// ============================================
// FLIP UTILITIES
// ============================================

/**
 * Calculate center of selection
 * @param {Array<Object>} players - Players array
 * @returns {Object} Center point {x, y}
 */
export function calculateSelectionCenter(players) {
  if (players.length === 0) {
    return FLIP_CENTER;
  }
  
  const sumX = players.reduce((sum, p) => sum + p.x, 0);
  const sumY = players.reduce((sum, p) => sum + p.y, 0);
  
  return {
    x: sumX / players.length,
    y: sumY / players.length
  };
}

/**
 * Calculate formation center
 * @param {Array<Object>} players - All players
 * @returns {Object} Center point {x, y}
 */
export function calculateFormationCenter(players) {
  return calculateSelectionCenter(players);
}

/**
 * Preview flip without applying
 * @param {Array<Object>} players - Players array
 * @param {Object} center - Center point
 * @returns {Array<Object>} Preview data [{player, position, directions}, ...]
 */
export function previewFlip(players, center = FLIP_CENTER) {
  return players.map(player => {
    const result = flipPlayer(player, center);
    return {
      player,
      currentPosition: { x: player.x, y: player.y },
      flippedPosition: result.position,
      currentDirections: { ...player.directions },
      flippedDirections: result.directions
    };
  });
}

/**
 * Check if player position would change on flip
 * @param {Object} player - Player object
 * @param {Object} center - Center point
 * @param {number} threshold - Min change threshold (default: 0.1%)
 * @returns {boolean} True if position would change significantly
 */
export function wouldFlipChangePosition(player, center = FLIP_CENTER, threshold = 0.1) {
  const result = flipPlayer(player, center);
  
  const deltaX = Math.abs(player.x - result.position.x);
  const deltaY = Math.abs(player.y - result.position.y);
  
  return deltaX > threshold || deltaY > threshold;
}

// ============================================
// FLIP STATE MANAGEMENT
// ============================================

/**
 * Prepare players for flip (cleanup before flip)
 * Clears flippedDirections temp data
 * @param {Array<Object>} players - Players array
 */
export function prepareForFlip(players) {
  players.forEach(player => {
    // Clean up any temp flip data
    delete player.flippedDirections;
  });
}

/**
 * Get flipped directions data for recreation
 * @param {Array<Object>} players - Players array
 * @returns {Map<Object, Object>} Map of player -> flipped directions
 */
export function getFlippedDirectionsData(players) {
  const map = new Map();
  
  players.forEach(player => {
    if (player.flippedDirections) {
      map.set(player, { ...player.flippedDirections });
    }
  });
  
  return map;
}

/**
 * Apply flipped directions data to players
 * @param {Map<Object, Object>} directionsMap - Map from getFlippedDirectionsData
 */
export function applyFlippedDirectionsData(directionsMap) {
  directionsMap.forEach((directions, player) => {
    player.directions = { ...directions };
    delete player.flippedDirections;
  });
}

/**
 * Cleanup flip temp data
 * @param {Array<Object>} players - Players array
 */
export function cleanupFlipData(players) {
  players.forEach(player => {
    delete player.flippedDirections;
  });
}

// ============================================
// FLIP VALIDATION
// ============================================

/**
 * Validate flip won't cause out-of-bounds
 * @param {Array<Object>} players - Players array
 * @param {Object} center - Center point
 * @param {Object} bounds - {minX, maxX, minY, maxY}
 * @returns {Object} Validation result {valid, outOfBounds}
 */
export function validateFlip(players, center = FLIP_CENTER, bounds = {}) {
  const {
    minX = 0,
    maxX = 100,
    minY = 0,
    maxY = 100
  } = bounds;
  
  const preview = previewFlip(players, center);
  const outOfBounds = preview.filter(p => {
    const pos = p.flippedPosition;
    return pos.x < minX || pos.x > maxX || pos.y < minY || pos.y > maxY;
  });
  
  return {
    valid: outOfBounds.length === 0,
    outOfBounds: outOfBounds.map(p => p.player),
    total: players.length
  };
}

/**
 * Check if lineup is symmetric (flip would have no effect)
 * @param {Array<Object>} players - Players array
 * @param {Object} center - Center point
 * @param {number} threshold - Position threshold (default: 1%)
 * @returns {boolean} True if symmetric
 */
export function isLineupSymmetric(players, center = FLIP_CENTER, threshold = 1) {
  return players.every(player => {
    const dx = Math.abs(player.x - center.x);
    const dy = Math.abs(player.y - center.y);
    return dx < threshold && dy < threshold;
  });
}

// ============================================
// FLIP HISTORY (for undo/redo)
// ============================================

/**
 * Create flip snapshot for undo
 * @param {Array<Object>} players - Players array
 * @returns {Object} Snapshot data
 */
export function createFlipSnapshot(players) {
  return players.map(player => ({
    player,
    x: player.x,
    y: player.y,
    directions: player.directions ? Object.keys(player.directions) : []
  }));
}

/**
 * Restore from flip snapshot
 * @param {Array<Object>} snapshot - Snapshot from createFlipSnapshot
 */
export function restoreFlipSnapshot(snapshot) {
  snapshot.forEach(({ player, x, y, directions }) => {
    player.x = x;
    player.y = y;
    player.directions = {};
    directions.forEach(key => {
      player.directions[key] = true;
    });
  });
}

// ============================================
// CONVENIENCE EXPORTS
// ============================================

/**
 * Get default flip center
 * @returns {Object} {x: 50, y: 50}
 */
export function getDefaultFlipCenter() {
  return { ...FLIP_CENTER };
}

/**
 * Check if point is at center
 * @param {Object} point - {x, y}
 * @param {number} threshold - Distance threshold
 * @returns {boolean} True if at center
 */
export function isAtCenter(point, threshold = 1) {
  const dx = Math.abs(point.x - FLIP_CENTER.x);
  const dy = Math.abs(point.y - FLIP_CENTER.y);
  return dx < threshold && dy < threshold;
}