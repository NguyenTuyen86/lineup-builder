/**
 * Export Module
 * 
 * Export lineup as PNG image using html2canvas.
 * NO hardcoded selectors - receives DOM elements.
 * Handles styling cleanup and restoration.
 */

// ============================================
// ELEMENT STYLE MANAGEMENT
// ============================================

/**
 * Save element styles
 * @param {HTMLElement} element - Element to save styles from
 * @param {Array<string>} properties - CSS properties to save
 * @returns {Object} Saved styles
 */
function saveStyles(element, properties) {
  const styles = {};
  properties.forEach(prop => {
    styles[prop] = element.style[prop] || '';
  });
  return styles;
}

/**
 * Restore element styles
 * @param {HTMLElement} element - Element to restore styles to
 * @param {Object} savedStyles - Saved styles object
 */
function restoreStyles(element, savedStyles) {
  Object.entries(savedStyles).forEach(([prop, value]) => {
    element.style[prop] = value;
  });
}

/**
 * Save styles for multiple elements
 * @param {Array<HTMLElement>} elements - Elements array
 * @param {Array<string>} properties - CSS properties to save
 * @returns {Array<Object>} Array of saved styles
 */
function saveMultipleStyles(elements, properties) {
  return Array.from(elements).map(el => saveStyles(el, properties));
}

/**
 * Restore styles for multiple elements
 * @param {Array<HTMLElement>} elements - Elements array
 * @param {Array<Object>} savedStyles - Array of saved styles
 */
function restoreMultipleStyles(elements, savedStyles) {
  Array.from(elements).forEach((el, index) => {
    if (savedStyles[index]) {
      restoreStyles(el, savedStyles[index]);
    }
  });
}

// ============================================
// EXPORT PREPARATION
// ============================================

/**
 * Prepare elements for export
 * @param {Object} config - Preparation config
 * @returns {Object} Restoration data
 */
export function prepareForExport(config) {
  const {
    selectedElements = [],
    playerElements = [],
    borderColor = '#00ff40'
  } = config;
  
  // Save current styles
  const savedData = {
    selected: saveMultipleStyles(selectedElements, ['outline']),
    players: saveMultipleStyles(playerElements, ['border', 'boxShadow', 'boxSizing'])
  };
  
  // Remove selection outlines
  selectedElements.forEach(el => {
    el.style.outline = 'none';
  });
  
  // Add visible borders for export
  playerElements.forEach(el => {
    el.style.boxSizing = 'border-box';
    el.style.border = `3px solid ${borderColor}`;
    el.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.1)';
  });
  
  return savedData;
}

/**
 * Restore elements after export
 * @param {Object} config - Restoration config
 * @param {Object} savedData - Saved data from prepareForExport
 */
export function restoreAfterExport(config, savedData) {
  const {
    selectedElements = [],
    playerElements = []
  } = config;
  
  // Restore selection outlines
  restoreMultipleStyles(selectedElements, savedData.selected);
  
  // Restore player borders
  restoreMultipleStyles(playerElements, savedData.players);
}

// ============================================
// HTML2CANVAS EXPORT
// ============================================

/**
 * Default html2canvas options
 */
export const DEFAULT_CANVAS_OPTIONS = {
  backgroundColor: null,
  scale: 2,
  logging: false,
  useCORS: true,
  allowTaint: true,
  foreignObjectRendering: false,
  imageTimeout: 0,
  removeContainer: true
};

/**
 * Capture element as canvas
 * @param {HTMLElement} element - Element to capture
 * @param {Object} options - html2canvas options
 * @returns {Promise<HTMLCanvasElement>} Canvas element
 */
export async function captureElementAsCanvas(element, options = {}) {
  if (!element) {
    throw new Error('No element provided');
  }
  
  if (typeof html2canvas === 'undefined') {
    throw new Error('html2canvas library not loaded');
  }
  
  const canvasOptions = {
    ...DEFAULT_CANVAS_OPTIONS,
    ...options
  };
  
  return await html2canvas(element, canvasOptions);
}

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Image quality 0-1 (for jpeg)
 * @returns {Promise<Blob>} Image blob
 */
