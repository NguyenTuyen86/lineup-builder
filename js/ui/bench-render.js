/**
 * Bench Render Module
 * 
 * Renders bench players in bench zone.
 * Static rendering only (no drag in Phase 1).
 */

// ============================================
// BENCH RENDERING
// ============================================

/**
 * Render all bench players
 * @param {HTMLElement} benchElement - Bench zone container
 * @param {Array<Object>} benchPlayers - Players on bench
 * @param {Object} options - Render options
 */
export function renderBench(benchElement, benchPlayers, options = {}) {
  if (!benchElement) return;
  
  const {
    onPlayerClick = null,
    onPlayerDelete = null,
    onAddPlayer = null
  } = options;
  
  // Clear existing bench
  benchElement.innerHTML = '';
  
  // 🆕 Add "Add New Player" button
  if (onAddPlayer) {
    const addBtn = document.createElement('button');
    addBtn.className = 'bench-add-btn';
    addBtn.innerHTML = '➕<br><span>Add Player</span>';
    addBtn.title = 'Add new player to bench';
    addBtn.onclick = onAddPlayer;
    benchElement.appendChild(addBtn);
  }
  
  // ✅ Sort by benchIndex (preserve swap order)
  const sortedBench = [...benchPlayers].sort((a, b) => {
    // If benchIndex exists, sort by it
    if (a.benchIndex !== undefined && b.benchIndex !== undefined) {
      return a.benchIndex - b.benchIndex;
    }
    // Fallback: sort by number
    return a.number - b.number;
  });
  
  // Render each bench player
  sortedBench.forEach(player => {
    const playerCard = createBenchPlayerCard(player, { 
      onPlayerClick,
      onPlayerDelete
    });
    benchElement.appendChild(playerCard);
  });
}

/**
 * Create bench player card element
 * @param {Object} player - Player data
 * @param {Object} options - Options
 * @returns {HTMLElement} Player card
 */
function createBenchPlayerCard(player, options = {}) {
  const { onPlayerClick, onPlayerDelete } = options;
  
  const card = document.createElement('div');
  card.className = 'bench-player';
  card.dataset.playerNumber = player.number;
  
  // Avatar container
  const avatar = document.createElement('div');
  avatar.className = 'bench-player-avatar';
  
  if (player.avatar) {
    const img = document.createElement('img');
    img.src = player.avatar;
    img.alt = player.name;
    avatar.appendChild(img);
  } else {
    // Show number if no avatar (like lineup players)
    avatar.textContent = player.number;
    avatar.style.fontSize = '24px';
    avatar.style.fontWeight = 'bold';
    avatar.style.color = '#888';
  }
  
  // Number badge (always on top)
  const numberBadge = document.createElement('div');
  numberBadge.className = 'bench-player-number';
  numberBadge.textContent = player.number;
  avatar.appendChild(numberBadge);
  
  // ✅ Card indicator (yellow/red card)
  if (player.card === 'yellow') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'bench-card-indicator bench-card-yellow';
    avatar.appendChild(cardIndicator);
  } else if (player.card === 'red') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'bench-card-indicator bench-card-red';
    avatar.appendChild(cardIndicator);
  }
  
  // Player name
  const name = document.createElement('div');
  name.className = 'bench-player-name';
  name.textContent = player.name;
  name.title = player.name; // Tooltip for long names
  
  // Player role
  const role = document.createElement('div');
  role.className = 'bench-player-role';
  role.textContent = player.role;
  
  // 🆕 Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'bench-delete-btn';
  deleteBtn.innerHTML = '🗑';
  deleteBtn.title = 'Delete player';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    if (onPlayerDelete) {
      if (confirm(`Delete ${player.name}?`)) {
        onPlayerDelete(player);
      }
    }
  };
  
  // Assemble card
  card.appendChild(avatar);
  card.appendChild(name);
  card.appendChild(role);
  card.appendChild(deleteBtn);
  
  // Add click handler
  if (onPlayerClick) {
    card.addEventListener('click', (e) => {
      // ✅ Don't trigger click if just dragged
      if (card._wasJustDragged && card._wasJustDragged()) {
        console.log('⏭ Skipping click - was dragging');
        return;
      }
      
      onPlayerClick(player, card, e);  // ✅ Pass event for multi-select
    });
  }
  
  // Store reference to player
  card._player = player;
  
  return card;
}

/**
 * Update single bench player card
 * @param {HTMLElement} card - Player card element
 * @param {Object} player - Updated player data
 */
