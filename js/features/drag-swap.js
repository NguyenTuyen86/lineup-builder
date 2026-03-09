/**
 * Drag & Swap Module
 * 
 * Handles dragging between bench and lineup zones.
 * Supports:
 * - Drag bench player → lineup player = swap
 * - Visual feedback (drop zones)
 */

import { swapPlayers, substitutePlayer } from '../core/squad.js';

// ============================================
// DRAG STATE
// ============================================

let dragState = {
  isDragging: false,
  draggedPlayer: null,
  draggedElement: null,
  sourceZone: null,  // 'bench' | 'lineup'
  dropTarget: null
};

// ============================================
// MAKE BENCH PLAYER DRAGGABLE
// ============================================

/**
 * Make bench player card draggable
 * @param {HTMLElement} card - Bench player card
 * @param {Object} player - Player data
 * @param {Object} callbacks - Event callbacks
 * @returns {Function} Cleanup function
 */
export function makeBenchPlayerDraggable(card, player, callbacks = {}) {
  const {
    onDragStart = null,
    onDragEnd = null,
    onSwap = null
  } = callbacks;
  
  card.draggable = true;
  
  // Track if we just dragged (prevent click after drag)
  let justDragged = false;
  
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', player.number);
    
    dragState.isDragging = true;
    dragState.draggedPlayer = player;
    dragState.draggedElement = card;
    dragState.sourceZone = 'bench';
    
    // Mark that we're dragging
    justDragged = true;
    
    // Visual feedback
    card.style.opacity = '0.5';
    
    if (onDragStart) {
      onDragStart(player, card);
    }
    
    console.log('🎯 Drag started:', player.name, 'from bench');
  };
  
  const handleDragEnd = (e) => {
    card.style.opacity = '1';
    
    // Check if dropped on valid target
    if (dragState.dropTarget) {
      const targetPlayer = dragState.dropTarget._player;
      
      if (onSwap) {
        onSwap(player, targetPlayer);
      }
      
      console.log('✅ Swap:', player.name, '↔', targetPlayer.name);
    } else {
      // No drop target = just clicked, not dragged
      justDragged = false;
    }
    
    // Reset drag state after short delay
    setTimeout(() => {
      justDragged = false;
    }, 50);
    
    // Reset state
    dragState.isDragging = false;
    dragState.draggedPlayer = null;
    dragState.draggedElement = null;
    dragState.sourceZone = null;
    dragState.dropTarget = null;
    
    if (onDragEnd) {
      onDragEnd(player);
    }
  };
  
  // ✅ Expose justDragged check
  card._wasJustDragged = () => justDragged;
  
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragend', handleDragEnd);
  
  return () => {
    card.removeEventListener('dragstart', handleDragStart);
    card.removeEventListener('dragend', handleDragEnd);
  };
}

// ============================================
// MAKE LINEUP PLAYER DROP TARGET
// ============================================

/**
 * Make lineup player droppable
 * @param {HTMLElement} playerWrapper - Lineup player WRAPPER element
 * @param {Object} player - Player data
 * @param {Object} callbacks - Event callbacks
 * @returns {Function} Cleanup function
 */
export function makeLineupPlayerDropTarget(playerWrapper, player, callbacks = {}) {
  const {
    onDrop = null,
    onDragEnter = null,
    onDragLeave = null
  } = callbacks;
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    
    if (dragState.isDragging && dragState.sourceZone === 'bench') {
      // ✅ Highlight WRAPPER (bao cả text bên trong)
      playerWrapper.style.outline = '3px solid #ffd700';
      playerWrapper.style.outlineOffset = '4px';
      
      dragState.dropTarget = playerWrapper;
      dragState.dropTarget._player = player;
      
      if (onDragEnter) {
        onDragEnter(player, playerWrapper);
      }
    }
  };
  
  const handleDragLeave = (e) => {
    // ✅ CHỈ remove khi rời THẬT (check mouse position)
    const rect = playerWrapper.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Nếu chuột vẫn trong wrapper bounds → ignore
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return;
    }
    
    // Thực sự rời khỏi wrapper
    playerWrapper.style.outline = '';
    playerWrapper.style.outlineOffset = '';
    
    if (dragState.dropTarget === playerWrapper) {
      dragState.dropTarget = null;
    }
    
    if (onDragLeave) {
      onDragLeave(player, playerWrapper);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove highlight
    playerWrapper.style.outline = '';
    playerWrapper.style.outlineOffset = '';
    
    if (onDrop) {
      const benchPlayer = dragState.draggedPlayer;
      onDrop(benchPlayer, player);
    }
  };
  
  playerWrapper.addEventListener('dragover', handleDragOver);
  playerWrapper.addEventListener('dragenter', handleDragEnter);
  playerWrapper.addEventListener('dragleave', handleDragLeave);
  playerWrapper.addEventListener('drop', handleDrop);
  
  return () => {
    playerWrapper.removeEventListener('dragover', handleDragOver);
    playerWrapper.removeEventListener('dragenter', handleDragEnter);
    playerWrapper.removeEventListener('dragleave', handleDragLeave);
    playerWrapper.removeEventListener('drop', handleDrop);
  };
}

