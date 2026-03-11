/**
 * Main Application Entry Point
 * 
 * Initializes state and wires all modules together.
 * NO business logic - just coordination.
 * NO exports - this is the app entry point.
 */

// ============================================
// IMPORTS
// ============================================

// Core modules
import { 
  getFormationData,
  initializePlayers,
  createFormation
} from './core/formation.js';

import {
  selectPlayer,
  addToSelection,
  clearSelection,
  handlePlayerClick,
  getSelectionState,
  getSelectedPlayers,
  getPrimaryPlayer,
  isMultipleSelection
} from './core/selection.js';

import {
  renderPlayers,
  updatePlayerPosition,
  updatePlayerColor,
  updatePlayerNumber,
  updatePlayerName,
  updatePlayerRole,
  updateCardIndicator,
  updateDirectionArrows
} from './core/render.js';

// Squad management
import {
  createSquad,
  getLineup,
  getBench,
  splitSquad,
  swapPlayers,
  addPlayerToSquad,
  removePlayerFromSquad,
  adjustSquadForNewPlayerCount
} from './core/squad.js';

import {
  createStaff,
  addStaffMember,
  removeStaffMember,
  updateStaffMember,
  STAFF_ROLES,
  MAX_STAFF
} from './core/staff.js';

import { renderBench } from './ui/bench-render.js';

import {
  renderSquadList,
  updateSquadStats,
  highlightSquadPlayer,
  showAddPlayerDialog,
  filterSquadList
} from './ui/squad-panel.js';

import { showAvatarCropModal } from './ui/avatar-crop-modal.js';

import { resizeLogoPreserveRatio } from './ui/logo-crop-modal.js';

import { updateTeamHeader, updateTeamLogoPreview } from './ui/team-info.js';

import {
  initDragSwap,
  enableBenchDrag,
  enableLineupDrop
} from './features/drag-swap.js';

// Features
import {
  toggleDirectionMulti,
  getDirectionKeys,
  serializeDirections,
  deserializeDirections
} from './features/directions.js';

import {
  makeDraggable
} from './features/drag.js';

import { 
  resizeAvatar 
} from './utils/imageResize.js';

import {
  flipLineupStandard,
  toggleFlip
} from './features/flip.js';

import {
  setCustomColor,
  removeCustomColor,
  setCustomColorMulti,
  removeCustomColorMulti,
  setAvatar,
  removeAvatar,
  setAvatarMulti,
  removeAvatarMulti,
  loadImageAsBase64,
  setCard,
  setCardMulti,
  clearAllCustomizations,
  clearAllCustomizationsMulti
} from './features/customization.js';

// Configuration
import { getFormationNames } from './config/formations.js';
import { getTheme, getThemeNames, matchTheme } from './config/themes.js';

// UI
import {
  bindNumberInput,
  bindNameInput,
  bindRoleSelect,
  bindPlayerCountSelect,
  bindFormationSelect,
  bindPitchColorInput,
  bindPlayerColorInput,
  bindGKColorInput,
  bindBorderColorInput,
  bindArrowColorInput,
  bindCustomColorCheckbox,
  bindCustomPlayerColorInput,
  bindNamesToggle,
  bindPositionsToggle,
  bindNumbersToggle,
  bindAvatarsToggle,
  bindFlipToggle,
  bindCardSelect,
  bindThemeSelect,
  bindAvatarInput
} from './ui/inputs.js';

import {
  bindResetPositionButton,
  bindResetCurrentButton,
  bindResetAllButton,
  bindResetColorButton,
  bindUploadAvatarButton,
  bindDeleteAvatarButton,
  bindSaveLineupButton,
  bindLoadLineupButton,
  bindExportImageButton,
  bindDirectionButtons
} from './ui/buttons.js';

import {
  syncControlPanel,
  clearControlPanel,
  updateNumberInput,
  updateNameInput,
  getPanelElements,
  getDefaultColors
} from './ui/panel.js';

// I/O
import { downloadLineupJSON, quickDownload } from './io/save.js';
import { loadLineupFromFile, extractDirectionKeys, restoreDirectionKeys, cleanupDirectionStorage, detectThemeFromColors } from './io/load.js';
import { exportAndDownloadPNG, generateExportFilename } from './io/export.js';

import { exportRosterAsPNG } from './io/roster-export.js';

// Mobile responsive
import { 
  initMobileUI, 
  setupMobileTouchHandlers,
  setupBenchTouchHandlers,
  disableMobileUnsupportedFeatures,
  showToast 
} from './ui/mobile.js';

// ============================================
// BƯỚC 2: UPDATE STATE (dòng ~139)
// ============================================

let state = {
  // 🆕 Squad management
  squad: [],
  lineup: [],
  bench: [],
  staff: [],  // ✅ Coaching staff
  
  // 👕 Team info
  team: {
    name: '',
    logo: null,
    showOnPitch: true
  },
  
  // ⚠️ Giữ nguyên để backward compatible
  players: [],
  
  playerCount: 11,
  formation: '4-4-2',
  isFlipped: false,
  colors: {
    pitch: '#0b5d34',
    player: '#333333',
    gk: '#1e4dbb',
    border: '#00ff40',
    arrow: '#ff3333'
  }
};
// ============================================
// DOM REFERENCES
// ============================================