export function updateBenchPlayerCard(card, player) {
  if (!card || !player) return;
  
  // Update avatar
  const avatar = card.querySelector('.bench-player-avatar');
  if (avatar) {
    if (player.avatar) {
      avatar.innerHTML = '';
      const img = document.createElement('img');
      img.src = player.avatar;
      img.alt = player.name;
      avatar.appendChild(img);
      
      // Re-add number badge
      const numberBadge = document.createElement('div');
      numberBadge.className = 'bench-player-number';
      numberBadge.textContent = player.number;
      avatar.appendChild(numberBadge);
    } else {
      const initials = getInitials(player.name);
      avatar.textContent = initials;
    }
  }
  
  // Update name
  const name = card.querySelector('.bench-player-name');
  if (name) {
    name.textContent = player.name;
    name.title = player.name;
  }
  
  // Update role
  const role = card.querySelector('.bench-player-role');
  if (role) {
    role.textContent = player.role;
  }
  
  // Update number badge
  const numberBadge = card.querySelector('.bench-player-number');
  if (numberBadge) {
    numberBadge.textContent = player.number;
  }
  
  // Update stored reference
  card._player = player;
}

/**
 * Find bench card by player
 * @param {HTMLElement} benchElement - Bench zone
 * @param {Object} player - Player to find
 * @returns {HTMLElement|null} Card element or null
 */
export function findBenchCard(benchElement, player) {
  if (!benchElement || !player) return null;
  
  const cards = benchElement.querySelectorAll('.bench-player');
  
  for (const card of cards) {
    if (card._player === player || card.dataset.playerNumber == player.number) {
      return card;
    }
  }
  
  return null;
}

/**
 * Remove bench player card
 * @param {HTMLElement} benchElement - Bench zone
 * @param {Object} player - Player to remove
 */
export function removeBenchPlayerCard(benchElement, player) {
  const card = findBenchCard(benchElement, player);
  if (card) {
    card.remove();
  }
}

/**
 * Add bench player card
 * @param {HTMLElement} benchElement - Bench zone
 * @param {Object} player - Player to add
 * @param {Object} options - Options
 */
export function addBenchPlayerCard(benchElement, player, options = {}) {
  const card = createBenchPlayerCard(player, options);
  benchElement.appendChild(card);
}

/**
 * Highlight bench player (for selection)
 * @param {HTMLElement} card - Player card
 * @param {boolean} highlighted - Whether to highlight
 */
export function highlightBenchPlayer(card, highlighted = true) {
  if (!card) return;
  
  if (highlighted) {
    card.style.borderColor = '#ffd700';
    card.style.background = '#3a3a3a';
  } else {
    card.style.borderColor = '#444';
    card.style.background = '#333';
  }
}

/**
 * Clear all bench highlights
 * @param {HTMLElement} benchElement - Bench zone
 */
export function clearBenchHighlights(benchElement) {
  if (!benchElement) return;
  
  const cards = benchElement.querySelectorAll('.bench-player');
  cards.forEach(card => highlightBenchPlayer(card, false));
}

// ============================================
// UTILITIES
// ============================================

/**
 * Get initials from name
 * @param {string} name - Player name
 * @returns {string} Initials (max 2 chars)
 */
function getInitials(name) {
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Sort bench players
 * @param {Array<Object>} benchPlayers - Players array
 * @param {string} sortBy - Sort field ('number', 'name', 'role')
 * @returns {Array<Object>} Sorted array
 */
export function sortBenchPlayers(benchPlayers, sortBy = 'number') {
  const sorted = [...benchPlayers];
  
  switch (sortBy) {
    case 'number':
      sorted.sort((a, b) => a.number - b.number);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'role':
      sorted.sort((a, b) => a.role.localeCompare(b.role));
      break;
  }
  
  return sorted;
}

/**
 * Filter bench players
 * @param {Array<Object>} benchPlayers - Players array
 * @param {string} searchText - Search text
 * @returns {Array<Object>} Filtered array
 */
export function filterBenchPlayers(benchPlayers, searchText) {
  if (!searchText) return benchPlayers;
  
  const search = searchText.toLowerCase().trim();
  
  return benchPlayers.filter(p => 
    p.name.toLowerCase().includes(search) ||
    p.role.toLowerCase().includes(search) ||
    p.number.toString().includes(search)
  );
}

/**
 * Get bench statistics
 * @param {Array<Object>} benchPlayers - Players array
 * @returns {Object} Statistics
 */
export function getBenchStats(benchPlayers) {
  return {
    total: benchPlayers.length,
    withAvatar: benchPlayers.filter(p => p.avatar).length,
    roles: [...new Set(benchPlayers.map(p => p.role))]
  };
}