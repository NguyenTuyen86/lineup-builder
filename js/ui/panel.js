/**
 * Control Panel Sync
 * 
 * Syncs control panel UI with selected players.
 * One-way data flow: State → UI (no state mutation here).
 * Pure UI updates only.
 */

// ============================================
// PLAYER PROPERTY PANEL
// ============================================

/**
 * Sync player property inputs with selection
 * @param {Object} elements - Panel elements
 * @param {Object} player - Player to sync (or null)
 * @param {boolean} isMultiSelect - Whether multiple players selected
 */
export function syncPlayerPropertyPanel(elements, player, isMultiSelect = false) {
  const {
    numberInput,
    nameInput,
    roleSelect,
    cardSelect
  } = elements;
  
  if (!player) {
    // No selection - clear and disable
    clearPlayerPropertyPanel(elements);
    return;
  }
  
  // Set values from player
  if (numberInput) {
    numberInput.value = player.number || '';
    numberInput.disabled = isMultiSelect;
    numberInput.style.opacity = isMultiSelect ? '0.5' : '1';
  }
  
  if (nameInput) {
    nameInput.value = player.name || '';
    nameInput.disabled = isMultiSelect;
    nameInput.style.opacity = isMultiSelect ? '0.5' : '1';
  }
  
  if (roleSelect) {
    roleSelect.value = player.role || '';
    roleSelect.disabled = false; // Role works with multi-select
  }
  
  if (cardSelect) {
    cardSelect.value = player.card || '';
  }
}

/**
 * Clear player property panel
 * @param {Object} elements - Panel elements
 */
export function clearPlayerPropertyPanel(elements) {
  const {
    numberInput,
    nameInput,
    roleSelect,
    cardSelect
  } = elements;
  
  if (numberInput) {
    numberInput.value = '';
    numberInput.disabled = true;
    numberInput.style.opacity = '0.5';
  }
  
  if (nameInput) {
    nameInput.value = '';
    nameInput.disabled = true;
    nameInput.style.opacity = '0.5';
  }
  
  if (roleSelect) {
    roleSelect.value = '';
    roleSelect.disabled = true;
  }
  
  if (cardSelect) {
    cardSelect.value = '';
  }
}

// ============================================
// AVATAR PANEL
// ============================================

/**
 * Sync avatar panel with player
 * @param {Object} elements - Avatar elements
 * @param {Object} player - Player to sync (or null)
 */
export function syncAvatarPanel(elements, player) {
  const {
    avatarPreview,
    avatarPlaceholder,
    uploadButton,
    deleteButton
  } = elements;
  
  if (!player || !player.avatar) {
    // No avatar - show placeholder
    if (avatarPreview) avatarPreview.style.display = 'none';
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
  } else {
    // Has avatar - show preview
    if (avatarPreview) {
      avatarPreview.src = player.avatar;
      avatarPreview.style.display = 'block';
    }
    if (avatarPlaceholder) {
      avatarPlaceholder.style.display = 'none';
    }
  }
  
  // Enable/disable buttons based on selection
  const hasSelection = !!player;
  if (uploadButton) uploadButton.disabled = !hasSelection;
  if (deleteButton) deleteButton.disabled = !hasSelection;
}

/**
 * Clear avatar panel
 * @param {Object} elements - Avatar elements
 */
export function clearAvatarPanel(elements) {
  syncAvatarPanel(elements, null);
}

// ============================================
// CUSTOM COLOR PANEL
// ============================================

/**
 * Sync custom color panel with player
 * @param {Object} elements - Color elements
 * @param {Object} player - Player to sync (or null)
 * @param {Object} defaultColors - {player, gk} default colors
 */
export function syncCustomColorPanel(elements, player, defaultColors) {
  const {
    colorCheckbox,
    colorInput
  } = elements;
  
  if (!player) {
    // No selection - disable
    if (colorCheckbox) {
      colorCheckbox.checked = false;
      colorCheckbox.disabled = true;
    }
    if (colorInput) {
      colorInput.value = defaultColors.player;
      colorInput.disabled = true;
    }
    return;
  }
  
  // Enable checkbox
  if (colorCheckbox) {
    colorCheckbox.disabled = false;
  }
  
  if (player.customColor) {
    // Has custom color
    if (colorCheckbox) colorCheckbox.checked = true;
    if (colorInput) {
      colorInput.value = player.customColor;
      colorInput.disabled = false;
    }
  } else {
    // No custom color - show what it would be
    if (colorCheckbox) colorCheckbox.checked = false;
    if (colorInput) {
      const defaultColor = player.role === 'GK' ? defaultColors.gk : defaultColors.player;
      colorInput.value = defaultColor;
      colorInput.disabled = true;
    }
  }
}

