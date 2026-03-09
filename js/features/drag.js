/**
 * Drag Feature
 * 
 * Make elements draggable with multi-selection support.
 * NO globals, NO direct DOM updates - uses callbacks.
 */

// ============================================
// DRAG STATE MANAGEMENT
// ============================================

/**
 * Create drag state object
 * @private
 */
function createDragState() {
  return {
    isDragging: false,
    startX: 0,
    startY: 0,
    startPositions: [],
    containerRect: null
  };
}

// ============================================
// POSITION CALCULATIONS
// ============================================

/**
 * Calculate new position from drag delta
 * @param {number} startPosition - Starting position (percentage)
 * @param {number} deltaPixels - Drag delta in pixels
 * @param {number} containerSize - Container size in pixels
 * @param {number} minBound - Minimum boundary (percentage)
 * @param {number} maxBound - Maximum boundary (percentage)
 * @returns {number} New position (percentage)
 */
function calculateNewPosition(startPosition, deltaPixels, containerSize, minBound = 5, maxBound = 95) {
  const deltaPercent = (deltaPixels / containerSize) * 100;
  const newPosition = startPosition + deltaPercent;
  return Math.max(minBound, Math.min(maxBound, newPosition));
}

/**
 * Calculate positions for multiple items
 * @param {Array<Object>} startPositions - [{x, y}, ...]
 * @param {number} dx - Delta X in pixels
 * @param {number} dy - Delta Y in pixels
 * @param {Object} containerRect - Container bounding rect
 * @param {Object} bounds - {minX, maxX, minY, maxY} percentages
 * @returns {Array<Object>} New positions [{x, y}, ...]
 */
function calculateBatchPositions(startPositions, dx, dy, containerRect, bounds = {}) {
  const { minX = 5, maxX = 95, minY = 5, maxY = 95 } = bounds;
  
  return startPositions.map(start => ({
    x: calculateNewPosition(start.x, dx, containerRect.width, minX, maxX),
    y: calculateNewPosition(start.y, dy, containerRect.height, minY, maxY)
  }));
}

// ============================================
// DRAG HANDLERS
// ============================================

/**
 * Make element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.container - Container element for bounds
 * @param {Function} options.onDragStart - (element, event) => {items: [{x, y}, ...]}
 * @param {Function} options.onDragMove - (positions: [{x, y}, ...]) => void
 * @param {Function} options.onDragEnd - () => void
 * @param {Object} options.bounds - {minX, maxX, minY, maxY} percentages
 * @param {string} options.draggingClass - CSS class for dragging state
 * @returns {Function} Cleanup function
 */
