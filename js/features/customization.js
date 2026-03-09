/**
 * Player Customization Feature
 * 
 * Custom colors, avatars, and cards.
 * NO input binding - exposes functions for UI to call.
 * Pure data operations.
 */

// ============================================
// CUSTOM COLORS
// ============================================

/**
 * Set custom color for player
 * @param {Object} player - Player object
 * @param {string} color - Hex color
 * @returns {boolean} True if applied
 */
export function setCustomColor(player, color) {
  if (!color || !isValidHexColor(color)) {
    return false;
  }
  
  player.customColor = color;
  return true;
}

/**
 * Remove custom color from player
 * @param {Object} player - Player object
 * @returns {boolean} True if removed
 */
export function removeCustomColor(player) {
  if (!player.customColor) {
    return false;
  }
  
  delete player.customColor;
  return true;
}

/**
 * Toggle custom color on/off
 * @param {Object} player - Player object
 * @param {string} color - Color to set if enabling
 * @returns {boolean} New state (true = has custom color)
 */
export function toggleCustomColor(player, color) {
  if (player.customColor) {
    removeCustomColor(player);
    return false;
  } else {
    setCustomColor(player, color);
    return true;
  }
}

/**
 * Check if player has custom color
 * @param {Object} player - Player object
 * @returns {boolean} True if has custom color
 */
export function hasCustomColor(player) {
  return !!player.customColor;
}

/**
 * Get player color (custom or default)
 * @param {Object} player - Player object
 * @param {Object} defaultColors - {player, gk}
 * @returns {string} Hex color
 */
export function getPlayerColor(player, defaultColors) {
  if (player.customColor) {
    return player.customColor;
  }
  
  return player.role === 'GK' ? defaultColors.gk : defaultColors.player;
}

/**
 * Set custom color for multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} color - Hex color
 * @returns {number} Number of players updated
 */
export function setCustomColorMulti(players, color) {
  let count = 0;
  players.forEach(p => {
    if (setCustomColor(p, color)) {
      count++;
    }
  });
  return count;
}

/**
 * Remove custom color from multiple players
 * @param {Array<Object>} players - Players array
 * @returns {number} Number of players updated
 */
export function removeCustomColorMulti(players) {
  let count = 0;
  players.forEach(p => {
    if (removeCustomColor(p)) {
      count++;
    }
  });
  return count;
}

// ============================================
// AVATARS
// ============================================

/**
 * Set avatar for player
 * @param {Object} player - Player object
 * @param {string} avatarData - Base64 image data
 * @returns {boolean} True if set
 */
export function setAvatar(player, avatarData) {
  if (!avatarData || typeof avatarData !== 'string') {
    return false;
  }
  
  player.avatar = avatarData;
  return true;
}

/**
 * Remove avatar from player
 * @param {Object} player - Player object
 * @returns {boolean} True if removed
 */
export function removeAvatar(player) {
  if (!player.avatar) {
    return false;
  }
  
  delete player.avatar;
  return true;
}

/**
 * Check if player has avatar
 * @param {Object} player - Player object
 * @returns {boolean} True if has avatar
 */
export function hasAvatar(player) {
  return !!player.avatar;
}

/**
 * Get avatar data
 * @param {Object} player - Player object
 * @returns {string|null} Avatar base64 or null
 */
export function getAvatar(player) {
  return player.avatar || null;
}

/**
 * Set avatar for multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} avatarData - Base64 image data
 * @returns {number} Number of players updated
 */
export function setAvatarMulti(players, avatarData) {
  let count = 0;
  players.forEach(p => {
    if (setAvatar(p, avatarData)) {
      count++;
    }
  });
  return count;
}

/**
 * Remove avatar from multiple players
 * @param {Array<Object>} players - Players array
 * @returns {number} Number of players updated
 */
export function removeAvatarMulti(players) {
  let count = 0;
  players.forEach(p => {
    if (removeAvatar(p)) {
      count++;
    }
  });
  return count;
}

/**
 * Load image file and convert to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 data
 */
export function loadImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Max size in MB (default: 5)
 * @param {Array<string>} options.allowedTypes - Allowed MIME types
 * @returns {Object} {valid, error}
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File is not an image' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }
  
  return { valid: true, error: null };
}

// ============================================
// CARDS
// ============================================

/**
 * Card types
 */
export const CARD_TYPES = {
  NONE: '',
  YELLOW: 'yellow',
  RED: 'red'
};

/**
 * Set card for player
 * @param {Object} player - Player object
 * @param {string} cardType - '' | 'yellow' | 'red'
 * @returns {boolean} True if set
 */
export function setCard(player, cardType) {
  if (!isValidCardType(cardType)) {
    return false;
  }
  
  if (cardType === CARD_TYPES.NONE) {
    delete player.card;
  } else {
    player.card = cardType;
  }
  
  return true;
}

/**
 * Remove card from player
 * @param {Object} player - Player object
 * @returns {boolean} True if removed
 */
export function removeCard(player) {
  if (!player.card) {
    return false;
  }
  
  delete player.card;
  return true;
}

/**
 * Check if player has card
 * @param {Object} player - Player object
 * @param {string} cardType - Optional: specific card type to check
 * @returns {boolean} True if has card (or specific card)
 */
export function hasCard(player, cardType = null) {
  if (cardType) {
    return player.card === cardType;
  }
  return !!player.card;
}

