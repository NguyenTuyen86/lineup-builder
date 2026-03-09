/**
 * Squad Management Module
 * 
 * Manages full squad (all players), lineup (on field), and bench.
 * Pure logic - NO DOM manipulation.
 */

// ============================================
// PLAYER LOCATION TYPES
// ============================================

export const LOCATION = {
  LINEUP: 'lineup',
  BENCH: 'bench'
};

// ============================================
// SQUAD INITIALIZATION
// ============================================

/**
 * Create initial squad with lineup + bench
 * @param {Array<Object>} lineupPlayers - Players on field (5/7/11)
 * @param {number} benchSize - Number of bench players (default: 15 for max 26 total)
 * @returns {Object} {squad, lineup, bench}
 */
export function createSquad(lineupPlayers, benchSize = 15) {
  // Mark lineup players
  const lineup = lineupPlayers.map((p, index) => ({
    ...p,
    location: LOCATION.LINEUP,
    slotIndex: index,
    benchIndex: undefined  // ✅ Lineup players don't have benchIndex
  }));
  
  // Create bench players
  const bench = [];
  const startNumber = lineupPlayers.length + 1;
  
  for (let i = 0; i < benchSize; i++) {
    bench.push({
      x: 50,  // Default position (not used when on bench)
      y: 50,
      number: startNumber + i,
      name: `Player ${startNumber + i}`,
      role: 'SUB',
      location: LOCATION.BENCH,
      slotIndex: null,
      benchIndex: i,  // ✅ Track bench order
      customColor: null,
      avatar: null,
      card: null,
      directions: {}
    });
  }
  
  const squad = [...lineup, ...bench];
  
  return { squad, lineup, bench };
}

/**
 * Split squad into lineup and bench
 * @param {Array<Object>} squad - Full squad
 * @returns {Object} {lineup, bench}
 */
export function splitSquad(squad) {
  const lineup = squad.filter(p => p.location === LOCATION.LINEUP);
  const bench = squad.filter(p => p.location === LOCATION.BENCH);
  
  return { lineup, bench };
}

// ============================================
// SQUAD QUERIES
// ============================================

/**
 * Get players on field (lineup)
 * @param {Array<Object>} squad - Full squad
 * @returns {Array<Object>} Lineup players sorted by slotIndex
 */
export function getLineup(squad) {
  return squad
    .filter(p => p.location === LOCATION.LINEUP)
    .sort((a, b) => a.slotIndex - b.slotIndex);
}

/**
 * Get bench players
 * @param {Array<Object>} squad - Full squad
 * @returns {Array<Object>} Bench players
 */
export function getBench(squad) {
  return squad.filter(p => p.location === LOCATION.BENCH);
}

/**
 * Get player by number
 * @param {Array<Object>} squad - Full squad
 * @param {number} number - Player number
 * @returns {Object|null} Player or null
 */
export function getPlayerByNumber(squad, number) {
  return squad.find(p => p.number === number) || null;
}

/**
 * Check if player is in lineup
 * @param {Object} player - Player object
 * @returns {boolean} True if in lineup
 */
export function isInLineup(player) {
  return player.location === LOCATION.LINEUP;
}

/**
 * Check if player is on bench
 * @param {Object} player - Player object
 * @returns {boolean} True if on bench
 */
export function isOnBench(player) {
  return player.location === LOCATION.BENCH;
}

// ============================================
// MOVE PLAYERS
// ============================================

/**
 * Move player to lineup at specific slot
 * @param {Object} player - Player to move
 * @param {number} slotIndex - Slot index (0-10)
 * @returns {boolean} True if moved
 */
export function moveToLineup(player, slotIndex) {
  if (player.location === LOCATION.LINEUP && player.slotIndex === slotIndex) {
    return false; // Already there
  }
  
  player.location = LOCATION.LINEUP;
  player.slotIndex = slotIndex;
  
  return true;
}

/**
 * Move player to bench
 * @param {Object} player - Player to move
 * @returns {boolean} True if moved
 */