const elements = {
  pitch: document.getElementById('pitch'),
  bench: document.getElementById('bench'),  // 🆕 Thêm dòng này
  
  // Formation controls
  playerCountSelect: document.getElementById('count'),
  formationSelect: document.getElementById('formation'),
  flipCheckbox: document.getElementById('flipFormation'),
  
  // Player property inputs
  numberInput: document.getElementById('num'),
  nameInput: document.getElementById('name'),
  roleSelect: document.getElementById('role'),
  cardSelect: document.getElementById('cardStatus'),
  
  // Color inputs
  pitchColorInput: document.getElementById('pitchColor'),
  playerColorInput: document.getElementById('playerColor'),
  gkColorInput: document.getElementById('gkColor'),
  borderColorInput: document.getElementById('playerBorderColor'),
  arrowColorInput: document.getElementById('arrowColor'),
  
  // Custom color controls
  customColorCheckbox: document.getElementById('useCustomColor'),
  customPlayerColorInput: document.getElementById('playerCustomColor'),
  
  // Avatar controls
  avatarPreview: document.getElementById('avatarPreview'),
  avatarPlaceholder: document.getElementById('avatarPlaceholder'),
  uploadAvatarBtn: document.getElementById('uploadAvatarBtn'),
  deleteAvatarBtn: document.getElementById('deleteAvatarBtn'),
  avatarInput: document.getElementById('avatarUpload'),
  
  // Toggle controls
  toggleNames: document.getElementById('toggleNames'),
  togglePositions: document.getElementById('togglePositions'),
  toggleNumbers: document.getElementById('toggleNumbers'),
  toggleAvatars: document.getElementById('toggleAvatars'),
  
  // Theme
  themeSelect: document.getElementById('themeSelect'),
  
  // Buttons
  resetPositionBtn: document.getElementById('resetPosition'),
  resetPositionSelectedBtn: document.getElementById('resetPositionSelected'),
  resetCurrentBtn: document.getElementById('resetCurrent'),
  resetAllBtn: document.getElementById('resetAll'),
  resetColorBtn: document.getElementById('resetColor'),
  
  saveBtn: document.getElementById('saveLineup'),
  loadBtn: document.getElementById('loadLineup'),
  loadInput: document.getElementById('importJSONInput'),
  exportBtn: document.getElementById('exportBtn'),
  
  // Direction buttons
  directionContainer: document.querySelector('.move-grid'),
  
  // 🆕 Tab elements
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // 🆕 Squad panel elements
  squadList: document.getElementById('squadList'),
  squadStats: document.getElementById('squadStats'),
  squadSearch: document.getElementById('squadSearch'),
  addPlayerBtn: document.getElementById('addPlayerBtn'),
  addStaffBtn: document.getElementById('addStaffBtn'),
  exportRosterBtn: document.getElementById('exportRosterBtn'),
  
  // 👕 Team info elements
  teamNameInput: document.getElementById('teamName'),
  teamLogoPreview: document.getElementById('teamLogoPreview'),
  uploadTeamLogoBtn: document.getElementById('uploadTeamLogoBtn'),
  deleteTeamLogoBtn: document.getElementById('deleteTeamLogoBtn'),
  teamLogoInput: document.getElementById('teamLogoUpload'),
  showTeamInfoCheckbox: document.getElementById('showTeamInfo'),
  teamHeader: document.getElementById('teamHeader')
};

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
  // Initialize formation dropdown
  updateFormationDropdown();
  
  // Load initial formation
  loadFormation(state.playerCount, state.formation, state.isFlipped);
  
  // Wire all event handlers
  wireInputHandlers();
  wireButtonHandlers();
  wirePlayerInteractions();
  
  // 🆕 Setup tabs
  setupTabs();
  
  // 🆕 Setup squad search
  setupSquadSearch();
  
  // Apply initial colors
  applyColors(state.colors);
  initDragSwap();
  
  // Initial squad panel render
  renderSquadPanel();
  
  // ✅ Initialize team header
  updateTeamHeader(elements.teamHeader, state.team);
  
  // 📱 Initialize mobile UI with error handling
  try {
    const isMobile = window.innerWidth <= 1280 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile device detected, initializing mobile UI...');
      initMobileUI();
      setupMobileTouchHandlers();
      disableMobileUnsupportedFeatures();
      console.log('✅ Mobile UI initialized successfully');
    } else {
      console.log('💻 Desktop device detected');

  // 🔧 Player edit inputs
  if (elements.numberInput) {
    elements.numberInput.addEventListener('input', () => {
      const selected = getSelectedPlayers();
      if (selected.length > 0) {
        const num = parseInt(elements.numberInput.value);
        if (!isNaN(num) && num > 0) {
          selected[0].number = num;
          if (selected[0].numberEl) {
            updatePlayerNumber(selected[0].numberEl, num);
            // Force display in case it's hidden
            selected[0].numberEl.style.display = 'block';
          }
        }
      }
    });
  }
  
  if (elements.nameInput) {
    elements.nameInput.addEventListener('input', () => {
      const selected = getSelectedPlayers();
      if (selected.length > 0) {
        const name = elements.nameInput.value.trim();
        if (name) {
          selected[0].name = name;
          if (selected[0].nameEl) {
            updatePlayerName(selected[0].nameEl, name);
            // Force display in case it's hidden
            selected[0].nameEl.style.display = 'inline-block';
          }
        }
      }
    });
  }
  
  if (elements.roleSelect) {
    elements.roleSelect.addEventListener('change', () => {
      const selected = getSelectedPlayers();
      if (selected.length > 0) {
        selected[0].role = elements.roleSelect.value;
        if (selected[0].roleEl) {
          updatePlayerRole(selected[0].roleEl, selected[0].role);
          // Force display in case it's hidden
          selected[0].roleEl.style.display = 'block';
        }
      }
    });
  }
        } else {
          console.log('❌ No roleEl found!');
        }
      }
    });
  }
    }
  } catch (error) {
    console.error('❌ Mobile UI initialization failed:', error);
    // Continue anyway - desktop features will still work
  }
}

function updateFormationDropdown() {
  const formationNames = getFormationNames(state.playerCount);
  
  elements.formationSelect.innerHTML = '';
  formationNames.forEach((name, index) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    if (index === 0) option.selected = true;
    elements.formationSelect.appendChild(option);
  });
}

function loadFormation(playerCount, formationName, isFlipped) {
  // Check if squad exists (smart resize)
  if (state.squad && state.squad.length > 0) {
    // Smart resize: Preserve existing players
    const result = adjustSquadForNewPlayerCount(
      state.squad,
      playerCount,
      () => {
        // Get formation data for new size
        let formationData = getFormationData(playerCount, formationName);
        if (isFlipped) {
          // Flip positions if needed
          formationData = formationData.map(pos => ({
            ...pos,
            y: 100 - pos.y
          }));
        }
        return formationData;
      }
    );
    
    // Update state
    state.squad = result.squad;
    state.lineup = result.lineup;
    state.bench = result.bench;
    state.players = result.lineup;
    state.playerCount = playerCount;
    state.formation = formationName;
    state.isFlipped = isFlipped;
    
  } else {
    // First load: Create new squad
    const lineupPlayers = createFormation(playerCount, formationName, isFlipped);
    const squadData = createSquad(lineupPlayers, 15);  // 15 bench = max 26 players
    
    state.squad = squadData.squad;
    state.lineup = squadData.lineup;
    state.bench = squadData.bench;
    state.players = squadData.lineup;
    state.playerCount = playerCount;
    state.formation = formationName;
    state.isFlipped = isFlipped;
  }
  
  // Render
  renderLineup();
}


function renderLineup() {
  console.log('🎨 renderLineup called');
  console.trace('  Stack:');
  
  // Save current selection before render
  const currentlySelected = getSelectedPlayers();
  
  renderPlayers(
    elements.pitch,
    state.players,
    {
      colors: state.colors,
      toggles: {
       names: elements.toggleNames?.checked ?? true,
       numbers: elements.toggleNumbers?.checked ?? true,
       positions: elements.togglePositions?.checked ?? true,
       avatars: elements.toggleAvatars?.checked ?? true
      },




      onPlayerCreated: (player, domElements) => {
        // Store DOM references
        player.wrap = domElements.wrapper;
        player.el = domElements.element;
        player.numberEl = domElements.numberElement;
        player.nameEl = domElements.nameElement;
        player.roleEl = domElements.roleElement;
        
        // 🔑 Store player data reference on DOM element
        domElements.element._player = player;
        
        // Track drag state to prevent click after drag
        let justDragged = false;
        
        // Restore selection highlight if this player was selected
        if (currentlySelected.includes(player)) {
          domElements.element.classList.add('selected');
        }
        
        // Make clickable
        domElements.element.onclick = (e) => {
          // Skip click if we just finished dragging
          if (justDragged) {
            justDragged = false;
            return;
          }
          handlePlayerClickEvent(player, e);
        };

        
        
        // Make draggable with drag module
        makeDraggable(domElements.wrapper, {
          container: elements.pitch,
          onDragStart: (el, e) => {
            const isMultiSelectClick = e.ctrlKey || e.metaKey || e.shiftKey;
            
            // During multi-select click, return empty to prevent any drag
            // Let the click handler manage everything
            if (isMultiSelectClick) {
              return { items: [] }; // No drag during multi-select
            }
            
            const selected = getSelectedPlayers();
            
            // If this player is NOT selected, select only this one
            if (!selected.includes(player)) {
              clearSelection();
              selectPlayer(player);
              player.el.classList.add('selected');
              
              // Clear other players' selected class
              state.players.forEach(p => {
                if (p !== player && p.el) {
                  p.el.classList.remove('selected');
                }
              });
              
              syncPanel();
              return { items: [{ x: player.x, y: player.y }] };
            }
            
            // If this player IS selected AND it's the ONLY one selected
            // → Drag just this one
            if (selected.length === 1) {
              return { items: [{ x: player.x, y: player.y }] };
            }
            
            // If multiple players selected AND we're dragging one of them
            // → Multi-drag all selected players
            return { items: selected.map(p => ({ x: p.x, y: p.y })) };
          },
          onDragMove: (positions) => {
            const selected = getSelectedPlayers();
            positions.forEach((pos, i) => {
              if (selected[i] && selected[i].wrap) {
                selected[i].x = pos.x;
                selected[i].y = pos.y;
                // Use same format as render.js: calc(% - 30px)
                selected[i].wrap.style.left = `calc(${pos.x}% - 30px)`;
                selected[i].wrap.style.top = `calc(${pos.y}% - 30px)`;
              }
            });
          },
          onDragEnd: (wasDragging) => {
            // Mark that we just dragged to prevent click handler
            if (wasDragging) {
              justDragged = true;
              // Reset after short delay (longer than click event)
              setTimeout(() => { justDragged = false; }, 100);
            }
          }
        });
      }   
    }
  );
  
  // Render bench with callbacks
  renderBenchWithCallbacks();
}

