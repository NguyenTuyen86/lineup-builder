/**
 * Render Module
 * 
 * Pure DOM rendering - NO event handling, NO global state.
 * All dependencies passed as parameters.
 */

// ============================================
// DIRECTION ARROW CONFIGURATION
// ============================================

/**
 * Direction arrow positioning map
 * Icon + position relative to player element
 */
const DIRECTION_MAP = {
  '⬆': { x: 50,  y: -20 }, 
  '⬇': { x: 50,  y: 120 },
  '⬅': { x: -20, y: 50  },
  '➡': { x: 120, y: 50  },
  // --- CHỈNH 4 GÓC CHÉO Ở ĐÂY ---
  '↖': { x: -5,  y: -5  },
  '↗': { x: 105, y: -5  },
  '↙': { x: -5,  y: 105 },
  '↘': { x: 105, y: 105 },
  // ---------------------------
  '•': { x: 50,  y: 50  }
};

// ============================================
// PLAYER ELEMENT CREATION
// ============================================

/**
 * Create player element
 * @param {Object} player - Player object
 * @param {Object} options - Render options
 * @param {Object} options.colors - {player, gk, pitch, border, arrow}
 * @param {Object} options.toggles - {positions, numbers, names, avatars}
 * @returns {Object} {wrapper, element, nameElement} DOM elements
 */
export function createPlayerElement(player, options) {
  const { colors, toggles } = options;
  
  // Wrapper (absolute positioned)
  const wrapper = document.createElement('div');
  wrapper.className = 'player-wrapper';
  wrapper.style.position = 'absolute';
  
  // Calculate offset based on screen size
  // Desktop: 600px pitch, 60px player → 30px offset
  // Mobile: 360px pitch, 50px player → 25px offset
  const isMobile = window.innerWidth < 1024;
  const offset = isMobile ? 25 : 30;
  
  wrapper.style.left = `calc(${player.x}% - ${offset}px)`;
  wrapper.style.top = `calc(${player.y}% - ${offset}px)`;
  
  // Player element
  const element = document.createElement('div');
  element.className = 'player';
  
  // Background color: custom > GK > default
  let bgColor;
  if (player.customColor) {
    bgColor = player.customColor;
  } else if (player.role === 'GK') {
    bgColor = colors.gk;
  } else {
    bgColor = colors.player;
  }
  
  element.style.background = bgColor;
  element.style.boxShadow = `0 0 0 3px ${colors.pitch}, 0 0 0 5px ${colors.border}`;
  
  // Avatar (if exists and toggled on)
  if (player.avatar && toggles.avatars) {
    const avatarImg = document.createElement('img');
    avatarImg.className = 'player-avatar';
    avatarImg.src = player.avatar;
    element.appendChild(avatarImg);
  }
  
  // Content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'player-content';
  
  // Number
  const numberEl = document.createElement('div');
  numberEl.className = 'player-number';
  numberEl.textContent = player.number;
  const showNumber = toggles.numbers;
  numberEl.style.display = showNumber ? 'block' : 'none';
  
  // Role  
  const roleEl = document.createElement('div');
  roleEl.className = 'player-role';
  roleEl.textContent = player.role;
  const showRole = toggles.positions;
  roleEl.style.display = showRole ? 'block' : 'none';
  
  contentDiv.appendChild(numberEl);
  contentDiv.appendChild(roleEl);
  
  // Apply dynamic centering based on visibility
  if (showNumber && showRole) {
    // Both shown: add small gap to center midpoint
    numberEl.style.marginBottom = '1px';
    roleEl.style.marginTop = '1px';
  } else if (showRole && !showNumber) {
    // Only role shown: ensure it's centered
    roleEl.style.marginTop = '0';
    roleEl.style.position = 'absolute';
    roleEl.style.top = '50%';
    roleEl.style.left = '50%';
    roleEl.style.transform = 'translate(-50%, -50%)';
  } else if (showNumber && !showRole) {
    // Only number shown: ensure it's centered (already centered by flex)
    numberEl.style.marginBottom = '0';
  }
  
  element.appendChild(contentDiv);
  
  // Card indicator
  if (player.card === 'yellow') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'card-indicator card-yellow';
    element.appendChild(cardIndicator);
  } else if (player.card === 'red') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'card-indicator card-red';
    element.appendChild(cardIndicator);
  }
  
  // Direction arrows
  if (player.directions && typeof player.directions === 'object') {
    Object.keys(player.directions).forEach(directionKey => {
      const arrow = createDirectionArrow(directionKey, colors.arrow);
      if (arrow) {
        element.appendChild(arrow);
      }
    });
  }
  
  wrapper.appendChild(element);
  
  // Name label (truncated) - append to ELEMENT not wrapper
  const nameElement = document.createElement('div');
  nameElement.className = 'player-name';
  nameElement.textContent = truncateName(player.name, 21);
  nameElement.title = player.name;  // Show full name on hover
  nameElement.style.display = toggles.names ? 'inline-block' : 'none';
  element.appendChild(nameElement); // MOVED: Inside element, not wrapper
  
  return {
    wrapper,
    element,
    nameElement,
    numberElement: numberEl,
    roleElement: roleEl
  };
}