export function moveToBench(player) {
  if (player.location === LOCATION.BENCH) {
    return false; // Already on bench
  }
  
  player.location = LOCATION.BENCH;
  player.slotIndex = null;
  
  return true;
}

// ============================================
// SWAP PLAYERS
// ============================================

/**
 * Swap two players (bench <-> lineup)
 * Swaps position, location, but KEEPS individual properties (name, avatar, color, card)
 * @param {Object} player1 - First player (bench or lineup)
 * @param {Object} player2 - Second player (bench or lineup)
 * @returns {boolean} True if swapped
 */
export function swapPlayers(player1, player2) {
  // ✅ SWAP x,y positions (bench player → lineup position, lineup player → bench default)
  const tempX = player1.x;
  const tempY = player1.y;
  player1.x = player2.x;
  player1.y = player2.y;
  player2.x = tempX;
  player2.y = tempY;
  
  // ✅ SWAP locations (bench ↔ lineup)
  const tempLocation = player1.location;
  player1.location = player2.location;
  player2.location = tempLocation;
  
  // ✅ SWAP slot indices (lineup position)
  const tempSlot = player1.slotIndex;
  player1.slotIndex = player2.slotIndex;
  player2.slotIndex = tempSlot;
  
  // ✅ SWAP bench indices (bench order position)
  const tempBenchIndex = player1.benchIndex;
  player1.benchIndex = player2.benchIndex;
  player2.benchIndex = tempBenchIndex;
  
  // ✅ SWAP role (lineup role ↔ bench SUB)
  const tempRole = player1.role;
  player1.role = player2.role;
  player2.role = tempRole;
  
  // ✅ DO NOT swap: number, name, customColor, avatar, card
  // These stay with the player (personal properties)
  
  return true;
}

/**
 * Replace lineup player with bench player
 * @param {Object} lineupPlayer - Player on field
 * @param {Object} benchPlayer - Player on bench
 * @returns {boolean} True if substituted
 */
export function substitutePlayer(lineupPlayer, benchPlayer) {
  if (lineupPlayer.location !== LOCATION.LINEUP) return false;
  if (benchPlayer.location !== LOCATION.BENCH) return false;
  
  // Copy position from lineup player to bench player
  benchPlayer.x = lineupPlayer.x;
  benchPlayer.y = lineupPlayer.y;
  
  return swapPlayers(lineupPlayer, benchPlayer);
}

// ============================================
// ADD/REMOVE PLAYERS
// ============================================

/**
 * Add new player to squad (goes to bench by default)
 * @param {Array<Object>} squad - Squad array
 * @param {Object} playerData - Player data (name, role, etc.)
 * @returns {Object} New player
 */
export function addPlayerToSquad(squad, playerData = {}) {
  const maxNumber = Math.max(...squad.map(p => p.number), 0);
  
  // Get max benchIndex to append at end
  const benchPlayers = squad.filter(p => p.location === LOCATION.BENCH);
  const maxBenchIndex = benchPlayers.length > 0 
    ? Math.max(...benchPlayers.map(p => p.benchIndex || 0), 0)
    : -1;
  
  const newPlayer = {
    x: 50,
    y: 50,
    number: maxNumber + 1,
    name: playerData.name || `Player ${maxNumber + 1}`,
    role: playerData.role || 'SUB',
    location: LOCATION.BENCH,
    slotIndex: null,
    benchIndex: maxBenchIndex + 1,  // ✅ Add at end of bench
    customColor: playerData.customColor || null,
    avatar: playerData.avatar || null,
    card: null,
    directions: {}
  };
  
  squad.push(newPlayer);
  return newPlayer;
}

/**
 * Remove player from squad
 * @param {Array<Object>} squad - Squad array
 * @param {Object} player - Player to remove
 * @returns {boolean} True if removed
 */
export function removePlayerFromSquad(squad, player) {
  const index = squad.indexOf(player);
  if (index === -1) return false;
  
  // Can't remove if in lineup
  if (player.location === LOCATION.LINEUP) {
    return false;
  }
  
  squad.splice(index, 1);
  return true;
}

// ============================================
// FORMATION CHANGE HELPERS
// ============================================