// ============================================
// BENCH RENDER HELPER
// ============================================

function renderBenchWithCallbacks() {
  if (!elements.bench || !state.bench) return;
  
  renderBench(elements.bench, state.bench, {
    onPlayerClick: (player, card, event) => {
      console.log('Bench player clicked:', player.name);
      
      // ✅ Check for multi-select (Ctrl/Cmd/Shift)
      const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
      
      // Use handlePlayerClick (same as lineup)
      handlePlayerClick(player, isMultiSelect);
      
      // Clear lineup selection visuals
      state.lineup.forEach(p => {
        if (p.el) p.el.classList.remove('selected');
      });
      
      // ✅ Highlight selected bench cards
      const selected = getSelectedPlayers();
      const allBenchCards = elements.bench.querySelectorAll('.bench-player');
      allBenchCards.forEach(c => {
        const isSelected = selected.some(p => p === c._player);
        c.style.borderColor = isSelected ? '#ffd700' : '#444';
        c.style.background = isSelected ? '#3a3a3a' : '#333';
      });
      
      syncPanel();
    },
    
    onPlayerDelete: (player) => {
      const success = removePlayerFromSquad(state.squad, player);
      
      if (success) {
        state.bench = state.squad.filter(p => p.location === 'bench');
        console.log(`✅ Deleted ${player.name} from bench`);
        renderLineup();
        renderSquadPanel();
      } else {
        alert('Failed to delete player');
      }
    },
    
    onAddPlayer: () => {
      handleAddPlayer();
    }
  });
  
  // 🔍 GLOBAL HELPER for easy debugging
  window.checkPositions = function() {
    const d = window.DEBUG_POSITIONS;
    if (!d) {
      alert('No debug data yet. Do a swap first!');
      return;
    }
    
    let msg = '';
    
    // Check player 5 as example
    if (d.beforeSave[5]) {
      msg += `Player 5:\n`;
      msg += `BEFORE: ${d.beforeSave[5].x.toFixed(0)}, ${d.beforeSave[5].y.toFixed(0)}\n`;
      if (d.afterRestore[5]) {
        msg += `AFTER RESTORE: ${d.afterRestore[5].x.toFixed(0)}, ${d.afterRestore[5].y.toFixed(0)}\n`;
      }
      if (d.afterRender[5]) {
        msg += `AFTER RENDER: ${d.afterRender[5].x.toFixed(0)}, ${d.afterRender[5].y.toFixed(0)}\n`;
      }
    } else {
      msg = 'Player 5 not in lineup\n\n';
    }
    
    // Check player 7
    if (d.beforeSave[7]) {
      msg += `\nPlayer 7:\n`;
      msg += `BEFORE: ${d.beforeSave[7].x.toFixed(0)}, ${d.beforeSave[7].y.toFixed(0)}\n`;
      if (d.afterRestore[7]) {
        msg += `AFTER RESTORE: ${d.afterRestore[7].x.toFixed(0)}, ${d.afterRestore[7].y.toFixed(0)}\n`;
      }
      if (d.afterRender[7]) {
        msg += `AFTER RENDER: ${d.afterRender[7].x.toFixed(0)}, ${d.afterRender[7].y.toFixed(0)}\n`;
      }
    }
    
    alert(msg);
  };
  
  // 🆕 MOBILE SWAP HANDLER (called from mobile.js)
  window.mobileSwapHandler = (benchPlayerRef, lineupPlayerRef) => {
    try {
      console.log(`🔄 SWAP: #${benchPlayerRef.number} ↔ #${lineupPlayerRef.number}`);
      
      // Find ACTUAL objects in state.squad
      const benchPlayer = state.squad.find(p => p.number === benchPlayerRef.number);
      const lineupPlayer = state.squad.find(p => p.number === lineupPlayerRef.number);
      
      if (!benchPlayer || !lineupPlayer) {
        throw new Error('Player not found!');
      }
      
      // Save positions from state.lineup  
      const positionBackup = new Map();
      
      let savedList = '';
      state.lineup.forEach(p => {
        if (p.x !== undefined && p.y !== undefined) {
          positionBackup.set(p.number, { x: p.x, y: p.y });
          savedList += `#${p.number} `;
        }
      });
      
      // 🔍 Show ALL saved player numbers
      alert(`SAVED ${positionBackup.size} players: ${savedList}`);
      
      // Swap
      swapPlayers(benchPlayer, lineupPlayer);
      
      // Update state arrays
      const newLineup = state.squad.filter(p => p.location === 'lineup')
        .sort((a, b) => a.slotIndex - b.slotIndex);
      const newBench = state.squad.filter(p => p.location === 'bench');
      
      // RESTORE
      let restoredList = '';
      let restoredCount = 0;
      newLineup.forEach(p => {
        if (positionBackup.has(p.number)) {
          const backup = positionBackup.get(p.number);
          p.x = backup.x;
          p.y = backup.y;
          restoredCount++;
          restoredList += `#${p.number} `;
        }
      });
      
      // 🔍 Show ALL restored player numbers
      alert(`RESTORED ${restoredCount} players: ${restoredList}`);
      
      // Update state
      state.lineup = newLineup;
      state.bench = newBench;
      state.players = state.lineup;
      
      // Render
      renderLineup();
      renderBenchWithCallbacks();
      
      // 🔍 Check after render - show positions
      setTimeout(() => {
        let finalList = '';
        state.lineup.forEach(p => {
          finalList += `#${p.number}:${p.x.toFixed(0)},${p.y.toFixed(0)} `;
        });
        alert(`FINAL: ${finalList}`);
      }, 100);
      
    } catch (error) {
      console.error('❌ Swap error:', error);
      alert('Swap error: ' + error.message);
    }
  };
  
  // Verify handler is registered
  console.log('✅ mobileSwapHandler registered:', typeof window.mobileSwapHandler);
  
  // Setup drag AFTER bench render
  setTimeout(() => {
    enableBenchDrag(elements.bench, {
      onDragStart: (player) => {
        console.log('🎯 Dragging:', player.name);
      },
      onSwap: (benchPlayer, lineupPlayer) => {
        const positionBackup = new Map();
        state.players.forEach(p => {
          if (p.x !== undefined && p.y !== undefined) {
            positionBackup.set(p.number, { x: p.x, y: p.y });
          }
        });
        
        swapPlayers(benchPlayer, lineupPlayer);
        
        state.lineup = state.squad.filter(p => p.location === 'lineup')
          .sort((a, b) => a.slotIndex - b.slotIndex);
        state.bench = state.squad.filter(p => p.location === 'bench');
        
        state.lineup.forEach(p => {
          if (positionBackup.has(p.number)) {
            const backup = positionBackup.get(p.number);
            p.x = backup.x;
            p.y = backup.y;
          }
        });
        
        state.players = state.lineup;
        renderLineup();
      }
    });
    
    enableLineupDrop(elements.pitch, state.lineup, {
      onDrop: (benchPlayer, lineupPlayer) => {
        console.log('📍 Dropped on:', lineupPlayer.name);
      },
      onDragEnter: (player) => {
        console.log('👉 Hover over:', player.name);
      }
    });
    
    // 🆕 Setup mobile touch handlers for bench - with retry
    setTimeout(() => {
      setupBenchTouchHandlers();
      
      // Retry if bench wasn't ready
      setTimeout(() => {
        setupBenchTouchHandlers();
      }, 100);
    }, 50);
  }, 50);
}

  



