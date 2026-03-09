/**
 * Selection State Management
 * 
 * Manages multi-select player state.
 * NO DOM manipulation - pure state logic.
 * State is ENCAPSULATED - only accessible via functions.
 */

// ============================================
// PRIVATE STATE (NOT EXPORTED)
// ============================================

/**
 * Currently selected players
 * @private
 */
let selectedPlayers = [];

/**
 * Primary selected player (first in selection)
 * @private
 */
let primaryPlayer = null;

// ============================================
// SELECTION OPERATIONS
// ============================================

/**
 * Select a single player (clears previous selection)
 * @param {Object} player - Player object to select
 * @returns {Object} Selection state {selected: [...], primary: player}
 */
export function selectPlayer(player) {
  console.log('⚠️ selectPlayer called for:', player.number);
  console.log('   Clearing previous selection:', selectedPlayers.map(p => p.number));
  console.trace('   Called from:'); // ← Stack trace để tìm ai gọi
  
  selectedPlayers = [player];
  primaryPlayer = player;
  
  return getSelectionState();
}

/**
 * Add player to selection (multi-select)
 * @param {Object} player - Player to add
 * @returns {Object} Selection state
 */
export function addToSelection(player) {
  console.log('➕ addToSelection called for player:', player.number);
  console.log('   Current selection:', selectedPlayers.map(p => p.number));
  console.log('   Already included?', selectedPlayers.includes(player));
  
  if (!selectedPlayers.includes(player)) {
    selectedPlayers.push(player);
    console.log('   ✅ Added! New selection:', selectedPlayers.map(p => p.number));
    
    // Set as primary if first selection
    if (selectedPlayers.length === 1) {
      primaryPlayer = player;
    }
  } else {
    console.log('   ⚠️ Already in selection, skipping');
  }
  
  return getSelectionState();
}

/**
 * Remove player from selection
 * @param {Object} player - Player to remove
 * @returns {Object} Selection state
 */
export function removeFromSelection(player) {
  const index = selectedPlayers.indexOf(player);
  
  if (index !== -1) {
    selectedPlayers.splice(index, 1);
    
    // Update primary if removed
    if (primaryPlayer === player) {
      primaryPlayer = selectedPlayers[0] || null;
    }
  }
  
  return getSelectionState();
}

/**
 * Toggle player selection
 * @param {Object} player - Player to toggle
 * @returns {Object} Selection state
 */
export function toggleSelection(player) {
  if (selectedPlayers.includes(player)) {
    return removeFromSelection(player);
  } else {
    return addToSelection(player);
  }
}

/**
 * Handle click with multi-select modifier
 * @param {Object} player - Player clicked
 * @param {boolean} isMultiSelect - Ctrl/Cmd key pressed
 * @returns {Object} Selection state
 */
export function handlePlayerClick(player, isMultiSelect) {
  console.log('🎯 handlePlayerClick:', player.number, '| Multi:', isMultiSelect);

  if (isMultiSelect) {
    const selected = getSelectedPlayers();

    if (selected.includes(player)) {
      console.log('   → Removing from selection');
      return removeFromSelection(player); // 🔥 bỏ chọn
    } else {
      console.log('   → Adding to selection');
      return addToSelection(player); // thêm vào
    }
  } else {
    console.log('   → Single select');
    return selectPlayer(player);
  }
}


/**
 * Clear all selection
 * @returns {Object} Empty selection state
 */
export function clearSelection() {
  selectedPlayers = [];
  primaryPlayer = null;
  
  return getSelectionState();
}

/**
 * Select all players
 * @param {Array<Object>} players - All players
 * @returns {Object} Selection state
 */
export function selectAll(players) {
  selectedPlayers = [...players];
  primaryPlayer = players[0] || null;
  
  return getSelectionState();
}

/**
 * Select players by indices
 * @param {Array<Object>} players - All players
 * @param {Array<number>} indices - Indices to select
 * @returns {Object} Selection state
 */
export function selectByIndices(players, indices) {
  selectedPlayers = indices
    .map(i => players[i])
    .filter(p => p !== undefined);
  
  primaryPlayer = selectedPlayers[0] || null;
  
  return getSelectionState();
}

/**
 * Select players by role
 * @param {Array<Object>} players - All players
 * @param {string} role - Role to select ('GK', 'CB', etc.)
 * @returns {Object} Selection state
 */
export function selectByRole(players, role) {
  selectedPlayers = players.filter(p => p.role === role);
  primaryPlayer = selectedPlayers[0] || null;
  
  return getSelectionState();
}

// ============================================
// SELECTION QUERIES
// ============================================

/**
 * Get current selection state
 * @returns {Object} {selected: [...], primary: player|null, count: number}
 */
export function getSelectionState() {
  return {
    selected: [...selectedPlayers], // Return copy
    primary: primaryPlayer,
    count: selectedPlayers.length
  };
}

/**
 * Get selected players (copy)
 * @returns {Array<Object>} Selected players
 */
export function getSelectedPlayers() {
  return [...selectedPlayers];
}

/**
 * Get primary selected player
 * @returns {Object|null} Primary player or null
 */
export function getPrimaryPlayer() {
  return primaryPlayer;
}