/**
 * Smart resize squad when changing player count
 * Preserves existing player data (avatar, name, colors, etc.)
 * @param {Array<Object>} squad - Squad array
 * @param {number} newPlayerCount - New player count (5/7/11)
 * @param {Function} getFormationData - Function to get formation positions
 * @returns {Object} {squad, lineup, bench}
 */
export function adjustSquadForNewPlayerCount(squad, newPlayerCount, getFormationData) {
  const currentLineup = squad.filter(p => p.location === LOCATION.LINEUP)
    .sort((a, b) => a.slotIndex - b.slotIndex);
  const currentBench = squad.filter(p => p.location === LOCATION.BENCH);
  const currentCount = currentLineup.length;
  
  // Get new formation positions
  const newFormationData = getFormationData();
  
  if (newPlayerCount > currentCount) {
    // INCREASE: Keep existing + add from bench or create new
    const slotsNeeded = newPlayerCount - currentCount;
    
    // First: Try to fill from bench
    const playersFromBench = currentBench.slice(0, slotsNeeded);
    
    playersFromBench.forEach((p, i) => {
      const index = currentCount + i;
      // Move bench player to lineup
      p.location = LOCATION.LINEUP;
      p.slotIndex = index;
      p.x = newFormationData[index].x;
      p.y = newFormationData[index].y;
      p.role = newFormationData[index].role;
    });
    
    // Second: If bench not enough, create new players
    const stillNeeded = slotsNeeded - playersFromBench.length;
    if (stillNeeded > 0) {
      const maxNumber = Math.max(...squad.map(p => p.number), 0);
      
      for (let i = 0; i < stillNeeded; i++) {
        const index = currentCount + playersFromBench.length + i;
        const newPlayer = {
          number: maxNumber + i + 1,
          name: `Player ${maxNumber + i + 1}`,
          role: newFormationData[index].role,
          location: LOCATION.LINEUP,
          slotIndex: index,
          x: newFormationData[index].x,
          y: newFormationData[index].y,
          customColor: null,
          avatar: null,
          card: null,
          directions: {}
        };
        squad.push(newPlayer);
      }
    }
    
    // Update positions of existing lineup players (preserve data, only change x,y,role)
    currentLineup.forEach((p, i) => {
      p.x = newFormationData[i].x;
      p.y = newFormationData[i].y;
      p.role = newFormationData[i].role;
      p.slotIndex = i;
    });
    
  } else if (newPlayerCount < currentCount) {
    // DECREASE: Keep first N, move rest to bench
    
    // Get max benchIndex from existing bench
    const existingBench = squad.filter(p => p.location === LOCATION.BENCH);
    let maxBenchIndex = existingBench.length > 0
      ? Math.max(...existingBench.map(p => p.benchIndex || 0), 0)
      : -1;
    
    currentLineup.forEach((p, i) => {
      if (i < newPlayerCount) {
        // Keep in lineup, update position
        p.x = newFormationData[i].x;
        p.y = newFormationData[i].y;
        p.role = newFormationData[i].role;
        p.slotIndex = i;
        p.location = LOCATION.LINEUP;
      } else {
        // Move to bench (preserve all other data)
        p.location = LOCATION.BENCH;
        p.slotIndex = null;
        p.role = 'SUB';
        // ✅ Assign benchIndex at end of bench
        maxBenchIndex++;
        p.benchIndex = maxBenchIndex;
      }
    });
  } else {
    // SAME COUNT: Just update positions (e.g., formation change)
    currentLineup.forEach((p, i) => {
      p.x = newFormationData[i].x;
      p.y = newFormationData[i].y;
      p.role = newFormationData[i].role;
      p.slotIndex = i;
    });
  }
  
  // Re-sync arrays
  const lineup = squad.filter(p => p.location === LOCATION.LINEUP)
    .sort((a, b) => a.slotIndex - b.slotIndex);
  const bench = squad.filter(p => p.location === LOCATION.BENCH);
  
  return { squad, lineup, bench };
}