/**
 * Create direction arrow element
 * @param {string} directionKey - Direction symbol ('↑', '→', etc.)
 * @param {string} arrowColor - Arrow color
 * @returns {HTMLElement|null} Arrow element or null
 */
export function createDirectionArrow(directionKey, arrowColor) {
  const config = DIRECTION_MAP[directionKey];
  if (!config) return null;
  
  const arrow = document.createElement('div');
  arrow.className = 'direction-arrow';
  arrow.textContent = directionKey;
  
  arrow.style.position = 'absolute';
  arrow.style.left = config.x + '%';
  arrow.style.top = config.y + '%';
  
  // DÒNG QUAN TRỌNG: Căn giữa mũi tên và đẩy nó ra ngoài một chút
  // scale(1.2) để mũi tên to rõ hơn, translate để căn tâm
  let transform = 'translate(-50%, -50%)';
  
  // Tùy chỉnh để đẩy mũi tên xa tâm cầu thủ hơn (tránh đè lên số áo)
  if (directionKey === '⬆') transform += ' translateY(-5px)';
  if (directionKey === '⬇') transform += ' translateY(5px)';
  if (directionKey === '⬅') transform += ' translateX(-5px)';
  if (directionKey === '➡') transform += ' translateX(5px)';
  
  arrow.style.transform = transform;
  arrow.style.color = arrowColor;
  arrow.style.fontSize = '18px';
  arrow.style.pointerEvents = 'none'; // Không cản trở click/drag cầu thủ
  
  return arrow;
}

// ============================================
// PLAYER ELEMENT UPDATES
// ============================================

/**
 * Update player position
 * @param {HTMLElement} wrapper - Player wrapper element
 * @param {number} x - X coordinate (percentage)
 * @param {number} y - Y coordinate (percentage)
 */
export function updatePlayerPosition(wrapper, x, y) {
  const isMobile = window.innerWidth < 1024;
  const offset = isMobile ? 25 : 30;
  
  wrapper.style.left = `calc(${x}% - ${offset}px)`;
  wrapper.style.top = `calc(${y}% - ${offset}px)`;
}

/**
 * Update player background color
 * @param {HTMLElement} element - Player element
 * @param {string} color - Background color
 */
export function updatePlayerColor(element, color) {
  element.style.background = color;
}

/**
 * Update player number display
 * @param {HTMLElement} numberElement - Number element
 * @param {number|string} number - New number
 */
export function updatePlayerNumber(numberElement, number) {
  numberElement.textContent = number;
}

/**
 * Update player name display
 * @param {HTMLElement} nameElement - Name element
 * @param {string} name - New name
 */
/**
 * Truncate name intelligently (max 21 chars)
 * @param {string} name - Full name
 * @returns {string} Truncated name
 */
function truncateName(name, maxLength = 21) {
  if (!name || name.length <= maxLength) return name;
  
  // Split by spaces
  const parts = name.trim().split(/\s+/);
  
  // If single word, just truncate
  if (parts.length === 1) {
    return name.substring(0, maxLength - 3) + '...';
  }
  
  // Keep last 2 words (given name)
  const lastTwo = parts.slice(-2).join(' ');
  
  // If last 2 words fit
  if (lastTwo.length <= maxLength) {
    return '...' + lastTwo;
  }
  
  // If last word fits
  const lastName = parts[parts.length - 1];
  if (lastName.length <= maxLength - 3) {
    return '...' + lastName;
  }
  
  // Fallback: just truncate
  return name.substring(0, maxLength - 3) + '...';
}

export function updatePlayerName(nameElement, name) {
  nameElement.textContent = truncateName(name, 21);
  nameElement.title = name;  // Show full name on hover
}

/**
 * Update player role display
 * @param {HTMLElement} roleElement - Role element
 * @param {string} role - New role
 */
export function updatePlayerRole(roleElement, role) {
  roleElement.textContent = role;
}

/**
 * Update card indicator
 * @param {HTMLElement} element - Player element
 * @param {string} card - Card status ('', 'yellow', 'red')
 */