export function makeDraggable(element, options) {
  const {
    container,
    onDragStart,
    onDragMove,
    onDragEnd,
    bounds = {},
    draggingClass = 'dragging'
  } = options;
  
  const state = createDragState();
  let cleanupMove = null;
  let cleanupUp = null;
  
  /**
   * Mouse down handler
   */
  function handleMouseDown(e) {
    e.preventDefault();
    
    // Get container bounds
    state.containerRect = container.getBoundingClientRect();
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.isDragging = false;
    
    // Get items to drag from callback
    const dragData = onDragStart ? onDragStart(element, e) : null;
    if (!dragData || !dragData.items || dragData.items.length === 0) {
      return; // Nothing to drag
    }
    
    state.startPositions = dragData.items.map(item => ({
      x: item.x,
      y: item.y
    }));
    
    // Attach global move/up handlers
    cleanupMove = attachMoveHandler(e, element, state);
    cleanupUp = attachUpHandler(element, state);
  }
  
  /**
   * Attach mouse move handler
   */
  function attachMoveHandler(initialEvent, elem, state) {
    function handleMouseMove(ev) {
      if (!state.isDragging) {
        state.isDragging = true;
        elem.classList.add(draggingClass);
      }
      
      const dx = ev.clientX - state.startX;
      const dy = ev.clientY - state.startY;
      
      // Calculate new positions
      const newPositions = calculateBatchPositions(
        state.startPositions,
        dx,
        dy,
        state.containerRect,
        bounds
      );
      
      // Notify via callback
      if (onDragMove) {
        onDragMove(newPositions);
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }
  
  /**
   * Attach mouse up handler
   */
  function attachUpHandler(elem, state) {
    function handleMouseUp() {
      elem.classList.remove(draggingClass);
      
      // Cleanup
      if (cleanupMove) cleanupMove();
      if (cleanupUp) cleanupUp();
      cleanupMove = null;
      cleanupUp = null;
      
      // Notify end
      if (onDragEnd) {
        onDragEnd(state.isDragging);
      }
      
      state.isDragging = false;
    }
    
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }
  
  // Attach mousedown to element
  element.addEventListener('mousedown', handleMouseDown);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
    if (cleanupMove) cleanupMove();
    if (cleanupUp) cleanupUp();
  };
}

// ============================================
// MULTI-ITEM DRAG HELPER
// ============================================

/**
 * Make element draggable with multi-item support
 * Simplified API for common use case
 * 
 * @param {HTMLElement} element - Element to drag
 * @param {Object} config
 * @param {HTMLElement} config.container - Container for bounds
 * @param {Function} config.getItems - () => [{x, y, element}, ...]
 * @param {Function} config.onPositionUpdate - (item, {x, y}) => void
 * @param {Function} config.onDragEnd - (wasDragging) => void
 * @param {Object} config.bounds - Boundary constraints
 * @returns {Function} Cleanup function
 */
export function makeMultiDraggable(element, config) {
  const {
    container,
    getItems,
    onPositionUpdate,
    onDragEnd,
    bounds
  } = config;
  
  return makeDraggable(element, {
    container,
    bounds,
    
    onDragStart: () => {
      const items = getItems();
      return {
        items: items.map(item => ({ x: item.x, y: item.y }))
      };
    },
    
    onDragMove: (newPositions) => {
      const items = getItems();
      newPositions.forEach((pos, index) => {
        if (items[index] && onPositionUpdate) {
          onPositionUpdate(items[index], pos);
        }
      });
    },
    
    onDragEnd: (wasDragging) => {
      if (onDragEnd) {
        onDragEnd(wasDragging);
      }
    }
  });
}

// ============================================
// TOUCH SUPPORT
// ============================================

/**
 * Make element draggable with touch support
 * @param {HTMLElement} element - Element to drag
 * @param {Object} options - Same as makeDraggable options
 * @returns {Function} Cleanup function
 */
export function makeDraggableWithTouch(element, options) {
  const mouseDragCleanup = makeDraggable(element, options);
  const touchDragCleanup = makeTouchDraggable(element, options);
  
  return () => {
    mouseDragCleanup();
    touchDragCleanup();
  };
}

/**
 * Touch-specific drag handler
 * @private
 */
function makeTouchDraggable(element, options) {
  const {
    container,
    onDragStart,
    onDragMove,
    onDragEnd,
    bounds = {},
    draggingClass = 'dragging'
  } = options;
  
  const state = createDragState();
  
  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    state.containerRect = container.getBoundingClientRect();
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.isDragging = false;
    
    const dragData = onDragStart ? onDragStart(element, e) : null;
    if (!dragData || !dragData.items) return;
    
    state.startPositions = dragData.items.map(item => ({
      x: item.x,
      y: item.y
    }));
  }
  
  function handleTouchMove(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    
    if (!state.isDragging) {
      state.isDragging = true;
      element.classList.add(draggingClass);
    }
    
    const touch = e.touches[0];
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;
    
    const newPositions = calculateBatchPositions(
      state.startPositions,
      dx,
      dy,
      state.containerRect,
      bounds
    );
    
    if (onDragMove) {
      onDragMove(newPositions);
    }
  }
  
  function handleTouchEnd() {
    element.classList.remove(draggingClass);
    
    if (onDragEnd) {
      onDragEnd(state.isDragging);
    }
    
    state.isDragging = false;
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd);
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}

// ============================================
// DRAG UTILITIES
// ============================================

/**
 * Check if position is within bounds
 * @param {number} x - X position (percentage)
 * @param {number} y - Y position (percentage)
 * @param {Object} bounds - {minX, maxX, minY, maxY}
 * @returns {boolean} True if within bounds
 */
export function isWithinBounds(x, y, bounds = {}) {
  const { minX = 0, maxX = 100, minY = 0, maxY = 100 } = bounds;
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

/**
 * Clamp position to bounds
 * @param {Object} position - {x, y}
 * @param {Object} bounds - {minX, maxX, minY, maxY}
 * @returns {Object} Clamped {x, y}
 */
export function clampToBounds(position, bounds = {}) {
  const { minX = 0, maxX = 100, minY = 0, maxY = 100 } = bounds;
  
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y))
  };
}

/**
 * Calculate drag distance
 * @param {Object} start - {x, y} start position
 * @param {Object} end - {x, y} end position
 * @returns {number} Distance in percentage units
 */
export function calculateDragDistance(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if drag was significant (not just a click)
 * @param {Object} start - {x, y} start position
 * @param {Object} end - {x, y} end position
 * @param {number} threshold - Minimum distance (default 1%)
 * @returns {boolean} True if significant drag
 */
export function isSignificantDrag(start, end, threshold = 1) {
  return calculateDragDistance(start, end) > threshold;
}