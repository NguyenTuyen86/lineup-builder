/**
 * Button Event Bindings
 * 
 * Binds button clicks to callback functions.
 * NO data logic - just event delegation.
 */

// ============================================
// RESET BUTTONS
// ============================================

/**
 * Bind reset position button
 * Resets all players to formation positions
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindResetPositionButton(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/**
 * Bind reset current player button
 * Resets selected players to defaults
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindResetCurrentButton(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/**
 * Bind reset all button
 * Resets all players to defaults with confirmation
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void | Promise<void>
 * @param {Object} options - Optional configuration
 * @param {boolean} options.requireConfirmation - Show confirm dialog (default: true)
 * @param {string} options.confirmMessage - Confirmation message
 * @returns {Function} Cleanup function
 */
export function bindResetAllButton(button, onClick, options = {}) {
  if (!button) return () => {};
  
  const {
    requireConfirmation = true,
    confirmMessage = 'Bạn có chắc chắn muốn reset tất cả cầu thủ về trạng thái ban đầu? Hành động này không thể hoàn tác.'
  } = options;
  
  const handler = async () => {
    if (requireConfirmation) {
      if (!confirm(confirmMessage)) {
        return;
      }
    }
    
    await onClick();
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

/**
 * Bind reset color button
 * Resets all colors to classic theme
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindResetColorButton(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

// ============================================
// AVATAR BUTTONS
// ============================================

/**
 * Bind upload avatar button
 * Triggers file input click
 * @param {HTMLElement} button - Button element
 * @param {HTMLElement} fileInput - File input to trigger
 * @returns {Function} Cleanup function
 */
export function bindUploadAvatarButton(button, fileInput) {
  if (!button || !fileInput) return () => {};
  
  const handler = () => {
    fileInput.click();
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

/**
 * Bind upload avatar button with callback
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindUploadAvatarButtonWithCallback(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/**
 * Bind delete avatar button
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindDeleteAvatarButton(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

// ============================================
// SAVE/LOAD BUTTONS
// ============================================

/**
 * Bind save lineup button
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindSaveLineupButton(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/**
 * Bind load lineup button
 * Triggers file input click
 * @param {HTMLElement} button - Button element
 * @param {HTMLElement} fileInput - File input to trigger
 * @returns {Function} Cleanup function
 */
export function bindLoadLineupButton(button, fileInput) {
  if (!button || !fileInput) return () => {};
  
  const handler = () => {
    fileInput.click();
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

/**
 * Bind load lineup button with callback
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void
 * @returns {Function} Cleanup function
 */
export function bindLoadLineupButtonWithCallback(button, onClick) {
  if (!button) return () => {};
  
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}

/**
 * Bind export image button
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - () => void | Promise<void>
 * @returns {Function} Cleanup function
 */
export function bindExportImageButton(button, onClick) {
  if (!button) return () => {};
  
  const handler = async () => {
    await onClick();
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

// ============================================
// DIRECTION BUTTONS
// ============================================

/**
 * Bind direction button
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - (directionKey: string, button: HTMLElement) => void
 * @returns {Function} Cleanup function
 */
export function bindDirectionButton(button, onClick) {
  if (!button) return () => {};
  
  const handler = () => {
    const directionKey = button.textContent;
    onClick(directionKey, button);
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

/**
 * Bind all direction buttons in a container
 * @param {HTMLElement} container - Container with direction buttons
 * @param {Function} onClick - (directionKey: string, button: HTMLElement) => void
 * @returns {Function} Cleanup function
 */
export function bindDirectionButtons(container, onClick) {
  if (!container) return () => {};
  
  const buttons = container.querySelectorAll('button[data-dx]');
  const cleanups = Array.from(buttons).map(button => 
    bindDirectionButton(button, onClick)
  );
  
  return () => cleanups.forEach(cleanup => cleanup());
}

// ============================================
// GENERIC BUTTON BINDING
// ============================================

/**
 * Bind generic button
 * @param {HTMLElement} button - Button element
 * @param {Function} onClick - (event: Event) => void
 * @param {Object} options - Optional configuration
 * @param {boolean} options.preventDefault - Prevent default (default: false)
 * @param {boolean} options.stopPropagation - Stop propagation (default: false)
 * @returns {Function} Cleanup function
 */
export function bindButton(button, onClick, options = {}) {
  if (!button) return () => {};
  
  const {
    preventDefault = false,
    stopPropagation = false
  } = options;
  
  const handler = (event) => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();
    onClick(event);
  };
  
  button.addEventListener('click', handler);
  return () => button.removeEventListener('click', handler);
}

/**
 * Bind multiple buttons to same handler
 * @param {Array<HTMLElement>} buttons - Button elements
 * @param {Function} onClick - (button: HTMLElement, event: Event) => void
 * @returns {Function} Cleanup function
 */
export function bindButtons(buttons, onClick) {
  if (!buttons || !Array.isArray(buttons)) return () => {};
  
  const cleanups = buttons.map(button => {
    if (!button) return () => {};
    
    const handler = (event) => {
      onClick(button, event);
    };
    
    button.addEventListener('click', handler);
    return () => button.removeEventListener('click', handler);
  });
  
  return () => cleanups.forEach(cleanup => cleanup());
}

// ============================================
// BUTTON STATE MANAGEMENT
// ============================================

/**
 * Enable/disable button
 * @param {HTMLElement} button - Button element
 * @param {boolean} enabled - Whether to enable
 */
export function setButtonEnabled(button, enabled) {
  if (!button) return;
  button.disabled = !enabled;
}

/**
 * Enable/disable multiple buttons
 * @param {Array<HTMLElement>} buttons - Button elements
 * @param {boolean} enabled - Whether to enable
 */
export function setButtonsEnabled(buttons, enabled) {
  if (!buttons || !Array.isArray(buttons)) return;
  buttons.forEach(button => setButtonEnabled(button, enabled));
}

/**
 * Add active class to button
 * @param {HTMLElement} button - Button element
 * @param {string} activeClass - Class name (default: 'active')
 */
export function setButtonActive(button, activeClass = 'active') {
  if (!button) return;
  button.classList.add(activeClass);
}

/**
 * Remove active class from button
 * @param {HTMLElement} button - Button element
 * @param {string} activeClass - Class name (default: 'active')
 */
export function setButtonInactive(button, activeClass = 'active') {
  if (!button) return;
  button.classList.remove(activeClass);
}

/**
 * Toggle button active state
 * @param {HTMLElement} button - Button element
 * @param {boolean} isActive - Whether active
 * @param {string} activeClass - Class name (default: 'active')
 */
export function toggleButtonActive(button, isActive, activeClass = 'active') {
  if (!button) return;
  
  if (isActive) {
    button.classList.add(activeClass);
  } else {
    button.classList.remove(activeClass);
  }
}

/**
 * Clear active state from all buttons in group
 * @param {Array<HTMLElement>} buttons - Button elements
 * @param {string} activeClass - Class name (default: 'active')
 */
export function clearButtonGroupActive(buttons, activeClass = 'active') {
  if (!buttons || !Array.isArray(buttons)) return;
  buttons.forEach(button => {
    if (button) button.classList.remove(activeClass);
  });
}

/**
 * Set one button active in group, clear others
 * @param {Array<HTMLElement>} buttons - Button elements
 * @param {HTMLElement} activeButton - Button to make active
 * @param {string} activeClass - Class name (default: 'active')
 */
export function setButtonGroupActive(buttons, activeButton, activeClass = 'active') {
  clearButtonGroupActive(buttons, activeClass);
  if (activeButton) {
    activeButton.classList.add(activeClass);
  }
}

// ============================================
// BATCH BUTTON BINDING
// ============================================

/**
 * Bind all reset buttons
 * @param {Object} elements - Button elements
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindResetButtons(elements, callbacks) {
  const cleanups = [
    bindResetPositionButton(elements.resetPosition, callbacks.onResetPosition),
    bindResetCurrentButton(elements.resetCurrent, callbacks.onResetCurrent),
    bindResetAllButton(elements.resetAll, callbacks.onResetAll, callbacks.resetAllOptions),
    bindResetColorButton(elements.resetColor, callbacks.onResetColor)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all avatar buttons
 * @param {Object} elements - Button and input elements
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindAvatarButtons(elements, callbacks) {
  const cleanups = [
    bindUploadAvatarButton(elements.uploadAvatar, elements.avatarInput),
    bindDeleteAvatarButton(elements.deleteAvatar, callbacks.onDeleteAvatar)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all save/load buttons
 * @param {Object} elements - Button and input elements
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindSaveLoadButtons(elements, callbacks) {
  const cleanups = [
    bindSaveLineupButton(elements.saveLineup, callbacks.onSaveLineup),
    bindLoadLineupButton(elements.loadLineup, elements.loadInput),
    bindExportImageButton(elements.exportImage, callbacks.onExportImage)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all buttons
 * @param {Object} elements - All button elements
 * @param {Object} callbacks - All callback functions
 * @returns {Function} Cleanup function
 */
export function bindAllButtons(elements, callbacks) {
  const cleanups = [
    bindResetButtons(elements.reset, callbacks.reset),
    bindAvatarButtons(elements.avatar, callbacks.avatar),
    bindSaveLoadButtons(elements.saveLoad, callbacks.saveLoad)
  ];
  
  if (elements.directionContainer) {
    cleanups.push(
      bindDirectionButtons(elements.directionContainer, callbacks.onDirectionClick)
    );
  }
  
  return () => cleanups.forEach(cleanup => cleanup());
}