/**
 * Get card type
 * @param {Object} player - Player object
 * @returns {string} Card type ('' | 'yellow' | 'red')
 */
export function getCard(player) {
  return player.card || CARD_TYPES.NONE;
}

/**
 * Validate card type
 * @param {string} cardType - Card type to validate
 * @returns {boolean} True if valid
 */
export function isValidCardType(cardType) {
  return Object.values(CARD_TYPES).includes(cardType);
}

/**
 * Set card for multiple players
 * @param {Array<Object>} players - Players array
 * @param {string} cardType - Card type
 * @returns {number} Number of players updated
 */
export function setCardMulti(players, cardType) {
  let count = 0;
  players.forEach(p => {
    if (setCard(p, cardType)) {
      count++;
    }
  });
  return count;
}

/**
 * Remove card from multiple players
 * @param {Array<Object>} players - Players array
 * @returns {number} Number of players updated
 */
export function removeCardMulti(players) {
  let count = 0;
  players.forEach(p => {
    if (removeCard(p)) {
      count++;
    }
  });
  return count;
}

// ============================================
// COMBINED CUSTOMIZATION
// ============================================

/**
 * Clear all customizations from player
 * @param {Object} player - Player object
 * @returns {Object} What was cleared {color, avatar, card}
 */
export function clearAllCustomizations(player) {
  const cleared = {
    color: hasCustomColor(player),
    avatar: hasAvatar(player),
    card: hasCard(player)
  };
  
  removeCustomColor(player);
  removeAvatar(player);
  removeCard(player);
  
  return cleared;
}

/**
 * Check if player has any customization
 * @param {Object} player - Player object
 * @returns {boolean} True if customized
 */
export function isCustomized(player) {
  return hasCustomColor(player) || hasAvatar(player) || hasCard(player);
}

/**
 * Get customization summary
 * @param {Object} player - Player object
 * @returns {Object} {hasColor, hasAvatar, hasCard, count}
 */
export function getCustomizationSummary(player) {
  const summary = {
    hasColor: hasCustomColor(player),
    hasAvatar: hasAvatar(player),
    hasCard: hasCard(player),
    count: 0
  };
  
  summary.count = [summary.hasColor, summary.hasAvatar, summary.hasCard]
    .filter(Boolean).length;
  
  return summary;
}

/**
 * Copy customizations from one player to another
 * @param {Object} source - Source player
 * @param {Object} target - Target player
 */
export function copyCustomizations(source, target) {
  if (source.customColor) {
    target.customColor = source.customColor;
  } else {
    delete target.customColor;
  }
  
  if (source.avatar) {
    target.avatar = source.avatar;
  } else {
    delete target.avatar;
  }
  
  if (source.card) {
    target.card = source.card;
  } else {
    delete target.card;
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate hex color
 * @param {string} color - Color to validate
 * @returns {boolean} True if valid hex
 */
export function isValidHexColor(color) {
  if (typeof color !== 'string') return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Normalize hex color (ensure # prefix and uppercase)
 * @param {string} color - Color to normalize
 * @returns {string} Normalized color
 */
export function normalizeHexColor(color) {
  if (!color) return null;
  
  let normalized = color.trim().toUpperCase();
  
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized;
  }
  
  return isValidHexColor(normalized) ? normalized : null;
}

/**
 * Get contrast color (black or white) for background
 * @param {string} backgroundColor - Hex color
 * @returns {string} '#000000' or '#FFFFFF'
 */
export function getContrastColor(backgroundColor) {
  if (!backgroundColor) return '#FFFFFF';
  
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ============================================
// SERIALIZATION
// ============================================

/**
 * Serialize customizations for storage
 * @param {Object} player - Player object
 * @returns {Object} Serializable customization data
 */
export function serializeCustomizations(player) {
  return {
    customColor: player.customColor || null,
    avatar: player.avatar || null,
    card: player.card || null
  };
}

/**
 * Deserialize customizations
 * @param {Object} player - Player object
 * @param {Object} data - Saved customization data
 */
export function deserializeCustomizations(player, data) {
  if (!data) return;
  
  if (data.customColor) {
    player.customColor = data.customColor;
  }
  
  if (data.avatar) {
    player.avatar = data.avatar;
  }
  
  if (data.card) {
    player.card = data.card;
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Apply customizations to multiple players
 * @param {Array<Object>} players - Players array
 * @param {Object} customizations - {color?, avatar?, card?}
 * @returns {number} Number of players updated
 */
export function applyCustomizationsMulti(players, customizations) {
  let count = 0;
  
  players.forEach(p => {
    if (customizations.color !== undefined) {
      if (customizations.color) {
        setCustomColor(p, customizations.color);
      } else {
        removeCustomColor(p);
      }
      count++;
    }
    
    if (customizations.avatar !== undefined) {
      if (customizations.avatar) {
        setAvatar(p, customizations.avatar);
      } else {
        removeAvatar(p);
      }
      count++;
    }
    
    if (customizations.card !== undefined) {
      setCard(p, customizations.card);
      count++;
    }
  });
  
  return count;
}

/**
 * Clear all customizations from multiple players
 * @param {Array<Object>} players - Players array
 * @returns {number} Number of players cleared
 */
export function clearAllCustomizationsMulti(players) {
  let count = 0;
  players.forEach(p => {
    const cleared = clearAllCustomizations(p);
    if (cleared.color || cleared.avatar || cleared.card) {
      count++;
    }
  });
  return count;
}