/**
 * Clear custom color panel
 * @param {Object} elements - Color elements
 * @param {Object} defaultColors - Default colors
 */
export function clearCustomColorPanel(elements, defaultColors) {
  syncCustomColorPanel(elements, null, defaultColors);
}

// ============================================
// DIRECTION BUTTONS
// ============================================

/**
 * Sync direction buttons with player directions
 * @param {Array<HTMLElement>} buttons - Direction buttons
 * @param {Object} player - Player to sync (or null)
 * @param {string} activeClass - Active CSS class (default: 'active')
 */
export function syncDirectionButtons(buttons, player, activeClass = 'active') {
  if (!buttons || !Array.isArray(buttons)) return;
  
  // Clear all first
  buttons.forEach(btn => {
    if (btn) btn.classList.remove(activeClass);
  });
  
  if (!player || !player.directions) return;
  
  // Set active based on player directions
  const directionKeys = Object.keys(player.directions);
  
  buttons.forEach(btn => {
    if (!btn) return;
    const directionKey = btn.textContent;
    if (directionKeys.includes(directionKey)) {
      btn.classList.add(activeClass);
    }
  });
}

/**
 * Clear direction buttons
 * @param {Array<HTMLElement>} buttons - Direction buttons
 * @param {string} activeClass - Active CSS class
 */
export function clearDirectionButtons(buttons, activeClass = 'active') {
  syncDirectionButtons(buttons, null, activeClass);
}

// ============================================
// COMPLETE PANEL SYNC
// ============================================

/**
 * Sync entire panel with selection
 * @param {Object} elements - All panel elements
 * @param {Object} selectionState - {primary, selected, count}
 * @param {Object} defaultColors - {player, gk}
 */
export function syncControlPanel(elements, selectionState, defaultColors) {
  const { primary, count } = selectionState;
  const isMultiSelect = count > 1;
  
  // Sync player properties
  syncPlayerPropertyPanel(
    elements.playerProperties,
    primary,
    isMultiSelect
  );
  
  // Sync avatar
  syncAvatarPanel(elements.avatar, primary);
  
  // Sync custom color
  syncCustomColorPanel(elements.customColor, primary, defaultColors);
  
  // Sync direction buttons
  if (elements.directionButtons) {
    syncDirectionButtons(elements.directionButtons, primary);
  }
}

/**
 * Clear entire panel
 * @param {Object} elements - All panel elements
 * @param {Object} defaultColors - {player, gk}
 */
export function clearControlPanel(elements, defaultColors) {
  clearPlayerPropertyPanel(elements.playerProperties);
  clearAvatarPanel(elements.avatar);
  clearCustomColorPanel(elements.customColor, defaultColors);
  
  if (elements.directionButtons) {
    clearDirectionButtons(elements.directionButtons);
  }
}

// ============================================
// PARTIAL UPDATES
// ============================================

/**
 * Update only number input
 * @param {HTMLElement} input - Number input
 * @param {string|number} value - New value
 */
export function updateNumberInput(input, value) {
  if (!input) return;
  input.value = value;
}

/**
 * Update only name input
 * @param {HTMLElement} input - Name input
 * @param {string} value - New value
 */
export function updateNameInput(input, value) {
  if (!input) return;
  input.value = value;
}

/**
 * Update only role select
 * @param {HTMLElement} select - Role select
 * @param {string} value - New value
 */
export function updateRoleSelect(select, value) {
  if (!select) return;
  select.value = value;
}

/**
 * Update only card select
 * @param {HTMLElement} select - Card select
 * @param {string} value - New value
 */
export function updateCardSelect(select, value) {
  if (!select) return;
  select.value = value;
}

/**
 * Update avatar preview
 * @param {HTMLElement} preview - Preview image
 * @param {HTMLElement} placeholder - Placeholder element
 * @param {string|null} avatarSrc - Avatar source or null
 */
