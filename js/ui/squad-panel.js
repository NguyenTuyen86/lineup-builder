/**
 * Squad Panel Module
 * 
 * Renders squad management UI in sidebar.
 * Shows all players with add/edit/delete actions.
 */

// ============================================
// RENDER SQUAD LIST
// ============================================

/**
 * Render squad list in sidebar (with staff section)
 * @param {HTMLElement} container - Squad list container
 * @param {Array<Object>} squad - All players
 * @param {Array<Object>} staff - Staff members
 * @param {Object} options - Render options
 */
export function renderSquadList(container, squad, staff = [], options = {}) {
  const {
    onPlayerClick = null,
    onPlayerDelete = null,
    onStaffClick = null,
    onStaffDelete = null,
    onAddStaff = null,
    searchFilter = ''
  } = options;
  
  if (!container) return;
  
  // Filter by search
  let filteredSquad = squad;
  let filteredStaff = staff;
  
  if (searchFilter) {
    const search = searchFilter.toLowerCase();
    filteredSquad = squad.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.role.toLowerCase().includes(search) ||
      p.number.toString().includes(search)
    );
    
    // ✅ Filter staff too
    filteredStaff = staff.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.role.toLowerCase().includes(search)
    );
  }
  
  // Split into lineup and bench
  const lineup = filteredSquad.filter(p => p.location === 'lineup')
    .sort((a, b) => a.slotIndex - b.slotIndex);
  
  const bench = filteredSquad.filter(p => p.location === 'bench')
    .sort((a, b) => a.number - b.number);
  
  // Clear container
  container.innerHTML = '';
  
  // ✅ Render staff section FIRST (above On Field)
  if (filteredStaff && filteredStaff.length > 0) {
    const staffHeader = document.createElement('div');
    staffHeader.className = 'squad-section-header';
    staffHeader.innerHTML = `
      <span>👔 Staffs</span>
      <span class="squad-count">(${filteredStaff.length})</span>
    `;
    container.appendChild(staffHeader);
    
    // Render staff members
    filteredStaff.forEach(member => {
      const item = createStaffItem(member, {
        onStaffClick,
        onStaffDelete
      });
      container.appendChild(item);
    });
  }
  
  // Render lineup section
  if (lineup.length > 0) {
    const lineupHeader = document.createElement('div');
    lineupHeader.className = 'squad-section-header';
    lineupHeader.textContent = `⚽ On Field (${lineup.length})`;
    container.appendChild(lineupHeader);
    
    lineup.forEach(player => {
      const item = createSquadPlayerItem(player, {
        onPlayerClick,
        onPlayerDelete
      });
      container.appendChild(item);
    });
  }
  
  // Render bench section
  if (bench.length > 0) {
    const benchHeader = document.createElement('div');
    benchHeader.className = 'squad-section-header';
    benchHeader.textContent = `🪑 Bench (${bench.length})`;
    container.appendChild(benchHeader);
    
    bench.forEach(player => {
      const item = createSquadPlayerItem(player, {
        onPlayerClick,
        onPlayerDelete
      });
      container.appendChild(item);
    });
  }
}

/**
 * Render Add Staff button (outside squad list)
 * @param {HTMLElement} container - Button container
 * @param {Function} onAddStaff - Add staff callback
 */
export function renderAddStaffButton(container, onAddStaff) {
  if (!container || !onAddStaff) return;
  
  container.innerHTML = '';
  
  const addBtn = document.createElement('button');
  addBtn.className = 'bench-add-btn';
  addBtn.innerHTML = '➕<br><span>Add Staff</span>';
  addBtn.title = 'Add staff member';
  addBtn.style.width = '100%';
  addBtn.style.marginTop = '8px';
  addBtn.onclick = onAddStaff;
  
  container.appendChild(addBtn);
}

/**
 * Create staff item
 * @param {Object} member - Staff member
 * @param {Object} options - Options
 * @returns {HTMLElement} Staff item
 */
function createStaffItem(member, options = {}) {
  const { onStaffClick, onStaffDelete } = options;
  
  const item = document.createElement('div');
  item.className = 'squad-player-item';
  item.dataset.staffId = member.id;
  
  // Avatar (same structure as player)
  const avatar = document.createElement('div');
  avatar.className = 'squad-player-avatar';
  
  if (member.avatar) {
    const img = document.createElement('img');
    img.src = member.avatar;
    img.alt = member.name;
    avatar.appendChild(img);
    
    // Icon badge (on top of image like player number)
    const badge = document.createElement('div');
    badge.className = 'squad-player-number';
    badge.textContent = '👔';
    badge.style.fontSize = '14px';
    avatar.appendChild(badge);
  } else {
    // Show icon in center if no avatar (like player number)
    const iconDisplay = document.createElement('div');
    iconDisplay.textContent = '👔';
    iconDisplay.style.fontSize = '24px';
    avatar.appendChild(iconDisplay);
  }
  
  // Info section (same as player)
  const info = document.createElement('div');
  info.className = 'squad-player-info';
  
  const name = document.createElement('div');
  name.className = 'squad-player-name';
  name.textContent = member.name;
  name.title = member.name;
  
  const meta = document.createElement('div');
  meta.className = 'squad-player-meta';
  meta.textContent = `${member.role} • 👔 Staff`;
  
  info.appendChild(name);
  info.appendChild(meta);
  
  // Actions (same as player)
  const actions = document.createElement('div');
  actions.className = 'squad-player-actions';
  
  // Delete button
  if (onStaffDelete) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';  // ✅ Use 'delete' class for red hover
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete staff member';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm(`Delete ${member.name}?`)) {
        onStaffDelete(member);
      }
    };
    actions.appendChild(deleteBtn);
  }
  
  // Append in correct order: avatar -> info -> actions
  item.appendChild(avatar);
  item.appendChild(info);
  item.appendChild(actions);
  
  // Click handler
  if (onStaffClick) {
    item.style.cursor = 'pointer';
    item.onclick = () => onStaffClick(member);
  }
  
  return item;
}