function applyColors(colors) {
  state.colors = colors;
  
  // Apply pitch color
  if (elements.pitch) {
    elements.pitch.style.background = colors.pitch;
  }
  
  // Update players (re-render handles this)
  if (state.players.length > 0) {
    renderLineup();
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

function wireInputHandlers() {
  // Player properties
  bindNumberInput(elements.numberInput, (newNumber) => {
    const primary = getPrimaryPlayer();
    if (primary && !isMultipleSelection()) {
      primary.number = newNumber;
      
      // Only update DOM if player has numberEl (lineup players)
      if (primary.numberEl) {
        updatePlayerNumber(primary.numberEl, newNumber);
      }
      
      renderSquadPanel();  // Update squad list
      renderBenchWithCallbacks();  // Update bench cards
    }
  });
  
  bindNameInput(elements.nameInput, (newName) => {
    const primary = getPrimaryPlayer();
    if (primary && !isMultipleSelection()) {
      // ✅ Check if this is a staff member
      if (primary.location === 'staff' && primary._actualStaff) {
        // Update actual staff member
        updateStaffMember(primary._actualStaff, { name: newName });
        primary.name = newName; // Sync proxy object too
        console.log(`✅ Updated staff name: ${newName}`);
      } else {
        // Regular player
        primary.name = newName;
        
        // Only update DOM if player has nameEl (lineup players)
        if (primary.nameEl) {
          updatePlayerName(primary.nameEl, newName);
        }
      }
      
      renderSquadPanel();  // Update squad list
      renderBenchWithCallbacks();  // Update bench cards
    }
  });
  
  bindRoleSelect(elements.roleSelect, (newRole) => {
    const selected = getSelectedPlayers();
    selected.forEach(p => {
      // ✅ Check if this is a staff member
      if (p.location === 'staff' && p._actualStaff) {
        // Update actual staff member
        updateStaffMember(p._actualStaff, { role: newRole });
        p.role = newRole; // Sync proxy object too
        console.log(`✅ Updated staff role: ${newRole}`);
      } else {
        // Regular player
        p.role = newRole;
        
        // Only update DOM if player has roleEl (lineup players)
        if (p.roleEl) {
          updatePlayerRole(p.roleEl, newRole);
        }
      }
    });
    
    renderSquadPanel();  // Update squad list
    renderBenchWithCallbacks();  // Update bench cards
  });
  
  bindCardSelect(elements.cardSelect, (cardType) => {
    const selected = getSelectedPlayers();
    setCardMulti(selected, cardType);
    
    // Only update DOM for lineup players (bench will be re-rendered)
    selected.forEach(p => {
      if (p.el) {
        updateCardIndicator(p.el, p.card);
      }
    });
    
    renderSquadPanel();  // 🆕 Update squad list
    renderBenchWithCallbacks();  // 🆕 Update bench cards
  });
  
  // Formation
  bindPlayerCountSelect(elements.playerCountSelect, (newCount) => {
    state.playerCount = newCount;
    updateFormationDropdown();
    state.formation = elements.formationSelect.value;
    loadFormation(state.playerCount, state.formation, state.isFlipped);
  });
  
  bindFormationSelect(elements.formationSelect, (newFormation) => {
    state.formation = newFormation;
    loadFormation(state.playerCount, state.formation, state.isFlipped);
  });
  
  bindFlipToggle(elements.flipCheckbox, (isChecked) => {
    // 🆕 SAVE positions before flip
    const positionMap = new Map();
    state.players.forEach(p => {
      if (p.x !== undefined && p.y !== undefined) {
        positionMap.set(p.number, { x: p.x, y: p.y });
      }
    });
    
    const result = toggleFlip(state.players, state.isFlipped);
    state.isFlipped = result.isFlipped;
    
    // 🆕 RESTORE positions after flip (but flipped!)
    let restoredCount = 0;
    state.players.forEach(p => {
      if (positionMap.has(p.number)) {
        const saved = positionMap.get(p.number);
        // Flip Y position (vertical flip)
        p.x = saved.x;
        p.y = 100 - saved.y; // Flip vertically
        restoredCount++;
      }
    });
    
    console.log('🔄 Flip: Restored', restoredCount, 'custom positions');
    
    renderLineup();
  });
  
  // Colors
  bindPitchColorInput(elements.pitchColorInput, (color) => {
    state.colors.pitch = color;
    elements.pitch.style.background = color;
  });
  
  bindPlayerColorInput(elements.playerColorInput, (color) => {
    state.colors.player = color;
    state.players.forEach(p => {
      if (p.role !== 'GK' && !p.customColor && p.el) {
        updatePlayerColor(p.el, color);
      }
    });
  });
  
  bindGKColorInput(elements.gkColorInput, (color) => {
    state.colors.gk = color;
    state.players.forEach(p => {
      if (p.role === 'GK' && !p.customColor && p.el) {
        updatePlayerColor(p.el, color);
      }
    });
  });
  
  bindBorderColorInput(elements.borderColorInput, (color) => {
    state.colors.border = color;
    // Update borders (re-render handles this)
    renderLineup();
  });
  
  bindArrowColorInput(elements.arrowColorInput, (color) => {
    state.colors.arrow = color;
    state.players.forEach(p => {
      if (p.directions && p.el) {
        updateDirectionArrows(p.el, p.directions, color);
      }
    });
  });
  
  // Custom color
  bindCustomColorCheckbox(elements.customColorCheckbox, (isEnabled) => {
    const selected = getSelectedPlayers();
    if (isEnabled) {
      const color = elements.customPlayerColorInput.value;
      setCustomColorMulti(selected, color);
      elements.customPlayerColorInput.disabled = false;
    } else {
      removeCustomColorMulti(selected);
      elements.customPlayerColorInput.disabled = true;
    }
    renderLineup();
  });
  
  bindCustomPlayerColorInput(elements.customPlayerColorInput, (color) => {
    const selected = getSelectedPlayers();
    if (elements.customColorCheckbox.checked) {
      setCustomColorMulti(selected, color);
      selected.forEach(p => {
        if (p.el) updatePlayerColor(p.el, color);
      });
    }
  });
  
  // Theme
  bindThemeSelect(elements.themeSelect, (themeName) => {
    if (themeName) {
      const theme = getTheme(themeName);
      if (theme) {
        state.colors = { ...theme };
        
        // Update color inputs
        elements.pitchColorInput.value = theme.pitch;
        elements.playerColorInput.value = theme.player;
        elements.gkColorInput.value = theme.gk;
        elements.borderColorInput.value = theme.border;
        elements.arrowColorInput.value = theme.arrow;
        
        applyColors(state.colors);
      }
    }
  });
  
  // Toggles
  bindNamesToggle(elements.toggleNames, () => renderLineup());
  bindPositionsToggle(elements.togglePositions, () => renderLineup());
  bindNumbersToggle(elements.toggleNumbers, () => renderLineup());
  bindAvatarsToggle(elements.toggleAvatars, () => renderLineup());
  
  // Avatar
bindAvatarInput(elements.avatarInput, async (file) => {
  const selected = getSelectedPlayers();
  if (!selected.length) return;
  
  try {
    // 1. Load original image
    const originalBase64 = await loadImageAsBase64(file);
    
    // 2. Show crop modal (full size for quality)
    const cropped = await showAvatarCropModal(originalBase64);
    
    // 3. If user cancelled, do nothing
    if (!cropped) {
      console.log('Avatar crop cancelled');
      return;
    }
    
    // 4. Resize cropped avatar to 200×200 (optimize)
    const resized = await resizeCroppedAvatar(cropped, 200);
    
    // 5. Apply resized avatar
    selected.forEach(p => {
      // ✅ Check if this is a staff member
      if (p.location === 'staff' && p._actualStaff) {
        // Update actual staff member
        p._actualStaff.avatar = resized;
        console.log(`✅ Updated staff avatar: ${p._actualStaff.name}`);
      } else {
        // Regular player
        p.avatar = resized;
      }
    });
    
    // Update preview
    elements.avatarPreview.src = resized;
    elements.avatarPreview.style.display = 'block';
    elements.avatarPlaceholder.style.display = 'none';
    
    renderLineup();
    renderSquadPanel();
    renderBenchWithCallbacks();
  } catch (error) {
    console.error('Avatar upload error:', error);
    alert('Failed to load image');
  }
});
}  // ✅ Close wireInputHandlers

// Helper: Resize cropped avatar
async function resizeCroppedAvatar(base64, targetSize) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = targetSize;
      canvas.height = targetSize;
      
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64;
  });
}