export function updateCardIndicator(element, card) {
  // Remove existing card
  const existingCard = element.querySelector('.card-indicator');
  if (existingCard) existingCard.remove();
  
  // Add new card if needed
  if (card === 'yellow') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'card-indicator card-yellow';
    element.appendChild(cardIndicator);
  } else if (card === 'red') {
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'card-indicator card-red';
    element.appendChild(cardIndicator);
  }
}

/**
 * Update avatar image
 * @param {HTMLElement} element - Player element
 * @param {string|null} avatarSrc - Avatar base64 or null to remove
 * @param {boolean} showAvatar - Whether to show avatar
 */
export function updateAvatar(element, avatarSrc, showAvatar) {
  // Remove existing avatar
  const existingAvatar = element.querySelector('.player-avatar');
  if (existingAvatar) existingAvatar.remove();
  
  // Add new avatar if provided and toggled on
  if (avatarSrc && showAvatar) {
    const avatarImg = document.createElement('img');
    avatarImg.className = 'player-avatar';
    avatarImg.src = avatarSrc;
    // Insert before content div
    const contentDiv = element.querySelector('.player-content');
    if (contentDiv) {
      element.insertBefore(avatarImg, contentDiv);
    } else {
      element.appendChild(avatarImg);
    }
  }
}

// ============================================
// DIRECTION ARROWS MANAGEMENT
// ============================================

/**
 * Update direction arrows
 * @param {HTMLElement} element - Player element
 * @param {Object} directions - Direction object {key: true/arrow_element}
 * @param {string} arrowColor - Arrow color
 */
export function updateDirectionArrows(element, directions, arrowColor) {
  // Remove existing arrows
  element.querySelectorAll('.direction-arrow').forEach(a => a.remove());
  
  // Add new arrows
  if (directions && typeof directions === 'object') {
    Object.keys(directions).forEach(directionKey => {
      const arrow = createDirectionArrow(directionKey, arrowColor);
      if (arrow) {
        element.appendChild(arrow);
      }
    });
  }
}

/**
 * Add single direction arrow
 * @param {HTMLElement} element - Player element
 * @param {string} directionKey - Direction symbol
 * @param {string} arrowColor - Arrow color
 * @returns {HTMLElement|null} Created arrow element
 */
export function addDirectionArrow(element, directionKey, arrowColor) {
  const arrow = createDirectionArrow(directionKey, arrowColor);
  if (arrow) {
    element.appendChild(arrow);
  }
  return arrow;
}

/**
 * Remove direction arrow
 * @param {HTMLElement} element - Player element
 * @param {string} directionKey - Direction symbol to remove
 */
export function removeDirectionArrow(element, directionKey) {
  const arrows = element.querySelectorAll('.direction-arrow');
  arrows.forEach(arrow => {
    if (arrow.textContent === directionKey) {
      arrow.remove();
    }
  });
}

// ============================================
// SELECTION VISUAL STATE
// ============================================

/**
 * Add selection highlight
 * @param {HTMLElement} element - Player element
 */
export function addSelectionHighlight(element) {
  element.classList.add('selected');
}

/**
 * Remove selection highlight
 * @param {HTMLElement} element - Player element
 */
export function removeSelectionHighlight(element) {
  element.classList.remove('selected');
}

/**
 * Toggle selection highlight
 * @param {HTMLElement} element - Player element
 * @param {boolean} isSelected - Whether selected
 */
export function setSelectionHighlight(element, isSelected) {
  if (isSelected) {
    element.classList.add('selected');
  } else {
    element.classList.remove('selected');
  }
}

// ============================================
// BATCH RENDERING
// ============================================

/**
 * Render all players to pitch
 * @param {HTMLElement} pitchElement - Pitch container
 * @param {Array<Object>} players - Players array
 * @param {Object} options - Render options
 * @param {Object} options.colors - Color configuration
 * @param {Object} options.toggles - Toggle states
 * @param {Function} options.onPlayerCreated - Callback (player, domElements) => void
 */
export function renderPlayers(pitchElement, players, options) {
  // Clear existing players
  pitchElement.querySelectorAll('.player-wrapper').forEach(w => w.remove());
  
  // Render each player
  players.forEach(player => {
    const domElements = createPlayerElement(player, options);
    pitchElement.appendChild(domElements.wrapper);
    
    // Store DOM references on player object (for external use)
    player.el = domElements.element;
    player.wrap = domElements.wrapper;
    player.nameEl = domElements.nameElement;
    player.numberEl = domElements.numberElement;
    player.roleEl = domElements.roleElement;
    
    // Callback for additional setup (e.g., event handlers)
    if (options.onPlayerCreated) {
      options.onPlayerCreated(player, domElements);
    }
  });
}

