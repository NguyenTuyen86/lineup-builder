/**
 * Player Data Model
 * 
 * Pure data structure for a football player.
 * NO DOM references, NO UI logic.
 */

/**
 * Create a new player with formation data
 * @param {Object} formationData - {x, y, role} from formation
 * @param {number} index - Player index (0-based)
 * @returns {Object} Player object
 */
export function createPlayer(formationData, index) {
  return {
    // Position (percentage)
    x: formationData.x,
    y: formationData.y,
    
    // Identity
    number: index + 1,
    name: `Player ${index + 1}`,
    role: formationData.role,
    
    // Customization (optional)
    customColor: null,
    avatar: null,      // base64 string
    card: null,        // '', 'yellow', or 'red'
    
    // Directions (arrow keys as object keys)
    // e.g., {'↑': true, '→': true}
    // Note: In runtime, values will be DOM elements
    // But for serialization, only keys matter
    directions: {}
  };
}

/**
 * Create player from loaded JSON data
 * @param {Object} savedData - Player data from JSON
 * @returns {Object} Player object
 */
export function createPlayerFromSave(savedData) {
  return {
    x: Number(savedData.x),
    y: Number(savedData.y),
    number: savedData.number,
    name: savedData.name,
    role: savedData.role,
    customColor: savedData.customColor || null,
    avatar: savedData.avatar || null,
    card: savedData.card || null,
    directions: {} // Will be populated after DOM creation
  };
}

/**
 * Serialize player for saving (remove DOM references)
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
    customColor: player.customColor || null,
    avatar: player.avatar || null,
    card: player.card || null,
    directions: player.directions ? Object.keys(player.directions) : []
  };
}

/**
 * Reset player to formation defaults
 * @param {Object} player - Player to reset
 * @param {Object} formationData - {x, y, role} from formation
 * @param {number} index - Player index
 * @param {boolean} isFlipped - Whether formation is flipped
 */
export function resetPlayerToFormation(player, formationData, index, isFlipped) {
  // Reset position and role
  player.x = formationData.x;
  player.y = formationData.y;
  player.role = formationData.role;
  
  // Apply flip if needed
  if (isFlipped) {
    const centerX = 50;
    const centerY = 50;
    const dx = player.x - centerX;
    const dy = player.y - centerY;
    player.x = centerX - dx;
    player.y = centerY - dy;
  }
  
  // Reset identity
  player.name = `Player ${index + 1}`;
  player.number = index + 1;
  
  // Clear customization
  player.customColor = null;
  player.avatar = null;
  player.card = null;
  player.directions = {};
}

/**
 * Flip player position 180 degrees
 * @param {Object} player - Player to flip
 */
export function flipPlayerPosition(player) {
  const centerX = 50;
  const centerY = 50;
  const dx = player.x - centerX;
  const dy = player.y - centerY;
  player.x = centerX - dx;
  player.y = centerY - dy;
}

/**
 * Get direction keys that should be flipped
 * @param {Object} directions - Current directions object
 * @returns {Object} Flipped direction keys map
 */
export function getFlippedDirections(directions) {
  if (!directions || typeof directions !== 'object') return {};
  
  const flipMap = {
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
  
  const flipped = {};
  Object.keys(directions).forEach(key => {
    const flippedKey = flipMap[key] || key;
    flipped[flippedKey] = true;
  });
  
  return flipped;
}

/**
 * Check if player has any customization
 * @param {Object} player - Player object
 * @returns {boolean} True if customized
 */
export function isPlayerCustomized(player) {
  return !!(
    player.customColor ||
    player.avatar ||
    player.card ||
    (player.directions && Object.keys(player.directions).length > 0)
  );
}

/**
 * Validate player data
 * @param {Object} player - Player to validate
 * @returns {boolean} True if valid
 */
export function validatePlayer(player) {
  return (
    typeof player.x === 'number' &&
    typeof player.y === 'number' &&
    typeof player.number === 'number' &&
    typeof player.name === 'string' &&
    typeof player.role === 'string' &&
    player.x >= 0 && player.x <= 100 &&
    player.y >= 0 && player.y <= 100
  );
}