/**
 * Create squad player item
 * @param {Object} player - Player data
 * @param {Object} options - Options
 * @returns {HTMLElement} Player item
 */
function createSquadPlayerItem(player, options = {}) {
  const { onPlayerClick, onPlayerDelete } = options;
  
  const item = document.createElement('div');
  item.className = 'squad-player-item';
  item.dataset.playerNumber = player.number;
  
  // Add status class
  if (player.location === 'lineup') {
    item.classList.add('in-lineup');
  } else {
    item.classList.add('on-bench');
  }
  
  // Avatar
  const avatar = document.createElement('div');
  avatar.className = 'squad-player-avatar';
  
  if (player.avatar) {
    const img = document.createElement('img');
    img.src = player.avatar;
    img.alt = player.name;
    avatar.appendChild(img);
    
    // Number badge (on top of image)
    const numberBadge = document.createElement('div');
    numberBadge.className = 'squad-player-number';
    numberBadge.textContent = player.number;
    avatar.appendChild(numberBadge);
  } else {
    // Show number in center if no avatar
    const numberDisplay = document.createElement('div');
    numberDisplay.textContent = player.number;
    numberDisplay.style.fontSize = '18px';
    numberDisplay.style.fontWeight = 'bold';
    numberDisplay.style.color = '#888';
    avatar.appendChild(numberDisplay);
  }
  
  // Info section
  const info = document.createElement('div');
  info.className = 'squad-player-info';
  
  const name = document.createElement('div');
  name.className = 'squad-player-name';
  name.textContent = player.name;
  name.title = player.name;
  
  const meta = document.createElement('div');
  meta.className = 'squad-player-meta';
  const locationText = player.location === 'lineup' ? '⚽ On Field' : '🪑 Bench';
  meta.textContent = `${player.role} • ${locationText}`;
  
  info.appendChild(name);
  info.appendChild(meta);
  
  // Actions
  const actions = document.createElement('div');
  actions.className = 'squad-player-actions';
  
  // Delete button (only for bench players)
  if (player.location === 'bench') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Delete player';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (onPlayerDelete) {
        if (confirm(`Delete ${player.name}?`)) {
          onPlayerDelete(player);
        }
      }
    };
    actions.appendChild(deleteBtn);
  }
  
  // Assemble item
  item.appendChild(avatar);
  item.appendChild(info);
  item.appendChild(actions);
  
  // Click handler
  if (onPlayerClick) {
    item.onclick = () => {
      onPlayerClick(player, item);
    };
  }
  
  // Store player reference
  item._player = player;
  
  return item;
}

/**
 * Update squad stats display
 * @param {HTMLElement} statsElement - Stats display element
 * @param {Array<Object>} squad - Squad array
 */
export function updateSquadStats(statsElement, squad, staff = []) {
  if (!statsElement) return;
  
  const total = squad.length + staff.length;  // ✅ Include staff
  const lineup = squad.filter(p => p.location === 'lineup').length;
  const bench = squad.filter(p => p.location === 'bench').length;
  const staffCount = staff.length;
  
  statsElement.textContent = `Total: ${total} | Lineup: ${lineup} | Bench: ${bench} | Staff: ${staffCount}`;
}

/**
 * Highlight selected player in squad list
 * @param {HTMLElement} container - Squad list container
 * @param {Object} player - Player to highlight
 */
export function highlightSquadPlayer(container, player) {
  if (!container) return;
  
  const items = container.querySelectorAll('.squad-player-item');
  items.forEach(item => {
    // Check player match
    const isPlayerMatch = item._player === player || item.dataset.playerNumber == player.number;
    
    // ✅ Check staff match
    const isStaffMatch = player.location === 'staff' && 
                        item.dataset.staffId && 
                        item.dataset.staffId === player.id;
    
    if (isPlayerMatch || isStaffMatch) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

/**
 * Clear squad list highlights
 * @param {HTMLElement} container - Squad list container
 */
export function clearSquadHighlights(container) {
  if (!container) return;
  
  const items = container.querySelectorAll('.squad-player-item');
  items.forEach(item => item.classList.remove('selected'));
}

/**
 * Show add player dialog
 * Simple prompt-based dialog (can be upgraded to modal later)
 * @returns {Object|null} {name, role} or null if cancelled
 */
export function showAddPlayerDialog() {
  const name = prompt('Player name:', '');
  if (!name) return null;
  
  const role = prompt('Position (e.g., ST, CM, CB, GK):', 'SUB');
  if (!role) return null;
  
  return { name: name.trim(), role: role.trim().toUpperCase() };
}

/**
 * Filter squad list by search text
 * @param {HTMLElement} container - Squad list container
 * @param {Array<Object>} squad - Full squad
 * @param {string} searchText - Search query
 * @param {Object} options - Render options
 */
export function filterSquadList(container, squad, searchText, options = {}) {
  renderSquadList(container, squad, {
    ...options,
    searchFilter: searchText
  });
}