/**
 * Update single player element in place
 * @param {Object} player - Player object with DOM references
 * @param {Object} options - Render options
 */
export function updatePlayerElement(player, options) {
  if (!player.el || !player.wrap) return;
  
  const { colors, toggles } = options;
  
  // Update position
  updatePlayerPosition(player.wrap, player.x, player.y);
  
  // Update color
  let bgColor;
  if (player.customColor) {
    bgColor = player.customColor;
  } else if (player.role === 'GK') {
    bgColor = colors.gk;
  } else {
    bgColor = colors.player;
  }
  updatePlayerColor(player.el, bgColor);
  
  // Update border
  player.el.style.boxShadow = `0 0 0 3px ${colors.pitch}, 0 0 0 5px ${colors.border}`;
  
  // Update text content
  if (player.numberEl) updatePlayerNumber(player.numberEl, player.number);
  if (player.nameEl) updatePlayerName(player.nameEl, player.name);
  if (player.roleEl) updatePlayerRole(player.roleEl, player.role);
  
  // Update displays
  if (player.numberEl) player.numberEl.style.display = toggles.numbers ? 'block' : 'none';
  if (player.roleEl) player.roleEl.style.display = toggles.positions ? 'block' : 'none';
  if (player.nameEl) player.nameEl.style.display = toggles.names ? 'inline-block' : 'none';
  
  // Update card
  updateCardIndicator(player.el, player.card || '');
  
  // Update avatar
  updateAvatar(player.el, player.avatar, toggles.avatars);
  
  // Update arrows
  updateDirectionArrows(player.el, player.directions, colors.arrow);
}

// ============================================
// TOGGLE UPDATES
// ============================================

/**
 * Update visibility of all numbers
 * @param {Array<Object>} players - Players with DOM references
 * @param {boolean} visible - Whether to show numbers
 */
export function updateNumbersVisibility(players, visible) {
  players.forEach(p => {
    if (p.numberEl) {
      p.numberEl.style.display = visible ? 'block' : 'none';
    }
  });
}

/**
 * Update visibility of all positions
 * @param {Array<Object>} players - Players with DOM references
 * @param {boolean} visible - Whether to show positions
 */
export function updatePositionsVisibility(players, visible) {
  players.forEach(p => {
    if (p.roleEl) {
      p.roleEl.style.display = visible ? 'block' : 'none';
    }
  });
}

/**
 * Update visibility of all names
 * @param {Array<Object>} players - Players with DOM references
 * @param {boolean} visible - Whether to show names
 */
export function updateNamesVisibility(players, visible) {
  players.forEach(p => {
    if (p.nameEl) {
      p.nameEl.style.display = visible ? 'inline-block' : 'none';
    }
  });
}

/**
 * Update visibility of all avatars
 * @param {Array<Object>} players - Players with DOM references
 * @param {boolean} visible - Whether to show avatars
 * @param {string} arrowColor - Arrow color for re-render
 */
export function updateAvatarsVisibility(players, visible) {
  players.forEach(p => {
    if (p.el && p.avatar) {
      updateAvatar(p.el, p.avatar, visible);
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get render options from DOM state
 * @param {Object} elements - DOM element references
 * @param {HTMLElement} elements.pitchColorInput
 * @param {HTMLElement} elements.playerColorInput
 * @param {HTMLElement} elements.gkColorInput
 * @param {HTMLElement} elements.playerBorderColorInput
 * @param {HTMLElement} elements.arrowColorInput
 * @param {HTMLElement} elements.togglePositions
 * @param {HTMLElement} elements.toggleNumbers
 * @param {HTMLElement} elements.toggleNames
 * @param {HTMLElement} elements.toggleAvatars
 * @returns {Object} Render options {colors, toggles}
 */
export function getRenderOptions(elements) {
  return {
    colors: {
      pitch: elements.pitchColorInput?.value || '#0b5d34',
      player: elements.playerColorInput?.value || '#333333',
      gk: elements.gkColorInput?.value || '#1e4dbb',
      border: elements.playerBorderColorInput?.value || '#00ff40',
      arrow: elements.arrowColorInput?.value || '#ff3333'
    },
    toggles: {
      positions: elements.togglePositions?.checked || false,
      numbers: elements.toggleNumbers?.checked || false,
      names: elements.toggleNames?.checked || false,
      avatars: elements.toggleAvatars?.checked || false
    }
  };
}

/**
 * Export direction map for external use
 */
export { DIRECTION_MAP };