/**
 * Input Event Bindings
 * 
 * Binds input elements to callback functions.
 * NO business logic - just event delegation.
 * Callbacks receive data, not DOM elements.
 */

// ============================================
// PLAYER PROPERTY INPUTS
// ============================================

/**
 * Bind number input
 * @param {HTMLElement} input - Number input element
 * @param {Function} onChange - (newNumber) => void
 * @returns {Function} Cleanup function
 */
export function bindNumberInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  return () => input.removeEventListener('input', handler);
}

/**
 * Bind name input
 * @param {HTMLElement} input - Name input element
 * @param {Function} onChange - (newName) => void
 * @returns {Function} Cleanup function
 */
export function bindNameInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  return () => input.removeEventListener('input', handler);
}

/**
 * Bind role select
 * @param {HTMLElement} select - Role select element
 * @param {Function} onChange - (newRole) => void
 * @returns {Function} Cleanup function
 */
export function bindRoleSelect(select, onChange) {
  if (!select) return () => {};
  
  const handler = () => {
    onChange(select.value);
  };
  
  select.addEventListener('change', handler);
  return () => select.removeEventListener('change', handler);
}

// ============================================
// COLOR INPUTS
// ============================================

/**
 * Bind pitch color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindPitchColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler); // For color picker close
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

/**
 * Bind player color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindPlayerColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

/**
 * Bind GK color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindGKColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

/**
 * Bind border color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindBorderColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

/**
 * Bind arrow color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindArrowColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

/**
 * Bind custom player color checkbox
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isEnabled) => void
 * @returns {Function} Cleanup function
 */
export function bindCustomColorCheckbox(checkbox, onChange) {
  if (!checkbox) return () => {};
  
  const handler = () => {
    onChange(checkbox.checked);
  };
  
  checkbox.addEventListener('change', handler);
  return () => checkbox.removeEventListener('change', handler);
}

/**
 * Bind custom player color input
 * @param {HTMLElement} input - Color input element
 * @param {Function} onChange - (newColor) => void
 * @returns {Function} Cleanup function
 */
export function bindCustomPlayerColorInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = () => {
    onChange(input.value);
  };
  
  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

// ============================================
// FORMATION INPUTS
// ============================================

/**
 * Bind player count select
 * @param {HTMLElement} select - Select element
 * @param {Function} onChange - (newCount) => void
 * @returns {Function} Cleanup function
 */
export function bindPlayerCountSelect(select, onChange) {
  if (!select) return () => {};
  
  const handler = () => {
    onChange(parseInt(select.value, 10));
  };
  
  select.addEventListener('change', handler);
  return () => select.removeEventListener('change', handler);
}

/**
 * Bind formation select
 * @param {HTMLElement} select - Select element
 * @param {Function} onChange - (formationName) => void
 * @returns {Function} Cleanup function
 */
export function bindFormationSelect(select, onChange) {
  if (!select) return () => {};
  
  const handler = () => {
    onChange(select.value);
  };
  
  select.addEventListener('change', handler);
  return () => select.removeEventListener('change', handler);
}

// ============================================
// TOGGLE INPUTS
// ============================================

/**
 * Bind toggle checkbox
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindToggleCheckbox(checkbox, onChange) {
  if (!checkbox) return () => {};
  
  const handler = () => {
    onChange(checkbox.checked);
  };
  
  checkbox.addEventListener('change', handler);
  return () => checkbox.removeEventListener('change', handler);
}

/**
 * Bind names toggle
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindNamesToggle(checkbox, onChange) {
  return bindToggleCheckbox(checkbox, onChange);
}

/**
 * Bind positions toggle
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindPositionsToggle(checkbox, onChange) {
  return bindToggleCheckbox(checkbox, onChange);
}

/**
 * Bind numbers toggle
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindNumbersToggle(checkbox, onChange) {
  return bindToggleCheckbox(checkbox, onChange);
}

/**
 * Bind avatars toggle
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindAvatarsToggle(checkbox, onChange) {
  return bindToggleCheckbox(checkbox, onChange);
}

/**
 * Bind flip formation checkbox
 * @param {HTMLElement} checkbox - Checkbox element
 * @param {Function} onChange - (isChecked) => void
 * @returns {Function} Cleanup function
 */
export function bindFlipToggle(checkbox, onChange) {
  return bindToggleCheckbox(checkbox, onChange);
}

// ============================================
// CARD INPUT
// ============================================

/**
 * Bind card select
 * @param {HTMLElement} select - Card select element
 * @param {Function} onChange - (cardType) => void
 * @returns {Function} Cleanup function
 */
export function bindCardSelect(select, onChange) {
  if (!select) return () => {};
  
  const handler = () => {
    onChange(select.value);
  };
  
  select.addEventListener('change', handler);
  return () => select.removeEventListener('change', handler);
}

// ============================================
// THEME INPUT
// ============================================

/**
 * Bind theme select
 * @param {HTMLElement} select - Theme select element
 * @param {Function} onChange - (themeName) => void
 * @returns {Function} Cleanup function
 */