// ============================================
// BATCH ENABLE/DISABLE DRAG
// ============================================

/**
 * Enable drag for all bench players
 * @param {HTMLElement} benchElement - Bench container
 * @param {Object} callbacks - Callbacks
 * @returns {Array<Function>} Cleanup functions
 */
export function enableBenchDrag(benchElement, callbacks = {}) {
  const cards = benchElement.querySelectorAll('.bench-player');
  const cleanups = [];
  
  cards.forEach(card => {
    const player = card._player;
    if (player) {
      const cleanup = makeBenchPlayerDraggable(card, player, callbacks);
      cleanups.push(cleanup);
    }
  });
  
  return cleanups;
}

/**
 * Enable drop for all lineup players
 * @param {HTMLElement} pitchElement - Pitch container
 * @param {Array<Object>} lineupPlayers - Lineup players with .wrap property
 * @param {Object} callbacks - Callbacks
 * @returns {Array<Function>} Cleanup functions
 */
export function enableLineupDrop(pitchElement, lineupPlayers, callbacks = {}) {
  const cleanups = [];
  
  lineupPlayers.forEach(player => {
    // ✅ Use .wrap (wrapper) instead of .el (inner circle)
    if (player.wrap) {
      const cleanup = makeLineupPlayerDropTarget(player.wrap, player, callbacks);
      cleanups.push(cleanup);
    }
  });
  
  return cleanups;
}

// ============================================
// DRAG STATE QUERIES
// ============================================

/**
 * Check if currently dragging
 * @returns {boolean}
 */
export function isDragging() {
  return dragState.isDragging;
}

/**
 * Get dragged player
 * @returns {Object|null}
 */
export function getDraggedPlayer() {
  return dragState.draggedPlayer;
}

/**
 * Get drag state info
 * @returns {Object}
 */
export function getDragState() {
  return {
    isDragging: dragState.isDragging,
    player: dragState.draggedPlayer,
    sourceZone: dragState.sourceZone,
    hasDropTarget: !!dragState.dropTarget
  };
}

// ============================================
// VISUAL FEEDBACK HELPERS
// ============================================

/**
 * Highlight all lineup players as drop targets
 * @param {Array<Object>} lineupPlayers - Players with .wrap
 */
export function highlightDropZones(lineupPlayers) {
  lineupPlayers.forEach(player => {
    if (player.wrap) {
      player.wrap.style.outline = '2px dashed #ffd700';
      player.wrap.style.outlineOffset = '2px';
    }
  });
}

/**
 * Remove drop zone highlights
 * @param {Array<Object>} lineupPlayers - Players with .wrap
 */
export function clearDropZoneHighlights(lineupPlayers) {
  lineupPlayers.forEach(player => {
    if (player.wrap) {
      player.wrap.style.outline = '';
      player.wrap.style.outlineOffset = '';
    }
  });
}

/**
 * Add CSS classes for drag state
 */
export function addDragStyles() {
  if (document.getElementById('drag-swap-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'drag-swap-styles';
  style.textContent = `
    .bench-player[draggable="true"] {
      cursor: grab;
    }
    
    .bench-player[draggable="true"]:active {
      cursor: grabbing;
    }
    
    .lineup-drop-target {
      outline: 2px dashed #ffd700 !important;
      outline-offset: 2px !important;
    }
  `;
  
  document.head.appendChild(style);
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize drag system
 * Auto-adds CSS styles
 */
export function initDragSwap() {
  addDragStyles();
  console.log('✅ Drag & Swap system initialized');
}