export function canvasToBlob(canvas, format = 'image/png', quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// COMPLETE EXPORT FUNCTIONS
// ============================================

/**
 * Export element as PNG
 * @param {HTMLElement} element - Element to export
 * @param {Object} config - Export configuration
 * @returns {Promise<Blob>} PNG blob
 */
export async function exportElementAsPNG(element, config = {}) {
  const {
    selectedElements = [],
    playerElements = [],
    borderColor = '#00ff40',
    canvasOptions = {}
  } = config;
  
  // Prepare for export
  const savedData = prepareForExport({
    selectedElements,
    playerElements,
    borderColor
  });
  
  try {
    // Capture as canvas
    const canvas = await captureElementAsCanvas(element, canvasOptions);
    
    // Convert to blob
    const blob = await canvasToBlob(canvas);
    
    return blob;
  } finally {
    // Always restore styles
    restoreAfterExport({ selectedElements, playerElements }, savedData);
  }
}

/**
 * Export and download element as PNG
 * @param {HTMLElement} element - Element to export
 * @param {string} filename - Output filename
 * @param {Object} config - Export configuration
 * @returns {Promise<void>}
 */
export async function exportAndDownloadPNG(element, filename, config = {}) {
  const blob = await exportElementAsPNG(element, config);
  downloadBlob(blob, filename);
}

/**
 * Export lineup with progress callback
 * @param {HTMLElement} element - Element to export
 * @param {Object} config - Export configuration
 * @param {Function} onProgress - Progress callback (stage: string) => void
 * @returns {Promise<Blob>} PNG blob
 */
export async function exportWithProgress(element, config = {}, onProgress = null) {
  const {
    selectedElements = [],
    playerElements = [],
    borderColor = '#00ff40',
    canvasOptions = {}
  } = config;
  
  try {
    // Stage 1: Prepare
    if (onProgress) onProgress('preparing');
    const savedData = prepareForExport({
      selectedElements,
      playerElements,
      borderColor
    });
    
    // Stage 2: Capture
    if (onProgress) onProgress('capturing');
    const canvas = await captureElementAsCanvas(element, canvasOptions);
    
    // Stage 3: Convert
    if (onProgress) onProgress('converting');
    const blob = await canvasToBlob(canvas);
    
    // Stage 4: Restore
    if (onProgress) onProgress('restoring');
    restoreAfterExport({ selectedElements, playerElements }, savedData);
    
    // Stage 5: Complete
    if (onProgress) onProgress('complete');
    
    return blob;
  } catch (error) {
    if (onProgress) onProgress('error');
    throw error;
  }
}

// ============================================
// FILENAME GENERATION
// ============================================

/**
 * Generate export filename
 * @param {string} prefix - Filename prefix (default: 'lineup')
 * @param {Date} date - Date for timestamp
 * @param {string} extension - File extension (default: 'png')
 * @returns {string} Generated filename
 */
export function generateExportFilename(prefix = 'lineup', date = new Date(), extension = 'png') {
  const timestamp = date.getTime();
  return `${prefix}_${timestamp}.${extension}`;
}

// ============================================
// CANVAS UTILITIES
// ============================================

/**
 * Get canvas as data URL
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format
 * @param {number} quality - Image quality
 * @returns {string} Data URL
 */
export function canvasToDataURL(canvas, format = 'image/png', quality = 0.95) {
  return canvas.toDataURL(format, quality);
}

/**
 * Copy canvas to clipboard
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Promise<void>}
 */
export async function copyCanvasToClipboard(canvas) {
  const blob = await canvasToBlob(canvas);
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}

/**
 * Export element to clipboard
 * @param {HTMLElement} element - Element to export
 * @param {Object} config - Export configuration
 * @returns {Promise<void>}
 */
export async function exportToClipboard(element, config = {}) {
  const {
    selectedElements = [],
    playerElements = [],
    borderColor = '#00ff40',
    canvasOptions = {}
  } = config;
  
  const savedData = prepareForExport({
    selectedElements,
    playerElements,
    borderColor
  });
  
  try {
    const canvas = await captureElementAsCanvas(element, canvasOptions);
    await copyCanvasToClipboard(canvas);
  } finally {
    restoreAfterExport({ selectedElements, playerElements }, savedData);
  }
}

// ============================================
// QUALITY PRESETS
// ============================================

/**
 * Export quality presets
 */
export const QUALITY_PRESETS = {
  low: {
    scale: 1,
    quality: 0.7
  },
  medium: {
    scale: 2,
    quality: 0.85
  },
  high: {
    scale: 3,
    quality: 0.95
  },
  ultra: {
    scale: 4,
    quality: 1.0
  }
};

/**
 * Get canvas options for quality preset
 * @param {string} preset - Quality preset name
 * @returns {Object} Canvas options
 */
export function getQualityPreset(preset) {
  const presetConfig = QUALITY_PRESETS[preset] || QUALITY_PRESETS.medium;
  
  return {
    ...DEFAULT_CANVAS_OPTIONS,
    scale: presetConfig.scale
  };
}

/**
 * Export with quality preset
 * @param {HTMLElement} element - Element to export
 * @param {string} preset - Quality preset
 * @param {Object} config - Export configuration
 * @returns {Promise<Blob>} PNG blob
 */
export async function exportWithQuality(element, preset, config = {}) {
  const canvasOptions = getQualityPreset(preset);
  
  return await exportElementAsPNG(element, {
    ...config,
    canvasOptions
  });
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Export with error recovery
 * @param {HTMLElement} element - Element to export
 * @param {Object} config - Export configuration
 * @returns {Promise<{success: boolean, blob: Blob|null, error: Error|null}>}
 */
export async function exportWithErrorHandling(element, config = {}) {
  try {
    const blob = await exportElementAsPNG(element, config);
    return {
      success: true,
      blob,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      blob: null,
      error
    };
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Check if html2canvas is available
 * @returns {boolean} True if available
 */
export function isHtml2canvasAvailable() {
  return typeof html2canvas !== 'undefined';
}

/**
 * Validate export configuration
 * @param {HTMLElement} element - Element to export
 * @param {Object} config - Export configuration
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validateExportConfig(element, config = {}) {
  const errors = [];
  
  if (!element) {
    errors.push('No element provided');
  }
  
  if (!isHtml2canvasAvailable()) {
    errors.push('html2canvas library not loaded');
  }
  
  if (config.selectedElements && !Array.isArray(config.selectedElements)) {
    errors.push('selectedElements must be an array');
  }
  
  if (config.playerElements && !Array.isArray(config.playerElements)) {
    errors.push('playerElements must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}