function wireButtonHandlers() {
  // Reset buttons
  bindResetPositionButton(elements.resetPositionBtn, () => {
    const formationData = getFormationData(state.playerCount, state.formation);
    state.players.forEach((p, i) => {
      p.x = formationData[i].x;
      p.y = formationData[i].y;
      p.role = formationData[i].role;
    });
    
    if (state.isFlipped) {
  // Chỉ flip position, KHÔNG flip directions
  state.players.forEach(p => {
    const dx = p.x - 50;
    const dy = p.y - 50;
    p.x = 50 - dx;
    p.y = 50 - dy;
  });
}

    
    renderLineup();
  });
  
  // 🆕 Reset position for selected players only
  bindResetPositionButton(elements.resetPositionSelectedBtn, () => {
    const selected = getSelectedPlayers();
    if (!selected.length) return;
    
    const formationData = getFormationData(state.playerCount, state.formation);
    
    selected.forEach(p => {
      // Use player's slotIndex (for lineup players)
      if (p.location === 'lineup' && p.slotIndex !== undefined && p.slotIndex !== null) {
        p.x = formationData[p.slotIndex].x;
        p.y = formationData[p.slotIndex].y;
        
        // Apply flip if needed
        if (state.isFlipped) {
          const dx = p.x - 50;
          const dy = p.y - 50;
          p.x = 50 - dx;
          p.y = 50 - dy;
        }
      }
    });
    
    renderLineup();
  });
  
  bindResetCurrentButton(elements.resetCurrentBtn, () => {
    const selected = getSelectedPlayers();
    if (!selected.length) return;
    
    const formationData = getFormationData(state.playerCount, state.formation);
    
    selected.forEach(p => {
      // Clear customizations for ALL selected players (lineup + bench)
      clearAllCustomizations(p);
      
      // ✅ Clear directions and update panel
      p.directions = {};
      if (p.el) {
        // Clear direction arrows from DOM
        const arrows = p.el.querySelectorAll('.direction-arrow');
        arrows.forEach(arrow => arrow.remove());
      }
      
      if (p.location === 'lineup' && p.slotIndex !== undefined && p.slotIndex !== null) {
        // Reset lineup player to formation position
        p.x = formationData[p.slotIndex].x;
        p.y = formationData[p.slotIndex].y;
        p.role = formationData[p.slotIndex].role;
        p.name = `Player ${p.slotIndex + 1}`;
        p.number = p.slotIndex + 1;
        
        if (state.isFlipped) {
          const centerX = 50, centerY = 50;
          const dx = p.x - centerX, dy = p.y - centerY;
          p.x = centerX - dx;
          p.y = centerY - dy;
        }
      } else if (p.location === 'bench') {
        // ✅ Reset bench player
        p.name = `Player ${p.number}`;
        p.role = 'SUB';
        p.x = 50;
        p.y = 50;
      }
    });
    
    renderLineup();
    renderSquadPanel();
    renderBenchWithCallbacks();
    syncPanel();  // ✅ Update direction buttons in panel
  });
  
  bindResetAllButton(elements.resetAllBtn, () => {
    const formationData = getFormationData(state.playerCount, state.formation);
    
    // Reset lineup players
    state.lineup.forEach((p, i) => {
      clearAllCustomizations(p);
      p.directions = {};
      
      p.x = formationData[i].x;
      p.y = formationData[i].y;
      p.role = formationData[i].role;
      p.name = `Player ${i + 1}`;
      p.number = i + 1;
    });
    
    // ✅ Reset bench players
    state.bench.forEach(p => {
      clearAllCustomizations(p);
      p.directions = {};
      p.name = `Player ${p.number}`;
      p.role = 'SUB';
      p.x = 50;
      p.y = 50;
    });
    
    if (state.isFlipped) {
      flipLineupStandard(state.lineup);
    }
    
    // Reset UI
    elements.customColorCheckbox.checked = false;
    elements.customPlayerColorInput.disabled = true;
    elements.avatarPreview.style.display = 'none';
    elements.avatarPlaceholder.style.display = 'block';
    
    renderLineup();
    renderSquadPanel();
    renderBenchWithCallbacks();
    syncPanel();
  }, {
    requireConfirmation: true,
    confirmMessage: 'Reset all players (lineup + bench) to defaults?'
  });
  
  bindResetColorButton(elements.resetColorBtn, () => {
    const classic = getTheme('classic');
    state.colors = { ...classic };
    
    elements.pitchColorInput.value = classic.pitch;
    elements.playerColorInput.value = classic.player;
    elements.gkColorInput.value = classic.gk;
    elements.borderColorInput.value = classic.border;
    elements.arrowColorInput.value = classic.arrow;
    elements.themeSelect.value = 'classic';
    
    applyColors(state.colors);
  });
  
  // Avatar buttons
  bindUploadAvatarButton(elements.uploadAvatarBtn, elements.avatarInput);
  
  bindDeleteAvatarButton(elements.deleteAvatarBtn, () => {
    const selected = getSelectedPlayers();
    
    // ✅ Handle staff avatar deletion
    selected.forEach(p => {
      if (p.location === 'staff' && p._actualStaff) {
        p._actualStaff.avatar = null;
      } else {
        p.avatar = null;
      }
    });
    
    elements.avatarPreview.style.display = 'none';
    elements.avatarPlaceholder.style.display = 'block';
    
    renderLineup();
    renderSquadPanel();
    renderBenchWithCallbacks();
  });
  
  // ============================================
  // TEAM INFO HANDLERS
  // ============================================
  
  // Team name input
  if (elements.teamNameInput) {
    elements.teamNameInput.addEventListener('input', (e) => {
      state.team.name = e.target.value;
      updateTeamHeader(elements.teamHeader, state.team);
    });
  }
  
  // Team logo upload
  if (elements.uploadTeamLogoBtn && elements.teamLogoInput) {
    elements.uploadTeamLogoBtn.addEventListener('click', () => {
      elements.teamLogoInput.click();
    });
    
    elements.teamLogoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        // ✅ Load and resize directly (no crop)
        const originalBase64 = await loadImageAsBase64(file);
        
        // Resize to max width 200px (preserving aspect ratio)
        const resized = await resizeLogoPreserveRatio(originalBase64, 200);
        
        // Update state and UI
        state.team.logo = resized;
        updateTeamLogoPreview(
          elements.teamLogoPreview, 
          resized, 
          elements.teamLogoPlaceholder
        );
        
        // Update pitch display
        updateTeamHeader(elements.teamHeader, state.team);
        
        console.log('✅ Team logo uploaded');
      } catch (error) {
        console.error('Team logo upload error:', error);
        alert('Failed to upload logo');
      }
      
      e.target.value = '';
    });
  }
  
  // Team logo delete
  if (elements.deleteTeamLogoBtn) {
    elements.deleteTeamLogoBtn.addEventListener('click', () => {
      state.team.logo = null;
      
      // Update preview (null will show placeholder)
      updateTeamLogoPreview(
        elements.teamLogoPreview,
        null,
        elements.teamLogoPlaceholder
      );
      
      // Update pitch display
      updateTeamHeader(elements.teamHeader, state.team);
      
      console.log('✅ Team logo deleted');
    });
  }
  
  // Show/hide team info toggle
  if (elements.showTeamInfoCheckbox) {
    elements.showTeamInfoCheckbox.addEventListener('change', (e) => {
      state.team.showOnPitch = e.target.checked;
      updateTeamHeader(elements.teamHeader, state.team);
      console.log('Team info visibility:', state.team.showOnPitch);
    });
  }
  
  // ============================================
  // SAVE/LOAD HANDLERS
  // ============================================
  
  // Save/Load buttons
  bindSaveLineupButton(elements.saveBtn, () => {
    quickDownload(
      state.squad,
      {
        formation: state.formation,
        playerCount: state.playerCount,
        isFlipped: state.isFlipped
      },
      state.colors,
      state.staff,
      state.team  // ✅ Save team info
    );
  });
  
  bindLoadLineupButton(elements.loadBtn, elements.loadInput);
  
  bindFileInput(elements.loadInput, async (file) => {
    try {
      const loadedState = await loadLineupFromFile(file);
      
      // ✅ Split squad into lineup and bench
      const squad = loadedState.squad || [];
      const lineup = squad.filter(p => p.location === 'lineup')
        .sort((a, b) => a.slotIndex - b.slotIndex);
      const bench = squad.filter(p => p.location === 'bench')
        .sort((a, b) => (a.benchIndex || 0) - (b.benchIndex || 0));
      
      const directionMap = extractDirectionKeys(squad);
      
      // Apply state
      state.squad = squad;
      state.lineup = lineup;
      state.bench = bench;
      state.players = lineup;  // Backward compatibility
      state.staff = loadedState.staff || [];
      state.team = loadedState.team || { name: '', logo: null, showOnPitch: true };  // ✅ Load team
      state.playerCount = loadedState.settings.playerCount;
      state.formation = loadedState.settings.formation;
      state.isFlipped = loadedState.settings.isFlipped;
      state.colors = loadedState.colors;
      
      // Update UI
      elements.playerCountSelect.value = state.playerCount;
      updateFormationDropdown();
      elements.formationSelect.value = state.formation;
      elements.flipCheckbox.checked = state.isFlipped;
      
      elements.pitchColorInput.value = state.colors.pitch;
      elements.playerColorInput.value = state.colors.player;
      elements.gkColorInput.value = state.colors.gk;
      elements.borderColorInput.value = state.colors.border;
      elements.arrowColorInput.value = state.colors.arrow;
      
      // ✅ Restore team info UI
      if (elements.teamNameInput) {
        elements.teamNameInput.value = state.team.name || '';
      }
      if (elements.showTeamInfoCheckbox) {
        elements.showTeamInfoCheckbox.checked = state.team.showOnPitch !== false;
      }
      if (state.team.logo) {
        updateTeamLogoPreview(
          elements.teamLogoPreview, 
          state.team.logo,
          elements.teamLogoPlaceholder
        );
      }
      updateTeamHeader(elements.teamHeader, state.team);
      
      // Detect theme
      const theme = detectThemeFromColors(state.colors);
      elements.themeSelect.value = theme;
      
      // Render
      applyColors(state.colors);
      renderLineup();  // Will render both lineup and bench
      renderSquadPanel();  // ✅ Update squad panel
      
      // Restore directions
      restoreDirectionKeys(lineup, directionMap);
      lineup.forEach(p => {
        if (p.directions && p.el) {
          updateDirectionArrows(p.el, p.directions, state.colors.arrow);
        }
      });
      
      cleanupDirectionStorage(state.players);
    } catch (error) {
      alert('Load failed: ' + error.message);
    }
  });
  
  // Export button
  bindExportImageButton(elements.exportBtn, async () => {
    const btn = elements.exportBtn;
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = '⏳ Exporting...';
    
    try {
      // ✅ Create temporary export wrapper with tight bounds
      const exportWrapper = document.createElement('div');
      exportWrapper.style.cssText = `
        display: inline-flex;
        gap: 60px;
        padding: 30px;
        background: #1a1a1a;
        align-items: flex-start;
        position: fixed;
        left: -9999px;
        top: 0;
      `;
      
      // Clone pitch
      const pitch = document.getElementById('pitch');
      const pitchClone = pitch.cloneNode(true);
      pitchClone.style.margin = '0';
      
      // Clone right column (logo + bench)
      const rightColumn = document.querySelector('.pitch-area');
      const rightClone = rightColumn.cloneNode(true);
      
      // ✅ Force right column styles for export
      rightClone.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        margin: 0;
      `;
      
      // ✅ Ensure bench container keeps grid layout
      const benchContainer = rightClone.querySelector('.bench-container');
      if (benchContainer) {
        benchContainer.style.width = '385px';
      }
      
      const benchZone = rightClone.querySelector('.bench-zone');
      if (benchZone) {
        benchZone.style.cssText = `
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px;
        `;
      }
      
      // Build export structure
      exportWrapper.appendChild(pitchClone);
      exportWrapper.appendChild(rightClone);
      document.body.appendChild(exportWrapper);
      
      // Export with tight bounds
      await exportAndDownloadPNG(
        exportWrapper,
        generateExportFilename(),
        {
          selectedElements: Array.from(document.querySelectorAll('.player.selected')),
          playerElements: Array.from(pitchClone.querySelectorAll('.player')),
          borderColor: state.colors.border,
          canvasOptions: {
            backgroundColor: '#1a1a1a',
            scale: 2  // High quality
          }
        }
      );
      
      // Cleanup
      document.body.removeChild(exportWrapper);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
  
  // Direction buttons
  if (elements.directionContainer) {
    bindDirectionButtons(elements.directionContainer, (directionKey, button) => {
      const selected = getSelectedPlayers();
      if (!selected.length) return;
      
      const newState = toggleDirectionMulti(selected, directionKey);
      
      button.classList.toggle('active', newState);
      
      selected.forEach(p => {
        if (p.el) {
          updateDirectionArrows(p.el, p.directions, state.colors.arrow);
        }
      });
    });
    
    // Reset directions button (center of grid)
    const resetDirectionsBtn = document.getElementById('resetDirections');
    if (resetDirectionsBtn) {
      resetDirectionsBtn.addEventListener('click', () => {
        const selected = getSelectedPlayers();
        if (!selected.length) return;
        
        // Clear all directions for selected players
        selected.forEach(p => {
          p.directions = {};
          if (p.el) {
            updateDirectionArrows(p.el, p.directions, state.colors.arrow);
          }
        });
        
        // Clear all active states from direction buttons
        const directionBtns = elements.directionContainer.querySelectorAll('button[data-dx]');
        directionBtns.forEach(btn => btn.classList.remove('active'));
      });
    }
  }
  
  // 🆕 Squad panel - Add Player button
  if (elements.addPlayerBtn) {
    elements.addPlayerBtn.addEventListener('click', handleAddPlayer);
  }
  
  // ✅ Squad panel - Add Staff button
  if (elements.addStaffBtn) {
    elements.addStaffBtn.addEventListener('click', handleAddStaff);
  }
  
  // ✅ Roster export button
  if (elements.exportRosterBtn) {
    elements.exportRosterBtn.addEventListener('click', async () => {
      const btn = elements.exportRosterBtn;
      const originalText = btn.textContent;
      
      btn.disabled = true;
      btn.textContent = '⏳ Exporting roster...';
      
      try {
        await exportRosterAsPNG(
          {
            team: state.team,
            staff: state.staff,
            squad: state.squad
          },
          exportAndDownloadPNG
        );
      } catch (error) {
        console.error('Roster export error:', error);
        alert('Failed to export roster');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }
}


function wirePlayerInteractions() {
  // Click on pitch to deselect (ONLY if not multi-selecting)
  elements.pitch.addEventListener('click', (e) => {
    if (e.target === elements.pitch) {
      const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
      
      // ✅ Only clear selection if NOT holding Ctrl/Cmd/Shift
      if (!isMultiSelect) {
        clearSelection();
        
        // Clear all selected classes
        state.players.forEach(p => {
          if (p.el) {
            p.el.classList.remove('selected');
          }
        });
        
        syncPanel();
      }
      // ✅ If holding Ctrl: do nothing, keep current selection
    }
  });
}

// ============================================
// PANEL SYNC
// ============================================

function handlePlayerClickEvent(player, event) {
  // Prevent event bubbling to pitch
  event.stopPropagation();
  
  const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
  console.log('🖱️ Click:', player.number, '| Multi:', isMultiSelect, '| Ctrl:', event.ctrlKey, '| Meta:', event.metaKey);
  
  // DEBUG: Before selection
  const beforeCount = getSelectedPlayers().length;
  console.log('📊 BEFORE selection:', beforeCount, 'players selected');
  
  handlePlayerClick(player, isMultiSelect);
  
  // DEBUG: After selection
  const afterSelected = getSelectedPlayers();
  console.log('📊 AFTER selection:', afterSelected.length, 'players selected');
  console.log('📋 Selected numbers:', afterSelected.map(p => p.number));
  
  // Update UI - add/remove selected class
  const selected = getSelectedPlayers();
  
  // Remove all selected classes first
  state.players.forEach(p => {
    if (p.el) {
      p.el.classList.remove('selected');
    }
  });
  
  // ✅ Clear bench highlights
  if (elements.bench) {
    const allBenchCards = elements.bench.querySelectorAll('.bench-player');
    allBenchCards.forEach(card => {
      card.style.borderColor = '#444';
      card.style.background = '#333';
    });
  }
  
  // Add selected class to currently selected players
  selected.forEach(p => {
    if (p.el) {
      console.log('✅ Adding .selected to player', p.number);
      p.el.classList.add('selected');
    } else {
      console.log('❌ Player', p.number, 'has no .el property!');
    }
  });
  
  // DEBUG: Verify DOM
  const domSelectedCount = document.querySelectorAll('.player.selected').length;
  console.log('🎨 DOM: Found', domSelectedCount, 'elements with .selected class');
  
  syncPanel();
}

function syncPanel() {
  const selectionState = getSelectionState();
  const hasSelection = selectionState.selectedCount > 0;
  
  // Use getSelectedPlayers as fallback (more reliable)
  const hasSelectionFixed = getSelectedPlayers().length > 0;
  
  // Add/remove no-selection class from player panel
  const playerPanel = document.querySelector('.player-panel');
  if (playerPanel) {
    if (hasSelectionFixed) {
      playerPanel.classList.remove('no-selection');
    } else {
      playerPanel.classList.add('no-selection');
    }
  }
  
  // Basic controls - always handle these
  if (elements.numberInput) elements.numberInput.disabled = !hasSelectionFixed;
  if (elements.nameInput) elements.nameInput.disabled = !hasSelectionFixed;
  if (elements.roleSelect) elements.roleSelect.disabled = !hasSelectionFixed;
  if (elements.cardSelect) elements.cardSelect.disabled = !hasSelectionFixed;
  if (elements.uploadAvatarBtn) elements.uploadAvatarBtn.disabled = !hasSelectionFixed;
  if (elements.deleteAvatarBtn) elements.deleteAvatarBtn.disabled = !hasSelectionFixed;
  
  // These buttons are NOT in panel.js - handle manually
  if (elements.resetPositionSelectedBtn) {
    elements.resetPositionSelectedBtn.disabled = !hasSelectionFixed;
  }
  if (elements.resetCurrentBtn) {
    elements.resetCurrentBtn.disabled = !hasSelectionFixed;
  }
  
  const panelElements = getPanelElements({
    numberInput: elements.numberInput,
    nameInput: elements.nameInput,
    roleSelect: elements.roleSelect,
    cardSelect: elements.cardSelect,
    avatarPreview: elements.avatarPreview,
    avatarPlaceholder: elements.avatarPlaceholder,
    uploadButton: elements.uploadAvatarBtn,
    deleteButton: elements.deleteAvatarBtn,
    colorCheckbox: elements.customColorCheckbox,
    colorInput: elements.customPlayerColorInput,
    directionButtons: elements.directionContainer ? 
      Array.from(elements.directionContainer.querySelectorAll('button')) : null
  });
  
  // Let panel.js handle colorCheckbox and directionButtons
  syncControlPanel(
    panelElements,
    selectionState,
    getDefaultColors({
      player: elements.playerColorInput,
      gk: elements.gkColorInput
    })
  );
  
  // ✅ AFTER syncControlPanel - populate role select based on selection type
  const primary = getPrimaryPlayer();
  if (primary && elements.roleSelect) {
    if (primary.location === 'staff') {
      // Staff selected - populate STAFF_ROLES
      elements.roleSelect.innerHTML = '';
      STAFF_ROLES.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        if (role === primary.role) option.selected = true;
        elements.roleSelect.appendChild(option);
      });

    } else {
      // Player selected - populate COMPLETE PLAYER_ROLES
      const playerRoles = [
        'GK',      // Goalkeeper
        'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB',  // Defenders
        'CDM',     // Defensive Midfield
        'LCM', 'CM', 'RCM',  // Central Midfield
        'LAM', 'CAM', 'RAM',  // Attacking Midfield
        'LM', 'RM',  // Wide Midfield
        'LW', 'RW',  // Wingers
        'CF', 'ST'   // Forwards
      ];
      
      elements.roleSelect.innerHTML = '';
      playerRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        if (role === primary.role) option.selected = true;
        elements.roleSelect.appendChild(option);
      });
    }
    
    // 🔧 Load values into inputs (AFTER role select is populated)
    if (elements.numberInput) elements.numberInput.value = primary.number || '';
    if (elements.nameInput) elements.nameInput.value = primary.name || '';
    if (elements.roleSelect) elements.roleSelect.value = primary.role || 'ST';
    
    // 🔧 Load avatar preview
    if (elements.avatarPreview && elements.avatarPlaceholder) {
      if (primary.avatar) {
        elements.avatarPreview.src = primary.avatar;
        elements.avatarPreview.style.display = 'block';
        elements.avatarPlaceholder.style.display = 'none';
      } else {
        elements.avatarPreview.style.display = 'none';
        elements.avatarPlaceholder.style.display = 'block';
      }
    }
  }
}

// Helper for missing bindFileInput
function bindFileInput(input, onChange) {
  if (!input) return;
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
    e.target.value = '';
  });
}

// ============================================
// SQUAD PANEL FUNCTIONS
// ============================================

function setupTabs() {
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Update buttons
      elements.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update content
      elements.tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Render squad list when switching to Squad tab
      if (targetTab === 'squad') {
        renderSquadPanel();
      }
    });
  });
}

function renderSquadPanel() {
  if (!elements.squadList) return;
  
  // Render squad list with staff
  renderSquadList(elements.squadList, state.squad, state.staff, {
    onPlayerClick: (player, item) => {
      console.log('Squad player clicked:', player.name);
      
      // Select player
      clearSelection();
      selectPlayer(player);
      
      // Clear bench highlights
      const allBenchCards = elements.bench.querySelectorAll('.bench-player');
      allBenchCards.forEach(c => {
        c.style.borderColor = '#444';
        c.style.background = '#333';
      });
      
      // Clear lineup highlights
      state.lineup.forEach(p => {
        if (p.el) p.el.classList.remove('selected');
      });
      
      // Highlight in squad list
      highlightSquadPlayer(elements.squadList, player);
      
      // Sync panel
      syncPanel();
    },
    
    onPlayerDelete: (player) => {
      // Remove from squad
      const success = removePlayerFromSquad(state.squad, player);
      
      if (success) {
        // Update state arrays
        state.lineup = state.squad.filter(p => p.location === 'lineup')
          .sort((a, b) => a.slotIndex - b.slotIndex);
        state.bench = state.squad.filter(p => p.location === 'bench');
        state.players = state.lineup;
        
        console.log(`✅ Deleted ${player.name}`);
        
        // Re-render
        renderLineup();
        renderSquadPanel();
      } else {
        alert('Cannot delete lineup players. Move to bench first.');
      }
    },
    
    // ✅ Staff handlers
    onStaffClick: (member) => {
      handleStaffClick(member);
    },
    
    onStaffDelete: (member) => {
      handleStaffDelete(member);
    },
    
    onAddStaff: () => {
      handleAddStaff();
    }
  });
  
  // Update stats
  updateSquadStats(elements.squadStats, state.squad, state.staff);
}

function handleAddPlayer() {
  const playerData = showAddPlayerDialog();
  
  if (playerData) {
    // Add to squad (goes to bench by default)
    const newPlayer = addPlayerToSquad(state.squad, playerData);
    
    // Update state arrays
    state.bench = state.squad.filter(p => p.location === 'bench');
    
    console.log(`✅ Added ${newPlayer.name} to bench`);
    
    // Re-render
    renderLineup();
    renderSquadPanel();
  }
}

// ============================================
// STAFF MANAGEMENT
// ============================================

function handleAddStaff() {
  if (state.staff.length >= MAX_STAFF) {
    alert(`Maximum ${MAX_STAFF} staff members allowed`);
    return;
  }
  
  const name = prompt('Tên thành viên BHL:');
  if (!name || name.trim() === '') return;
  
  // Show role selection
  let roleOptions = 'Chọn vai trò:\n';
  STAFF_ROLES.forEach((role, index) => {
    roleOptions += `${index + 1}. ${role}\n`;
  });
  
  const roleChoice = prompt(roleOptions + '\nNhập số (1-' + STAFF_ROLES.length + '):');
  const roleIndex = parseInt(roleChoice) - 1;
  
  const role = (roleIndex >= 0 && roleIndex < STAFF_ROLES.length) 
    ? STAFF_ROLES[roleIndex] 
    : STAFF_ROLES[0];
  
  try {
    const newMember = addStaffMember(state.staff, {
      name: name.trim(),
      role: role
    });
    
    console.log(`✅ Added staff: ${newMember.name} (${newMember.role})`);
    
    // Re-render
    renderSquadPanel();
  } catch (error) {
    alert(error.message);
  }
}

function handleStaffClick(member) {
  console.log('Staff clicked:', member.name);
  
  // ✅ Select staff member (treat like player for editing)
  clearSelection();
  
  // Create a temporary "player-like" object for staff
  const staffAsPlayer = {
    ...member,
    number: 0,  // Staff don't have numbers
    role: member.role,
    location: 'staff',  // Mark as staff
    el: null  // No DOM element
  };
  
  selectPlayer(staffAsPlayer);
  
  // Store reference to actual staff member for updates
  staffAsPlayer._actualStaff = member;
  
  // Clear lineup/bench highlights
  state.lineup.forEach(p => {
    if (p.el) p.el.classList.remove('selected');
  });
  
  const allBenchCards = elements.bench?.querySelectorAll('.bench-player');
  allBenchCards?.forEach(c => {
    c.style.borderColor = '#444';
    c.style.background = '#333';
  });
  
  // Highlight staff in squad list
  highlightSquadPlayer(elements.squadList, staffAsPlayer);
  
  // Sync panel (will show staff info)
  syncPanel();
}

function handleStaffDelete(member) {
  const success = removeStaffMember(state.staff, member);
  
  if (success) {
    console.log(`✅ Deleted staff: ${member.name}`);
    renderSquadPanel();
  } else {
    alert('Failed to delete staff member');
  }
}

function setupSquadSearch() {
  if (elements.squadSearch) {
    let searchCallbacks = null;
    
    elements.squadSearch.addEventListener('input', (e) => {
      const searchText = e.target.value;
      
      // Cache callbacks on first use
      if (!searchCallbacks) {
        searchCallbacks = {
          onPlayerClick: renderSquadPanel.onPlayerClick,
          onPlayerDelete: renderSquadPanel.onPlayerDelete
        };
      }
      
      // Re-render squad list with current callbacks
      renderSquadList(elements.squadList, state.squad, state.staff, {  // ✅ Add staff
        searchFilter: searchText,
        onPlayerClick: (player, item) => {
          clearSelection();
          selectPlayer(player);
          highlightSquadPlayer(elements.squadList, player);
          syncPanel();
        },
        onPlayerDelete: (player) => {
          const success = removePlayerFromSquad(state.squad, player);
          if (success) {
            state.lineup = state.squad.filter(p => p.location === 'lineup')
              .sort((a, b) => a.slotIndex - b.slotIndex);
            state.bench = state.squad.filter(p => p.location === 'bench');
            state.players = state.lineup;
            renderLineup();
            renderSquadPanel();
          } else {
            alert('Cannot delete lineup players.');
          }
        },
        // ✅ Add staff handlers
        onStaffClick: (member) => {
          handleStaffClick(member);
        },
        onStaffDelete: (member) => {
          handleStaffDelete(member);
        }
      });
      
      updateSquadStats(elements.squadStats, state.squad, state.staff);
    });
  }
}

// ============================================
// START APPLICATION
// ============================================

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