/**
 * Get selection count
 * @returns {number} Number of selected players
 */
export function getSelectionCount() {
  return selectedPlayers.length;
}

/**
 * Check if player is selected
 * @param {Object} player - Player to check
 * @returns {boolean} True if selected
 */
export function isPlayerSelected(player) {
  return selectedPlayers.includes(player);
}

/**
 * Check if has selection
 * @returns {boolean} True if any player selected
 */
export function hasSelection() {
  return selectedPlayers.length > 0;
}

/**
 * Check if multiple players selected
 * @returns {boolean} True if 2+ players selected
 */
export function isMultipleSelection() {
  return selectedPlayers.length > 1;
}

/**
 * Check if single player selected
 * @returns {boolean} True if exactly 1 player selected
 */
export function isSingleSelection() {
  return selectedPlayers.length === 1;
}

// ============================================
// SELECTION VALIDATION
// ============================================

/**
 * Get selected player indices
 * @param {Array<Object>} allPlayers - All players array
 * @returns {Array<number>} Indices of selected players
 */
export function getSelectedIndices(allPlayers) {
  return selectedPlayers
    .map(p => allPlayers.indexOf(p))
    .filter(i => i !== -1);
}

/**
 * Check if all players selected
 * @param {Array<Object>} allPlayers - All players
 * @returns {boolean} True if all selected
 */
export function isAllSelected(allPlayers) {
  return selectedPlayers.length === allPlayers.length;
}

/**
 * Get unselected players
 * @param {Array<Object>} allPlayers - All players
 * @returns {Array<Object>} Unselected players
 */
export function getUnselectedPlayers(allPlayers) {
  return allPlayers.filter(p => !selectedPlayers.includes(p));
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Replace entire selection
 * @param {Array<Object>} players - New selection
 * @returns {Object} Selection state
 */
export function setSelection(players) {
  selectedPlayers = [...players];
  primaryPlayer = players[0] || null;
  
  return getSelectionState();
}

/**
 * Apply operation to selected players
 * @param {Function} operation - Function to apply (player => void)
 * @returns {Array<Object>} Selected players
 */
export function forEachSelected(operation) {
  selectedPlayers.forEach(operation);
  return [...selectedPlayers];
}

/**
 * Map operation over selected players
 * @param {Function} mapper - Mapping function (player => result)
 * @returns {Array} Mapped results
 */
export function mapSelected(mapper) {
  return selectedPlayers.map(mapper);
}

/**
 * Filter selected players
 * @param {Function} predicate - Filter function (player => boolean)
 * @returns {Array<Object>} Filtered players
 */
export function filterSelected(predicate) {
  return selectedPlayers.filter(predicate);
}

// ============================================
// SELECTION PERSISTENCE
// ============================================

/**
 * Save selection state (for undo/redo or persistence)
 * @returns {Object} Serializable selection state
 */
export function saveSelectionState() {
  return {
    selectedIndices: selectedPlayers.map(p => p.number - 1), // Use number as stable ID
    primaryIndex: primaryPlayer ? primaryPlayer.number - 1 : null
  };
}

/**
 * Restore selection from saved state
 * @param {Array<Object>} allPlayers - All players
 * @param {Object} savedState - Saved state from saveSelectionState
 * @returns {Object} Selection state
 */
export function restoreSelectionState(allPlayers, savedState) {
  if (!savedState) {
    return clearSelection();
  }
  
  selectedPlayers = savedState.selectedIndices
    .map(i => allPlayers[i])
    .filter(p => p !== undefined);
  
  if (savedState.primaryIndex !== null && allPlayers[savedState.primaryIndex]) {
    primaryPlayer = allPlayers[savedState.primaryIndex];
  } else {
    primaryPlayer = selectedPlayers[0] || null;
  }
  
  return getSelectionState();
}

// ============================================
// ADVANCED QUERIES
// ============================================

/**
 * Get common properties of selected players
 * @returns {Object} Common properties {role: string|null, card: string|null, ...}
 */
export function getCommonProperties() {
  if (selectedPlayers.length === 0) {
    return null;
  }
  
  const first = selectedPlayers[0];
  const common = {};
  
  // Check role
  const sameRole = selectedPlayers.every(p => p.role === first.role);
  common.role = sameRole ? first.role : null;
  
  // Check card
  const sameCard = selectedPlayers.every(p => p.card === first.card);
  common.card = sameCard ? first.card : null;
  
  // Check custom color
  const sameCustomColor = selectedPlayers.every(p => p.customColor === first.customColor);
  common.customColor = sameCustomColor ? first.customColor : null;
  
  return common;
}

/**
 * Get selection bounds (min/max positions)
 * @returns {Object|null} {minX, maxX, minY, maxY, centerX, centerY}
 */
export function getSelectionBounds() {
  if (selectedPlayers.length === 0) {
    return null;
  }
  
  const xValues = selectedPlayers.map(p => p.x);
  const yValues = selectedPlayers.map(p => p.y);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

/**
 * Check if selection contains role
 * @param {string} role - Role to check
 * @returns {boolean} True if any selected player has this role
 */
export function selectionHasRole(role) {
  return selectedPlayers.some(p => p.role === role);
}