export function bindThemeSelect(select, onChange) {
  if (!select) return () => {};
  
  const handler = () => {
    onChange(select.value);
  };
  
  select.addEventListener('change', handler);
  return () => select.removeEventListener('change', handler);
}

// ============================================
// FILE INPUT
// ============================================

/**
 * Bind file input
 * @param {HTMLElement} input - File input element
 * @param {Function} onChange - (file) => void
 * @returns {Function} Cleanup function
 */
export function bindFileInput(input, onChange) {
  if (!input) return () => {};
  
  const handler = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
    // Clear input so same file can be selected again
    e.target.value = '';
  };
  
  input.addEventListener('change', handler);
  return () => input.removeEventListener('change', handler);
}

/**
 * Bind avatar upload input
 * @param {HTMLElement} input - File input element
 * @param {Function} onChange - (file) => void
 * @returns {Function} Cleanup function
 */
export function bindAvatarInput(input, onChange) {
  return bindFileInput(input, onChange);
}

// ============================================
// BATCH INPUT BINDING
// ============================================

/**
 * Bind all player property inputs
 * @param {Object} elements - DOM element references
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindPlayerPropertyInputs(elements, callbacks) {
  const cleanups = [
    bindNumberInput(elements.numberInput, callbacks.onNumberChange),
    bindNameInput(elements.nameInput, callbacks.onNameChange),
    bindRoleSelect(elements.roleSelect, callbacks.onRoleChange),
    bindCardSelect(elements.cardSelect, callbacks.onCardChange)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all color inputs
 * @param {Object} elements - DOM element references
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindColorInputs(elements, callbacks) {
  const cleanups = [
    bindPitchColorInput(elements.pitchColorInput, callbacks.onPitchColorChange),
    bindPlayerColorInput(elements.playerColorInput, callbacks.onPlayerColorChange),
    bindGKColorInput(elements.gkColorInput, callbacks.onGKColorChange),
    bindBorderColorInput(elements.borderColorInput, callbacks.onBorderColorChange),
    bindArrowColorInput(elements.arrowColorInput, callbacks.onArrowColorChange),
    bindCustomColorCheckbox(elements.customColorCheckbox, callbacks.onCustomColorToggle),
    bindCustomPlayerColorInput(elements.customPlayerColorInput, callbacks.onCustomPlayerColorChange)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all toggle inputs
 * @param {Object} elements - DOM element references
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindToggleInputs(elements, callbacks) {
  const cleanups = [
    bindNamesToggle(elements.toggleNames, callbacks.onNamesToggle),
    bindPositionsToggle(elements.togglePositions, callbacks.onPositionsToggle),
    bindNumbersToggle(elements.toggleNumbers, callbacks.onNumbersToggle),
    bindAvatarsToggle(elements.toggleAvatars, callbacks.onAvatarsToggle),
    bindFlipToggle(elements.flipToggle, callbacks.onFlipToggle)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all formation inputs
 * @param {Object} elements - DOM element references
 * @param {Object} callbacks - Callback functions
 * @returns {Function} Cleanup function
 */
export function bindFormationInputs(elements, callbacks) {
  const cleanups = [
    bindPlayerCountSelect(elements.playerCountSelect, callbacks.onPlayerCountChange),
    bindFormationSelect(elements.formationSelect, callbacks.onFormationChange)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

/**
 * Bind all inputs at once
 * @param {Object} elements - All DOM element references
 * @param {Object} callbacks - All callback functions
 * @returns {Function} Cleanup function
 */
export function bindAllInputs(elements, callbacks) {
  const cleanups = [
    bindPlayerPropertyInputs(elements, callbacks),
    bindColorInputs(elements, callbacks),
    bindToggleInputs(elements, callbacks),
    bindFormationInputs(elements, callbacks),
    bindThemeSelect(elements.themeSelect, callbacks.onThemeChange),
    bindAvatarInput(elements.avatarInput, callbacks.onAvatarUpload)
  ];
  
  return () => cleanups.forEach(cleanup => cleanup());
}

// ============================================
// INPUT VALUE SETTERS
// ============================================

/**
 * Set input value without triggering event
 * @param {HTMLElement} input - Input element
 * @param {any} value - Value to set
 */
export function setInputValue(input, value) {
  if (!input) return;
  
  if (input.type === 'checkbox') {
    input.checked = !!value;
  } else {
    input.value = value;
  }
}

/**
 * Set multiple input values
 * @param {Object} values - {elementId: value, ...} or {element: value, ...}
 */
export function setInputValues(values) {
  Object.entries(values).forEach(([key, value]) => {
    const element = typeof key === 'string' ? document.getElementById(key) : key;
    setInputValue(element, value);
  });
}

/**
 * Enable/disable input
 * @param {HTMLElement} input - Input element
 * @param {boolean} enabled - Whether to enable
 */
export function setInputEnabled(input, enabled) {
  if (!input) return;
  input.disabled = !enabled;
}

/**
 * Enable/disable multiple inputs
 * @param {Array<HTMLElement>} inputs - Input elements
 * @param {boolean} enabled - Whether to enable
 */
export function setInputsEnabled(inputs, enabled) {
  inputs.forEach(input => setInputEnabled(input, enabled));
}