export function updateAvatarPreview(preview, placeholder, avatarSrc) {
  if (!preview || !placeholder) return;
  
  if (avatarSrc) {
    preview.src = avatarSrc;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

// ============================================
// INPUT ENABLE/DISABLE
// ============================================

/**
 * Set player property inputs enabled state
 * @param {Object} elements - Input elements
 * @param {boolean} enabled - Whether to enable
 * @param {boolean} isMultiSelect - Whether multi-select (disables number/name)
 */
export function setPlayerPropertyInputsEnabled(elements, enabled, isMultiSelect = false) {
  const { numberInput, nameInput, roleSelect, cardSelect } = elements;
  
  if (numberInput) {
    numberInput.disabled = !enabled || isMultiSelect;
    numberInput.style.opacity = (!enabled || isMultiSelect) ? '0.5' : '1';
  }
  
  if (nameInput) {
    nameInput.disabled = !enabled || isMultiSelect;
    nameInput.style.opacity = (!enabled || isMultiSelect) ? '0.5' : '1';
  }
  
  if (roleSelect) {
    roleSelect.disabled = !enabled;
  }
  
  if (cardSelect) {
    cardSelect.disabled = !enabled;
  }
}

/**
 * Set avatar buttons enabled state
 * @param {Object} elements - Button elements
 * @param {boolean} enabled - Whether to enable
 */
export function setAvatarButtonsEnabled(elements, enabled) {
  const { uploadButton, deleteButton } = elements;
  
  if (uploadButton) uploadButton.disabled = !enabled;
  if (deleteButton) deleteButton.disabled = !enabled;
}

/**
 * Set custom color controls enabled state
 * @param {Object} elements - Color elements
 * @param {boolean} enabled - Whether to enable
 */
export function setCustomColorControlsEnabled(elements, enabled) {
  const { colorCheckbox, colorInput } = elements;
  
  if (colorCheckbox) {
    colorCheckbox.disabled = !enabled;
  }
  
  if (colorInput) {
    colorInput.disabled = !enabled || !colorCheckbox?.checked;
  }
}

// ============================================
// VALIDATION INDICATORS
// ============================================

/**
 * Set input validation state
 * @param {HTMLElement} input - Input element
 * @param {boolean} isValid - Whether valid
 * @param {string} errorMessage - Error message (optional)
 */
export function setInputValidation(input, isValid, errorMessage = '') {
  if (!input) return;
  
  if (isValid) {
    input.classList.remove('error');
    input.title = '';
  } else {
    input.classList.add('error');
    input.title = errorMessage;
  }
}

/**
 * Clear all validation states
 * @param {Array<HTMLElement>} inputs - Input elements
 */
export function clearValidationStates(inputs) {
  if (!inputs || !Array.isArray(inputs)) return;
  
  inputs.forEach(input => {
    if (input) {
      input.classList.remove('error');
      input.title = '';
    }
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * Get panel elements structure
 * Helper to create elements object for sync functions
 * @param {Object} elementIds - Element IDs or elements
 * @returns {Object} Structured elements object
 */
export function getPanelElements(elementIds) {
  const getElement = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return document.getElementById(id);
    return id; // Already an element
  };
  
  return {
    playerProperties: {
      numberInput: getElement(elementIds.numberInput),
      nameInput: getElement(elementIds.nameInput),
      roleSelect: getElement(elementIds.roleSelect),
      cardSelect: getElement(elementIds.cardSelect)
    },
    avatar: {
      avatarPreview: getElement(elementIds.avatarPreview),
      avatarPlaceholder: getElement(elementIds.avatarPlaceholder),
      uploadButton: getElement(elementIds.uploadButton),
      deleteButton: getElement(elementIds.deleteButton)
    },
    customColor: {
      colorCheckbox: getElement(elementIds.colorCheckbox),
      colorInput: getElement(elementIds.colorInput)
    },
    directionButtons: elementIds.directionButtons || null
  };
}

/**
 * Create default colors object
 * @param {Object} colorInputs - Color input elements
 * @returns {Object} {player, gk}
 */
export function getDefaultColors(colorInputs) {
  return {
    player: colorInputs.player?.value || '#333333',
    gk: colorInputs.gk?.value || '#1e4dbb'
  };
}