/**
 * Adjust lineup when formation changes
 * If new formation needs fewer players, move extras to bench
 * @param {Array<Object>} squad - Squad array
 * @param {number} newPlayerCount - New player count (5/7/11)
 * @returns {Object} {movedToBench: [...]}
 */
export function adjustLineupForFormation(squad, newPlayerCount) {
  const lineup = getLineup(squad);
  const movedToBench = [];
  
  if (lineup.length > newPlayerCount) {
    // Move extras to bench (from end)
    for (let i = newPlayerCount; i < lineup.length; i++) {
      const player = lineup[i];
      moveToBench(player);
      movedToBench.push(player);
    }
    
    // Reindex remaining lineup
    const newLineup = getLineup(squad);
    newLineup.forEach((p, index) => {
      p.slotIndex = index;
    });
  }
  
  return { movedToBench };
}

/**
 * Fill empty lineup slots with bench players
 * @param {Array<Object>} squad - Squad array
 * @param {number} targetPlayerCount - Target player count
 * @returns {Object} {movedToLineup: [...]}
 */
export function fillLineupFromBench(squad, targetPlayerCount) {
  const lineup = getLineup(squad);
  const bench = getBench(squad);
  const movedToLineup = [];
  
  const slotsNeeded = targetPlayerCount - lineup.length;
  
  for (let i = 0; i < slotsNeeded && bench.length > 0; i++) {
    const player = bench[0];
    const slotIndex = lineup.length + i;
    moveToLineup(player, slotIndex);
    movedToLineup.push(player);
  }
  
  return { movedToLineup };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate squad structure
 * @param {Array<Object>} squad - Squad to validate
 * @returns {Object} {valid, errors}
 */
export function validateSquad(squad) {
  const errors = [];
  
  if (!Array.isArray(squad)) {
    errors.push('Squad must be an array');
    return { valid: false, errors };
  }
  
  // Check for duplicate numbers
  const numbers = squad.map(p => p.number);
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate numbers: ${duplicates.join(', ')}`);
  }
  
  // Check lineup slot indices are sequential
  const lineup = getLineup(squad);
  const slots = lineup.map(p => p.slotIndex).sort((a, b) => a - b);
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] !== i) {
      errors.push(`Invalid lineup slot indices: ${slots.join(', ')}`);
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serialize squad for saving
 * @param {Array<Object>} squad - Squad array
 * @returns {Array<Object>} Serialized squad
 */
export function serializeSquad(squad) {
  return squad.map(p => ({
    number: p.number,
    name: p.name,
    role: p.role,
    location: p.location,
    slotIndex: p.slotIndex,
    x: p.x,
    y: p.y,
    customColor: p.customColor,
    avatar: p.avatar,
    card: p.card,
    directions: p.directions ? Object.keys(p.directions) : []
  }));
}

/**
 * Deserialize squad from saved data
 * @param {Array<Object>} savedSquad - Saved squad data
 * @returns {Array<Object>} Deserialized squad
 */
export function deserializeSquad(savedSquad) {
  return savedSquad.map(p => ({
    number: p.number,
    name: p.name,
    role: p.role,
    location: p.location || LOCATION.BENCH,
    slotIndex: p.slotIndex !== undefined ? p.slotIndex : null,
    x: p.x || 50,
    y: p.y || 50,
    customColor: p.customColor || null,
    avatar: p.avatar || null,
    card: p.card || null,
    directions: {}  // Will be populated later
  }));
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get squad statistics
 * @param {Array<Object>} squad - Squad array
 * @returns {Object} Stats
 */
export function getSquadStats(squad) {
  const lineup = getLineup(squad);
  const bench = getBench(squad);
  
  return {
    total: squad.length,
    lineup: lineup.length,
    bench: bench.length,
    withAvatar: squad.filter(p => p.avatar).length,
    withCard: squad.filter(p => p.card).length
  };
}

/**
 * Find first available bench player by role
 * @param {Array<Object>} squad - Squad array
 * @param {string} role - Role to match
 * @returns {Object|null} Bench player or null
 */
export function findBenchPlayerByRole(squad, role) {
  const bench = getBench(squad);
  return bench.find(p => p.role === role) || bench[0] || null;
}