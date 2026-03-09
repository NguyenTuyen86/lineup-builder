/**
 * Mobile Responsive Module
 * Handles mobile-specific UI and interactions
 * Only active on screens < 1024px
 */

console.log('📱 Mobile module loaded - v2.0 CLEAN');

// Guard flags to prevent duplicate setup
let _mobileControlsInitialized = false;
let _mobileTouchHandlersInitialized = false;

export function initMobileUI() {
  const isMobile = window.innerWidth < 1024;
  
  console.log('📱 initMobileUI called');
  console.log('  - Window width:', window.innerWidth);
  console.log('  - Is mobile:', isMobile);
  
  if (!isMobile) {
    console.log('  - Skipping mobile UI (desktop)');
    return; // Skip on desktop
  }
  
  console.log('📱 Initializing mobile UI');
  
  // Performance: Use requestIdleCallback for non-critical setup
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      setupNonCriticalFeatures();
    });
  }
  
  // Critical path
  console.log('  - Showing mobile elements...');
  showMobileElements();
  
  console.log('  - Setting up tabs...');
  setupMobileTabs();
  
  console.log('  - Setting up controls...');
  setupMobileControls();
  
  console.log('  - Setting up FABs...');
  setupMobileFABs();
  
  console.log('  - Setting up bottom sheet...');
  setupBottomSheet();
  
  console.log('  - Setting up responsive handlers...');
  setupResponsiveHandlers();
  
  // Log mobile mode
  console.log('✅ Mobile UI ready');
  
  // Debug: Check if elements are visible
  setTimeout(() => {
    const header = document.querySelector('.mobile-header');
    const fabs = document.querySelector('.mobile-fab-container');
    const controls = document.querySelector('.mobile-formation-controls');
    
    console.log('📱 Mobile elements visibility check:');
    console.log('  - Header:', header?.style.display, header ? 'EXISTS' : 'MISSING');
    console.log('  - FABs:', fabs?.style.display, fabs ? 'EXISTS' : 'MISSING');
    console.log('  - Controls:', controls?.style.display, controls ? 'EXISTS' : 'MISSING');
  }, 500);
}

/**
 * Setup non-critical features
 */
function setupNonCriticalFeatures() {
  // Show tips for first-time users
  showFirstTimeTips();
  
  console.log('✅ Non-critical features loaded');
}

/**
 * Show tips for first-time mobile users
 */
function showFirstTimeTips() {
  const hasSeenTips = localStorage.getItem('lineupBuilder_seenMobileTips');
  
  if (hasSeenTips) return;
  
  // Show welcome tips after 1 second
  setTimeout(() => {
    const tips = [
      '👆 Tap a player to edit',
      '↔️ Swipe bench to see more players',
      '🔄 Change formation at the top',
      '💾 Save/Export with buttons at bottom-right'
    ];
    
    let currentTip = 0;
    
    function showNextTip() {
      if (currentTip >= tips.length) {
        localStorage.setItem('lineupBuilder_seenMobileTips', 'true');
        return;
      }
      
      showToast(tips[currentTip], 'info');
      currentTip++;
      
      // Show next tip after 4s
      setTimeout(showNextTip, 4000);
    }
    
    showNextTip();
  }, 1000);
}

/**
 * Show mobile-only elements
 */
function showMobileElements() {
  const mobileHeader = document.querySelector('.mobile-header');
  const mobileFABs = document.querySelector('.mobile-fab-container');
  const mobileFormation = document.querySelector('.mobile-formation-controls');
  const mobileToggles = document.querySelector('.mobile-toggle-group');
  
  console.log('  📱 showMobileElements:');
  console.log('    - Header element:', mobileHeader ? 'FOUND' : 'NOT FOUND');
  console.log('    - FABs element:', mobileFABs ? 'FOUND' : 'NOT FOUND');
  console.log('    - Formation element:', mobileFormation ? 'FOUND' : 'NOT FOUND');
  console.log('    - Toggles element:', mobileToggles ? 'FOUND' : 'NOT FOUND');
  
  if (mobileHeader) {
    mobileHeader.style.display = 'flex';
    console.log('    ✅ Header display set to flex');
  }
  
  if (mobileFABs) {
    mobileFABs.style.display = 'flex';
    console.log('    ✅ FABs display set to flex');
  }
  
  if (mobileFormation) {
    mobileFormation.style.display = 'flex';
    console.log('    ✅ Formation display set to flex');
  }
  
  if (mobileToggles) {
    mobileToggles.style.display = 'flex';
    console.log('    ✅ Toggles display set to flex');
  }
}

/**
 * Update formation options based on player count
 */
function updateFormationOptions(playerCount, formationSelect) {
  if (!formationSelect) return;
  
  const formations = {
    11: ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2', '4-5-1', '5-4-1'],
    7: ['3-2-1', '2-3-1', '3-1-2', '2-2-2', '1-3-2'],
    5: ['2-2', '2-1-1', '1-2-1', '1-1-2']
  };
  
  const options = formations[playerCount] || formations[11];
  
  // Clear existing options
  formationSelect.innerHTML = '';
  
  // Add new options
  options.forEach(formation => {
    const option = document.createElement('option');
    option.value = formation;
    option.textContent = formation;
    formationSelect.appendChild(option);
  });
  
  // Select first option
  formationSelect.value = options[0];
}

/**
 * Setup mobile formation and display controls
 */
function setupMobileControls() {
  // Prevent duplicate setup
  if (_mobileControlsInitialized) {
    console.log('⚠️ Mobile controls already initialized, skipping');
    return;
  }
  
  console.log('🎮 Setting up mobile controls (first time only)');
  _mobileControlsInitialized = true;
  
  // Get desktop controls
  const desktopCount = document.getElementById('count');
  const desktopFormation = document.getElementById('formation');
  const desktopFlip = document.getElementById('flipFormation');
  
  // Mobile controls
  const mobileCountSelect = document.getElementById('mobilePlayerCount');
  const mobileFormationSelect = document.getElementById('mobileFormationSelect');
  const mobileFlipBtn = document.getElementById('mobileFlipBtn');
  
  // Sync mobile with desktop initial values
  if (mobileCountSelect && desktopCount) {
    mobileCountSelect.value = desktopCount.value;
    
    // Update mobile formations for current count
    if (mobileFormationSelect) {
      updateFormationOptions(parseInt(desktopCount.value), mobileFormationSelect);
    }
  }
  
  if (mobileFormationSelect && desktopFormation) {
    mobileFormationSelect.value = desktopFormation.value;
  }
  
  // Player count change - ONLY trigger on user interaction
  if (mobileCountSelect && desktopCount) {
    let isFirstChange = true; // Flag to skip first trigger
    
    mobileCountSelect.addEventListener('change', () => {
      const newCount = parseInt(mobileCountSelect.value);
      
      console.log('📊 Player count changed to:', newCount);
      
      // Update desktop
      desktopCount.value = newCount.toString();
      desktopCount.dispatchEvent(new Event('change'));
      
      // Update mobile formations
      updateFormationOptions(newCount, mobileFormationSelect);
      
      // Trigger formation change with first option
      if (mobileFormationSelect && desktopFormation) {
        desktopFormation.value = mobileFormationSelect.value;
        desktopFormation.dispatchEvent(new Event('change'));
      }
      
      // Haptic
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      showToast(`Changed to ${newCount} players`, 'success');
    });
  }
  
  // Formation change
  if (mobileFormationSelect && desktopFormation) {
    mobileFormationSelect.addEventListener('change', () => {
      // Update desktop
      desktopFormation.value = mobileFormationSelect.value;
      desktopFormation.dispatchEvent(new Event('change'));
      
      // Haptic
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      showToast(`Formation: ${mobileFormationSelect.value}`, 'success');
    });
  }
  
  // Flip button
  if (mobileFlipBtn && desktopFlip) {
    mobileFlipBtn.addEventListener('click', () => {
      desktopFlip.checked = !desktopFlip.checked;
      desktopFlip.dispatchEvent(new Event('change'));
      
      // Haptic
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      showToast('Formation flipped', 'success');
    });
  }
  
  // Flip button
  const flipBtn = document.getElementById('mobileFlipBtn');
  const desktopFlipBtn = document.getElementById('flipFormation');
  
  if (flipBtn && desktopFlipBtn) {
    flipBtn.addEventListener('click', () => {
      desktopFlipBtn.click();
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      showToast('Formation flipped', 'success');
    });
  }
  
  // Toggle buttons (numbers, names, roles)
  const toggleBtns = document.querySelectorAll('.mobile-toggle-btn');
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const toggle = btn.dataset.toggle;
      btn.classList.toggle('active');
      
      // Trigger desktop checkbox
      let desktopCheckbox;
      if (toggle === 'numbers') {
        desktopCheckbox = document.getElementById('toggleNumbers');
      } else if (toggle === 'names') {
        desktopCheckbox = document.getElementById('toggleNames');
      } else if (toggle === 'roles') {
        desktopCheckbox = document.getElementById('toggleRoles');
      }
      
      if (desktopCheckbox) {
        desktopCheckbox.checked = btn.classList.contains('active');
        desktopCheckbox.dispatchEvent(new Event('change'));
      }
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    });
  });
}

/**
 * Get required players for formation
 */
function getRequiredPlayersForFormation(formation) {
  const formations = {
    '4-4-2': 11,
    '4-3-3': 11,
    '3-5-2': 11,
    '4-2-3-1': 11,
    '3-4-3': 11,
    '5-3-2': 11,
    '4-5-1': 11,
    '5-4-1': 11
  };
  return formations[formation] || 11;
}

/**
 * Setup mobile tab navigation
 */
function setupMobileTabs() {
  const tabs = document.querySelectorAll('.mobile-tab');
  const mainContent = document.querySelector('.main-content');
  const sidebar = document.querySelector('.sidebar');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.mobileTab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      // Show appropriate content
      if (tabName === 'formation') {
        // Show pitch and bench
        mainContent.style.display = 'flex';
        if (sidebar) {
          sidebar.style.display = 'none';
        }
      } else if (tabName === 'squad') {
        // Show squad management
        mainContent.style.display = 'none';
        if (sidebar) {
          sidebar.style.display = 'block';
          
          // Optimize sidebar for mobile
          sidebar.style.width = '100%';
          sidebar.style.height = 'auto';
          sidebar.style.position = 'relative';
          sidebar.style.overflow = 'visible';
          
          // Show squad tab
          const squadTabBtn = document.querySelector('.tab-btn[data-tab="squad"]');
          if (squadTabBtn && !squadTabBtn.classList.contains('active')) {
            squadTabBtn.click();
          }
          
          // Hide tab navigation in sidebar on mobile
          const tabNav = sidebar.querySelector('.tab-nav');
          if (tabNav) {
            tabNav.style.display = 'none';
          }
        }
      }
    });
  });
  
  // Initial state - show formation
  if (mainContent) {
    mainContent.style.display = 'flex';
  }
}

/**
 * Setup floating action buttons
 */
function setupMobileFABs() {
  const saveBtn = document.getElementById('mobileSaveBtn');
  const exportBtn = document.getElementById('mobileExportBtn');
  
  // Save button - trigger desktop save
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.classList.add('loading');
      saveBtn.disabled = true;
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      try {
        const desktopSaveBtn = document.getElementById('saveLineup');
        if (desktopSaveBtn) {
          desktopSaveBtn.click();
        }
        
        setTimeout(() => {
          saveBtn.classList.remove('loading');
          saveBtn.disabled = false;
          showToast('Lineup saved!', 'success');
        }, 1000);
      } catch (error) {
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
        showToast('Save failed', 'error');
      }
    });
  }
  
  // Export button - trigger desktop export
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      exportBtn.classList.add('loading');
      exportBtn.disabled = true;
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
      
      try {
        showToast('Generating image...', 'info');
        
        const desktopExportBtn = document.getElementById('exportBtn');
        if (desktopExportBtn) {
          desktopExportBtn.click();
        }
        
        // Longer timeout for export
        setTimeout(() => {
          exportBtn.classList.remove('loading');
          exportBtn.disabled = false;
          showToast('Image exported!', 'success');
        }, 2000);
      } catch (error) {
        exportBtn.classList.remove('loading');
        exportBtn.disabled = false;
        showToast('Export failed', 'error');
      }
    });
  }
}

/**
 * Setup bottom sheet for player editing
 */
function setupBottomSheet() {
  const sheet = document.getElementById('mobileEditSheet');
  const closeBtn = document.getElementById('mobileSheetClose');
  const sheetContent = document.getElementById('mobileSheetContent');
  const dragHandle = document.querySelector('.mobile-sheet-drag-handle');
  
  if (!sheet) return;
  
  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeBottomSheet();
    });
  }
  
  // Drag to close (simple version)
  let startY = 0;
  let isDragging = false;
  
  if (dragHandle) {
    dragHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    });
    
    dragHandle.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        sheet.style.transform = `translateY(${deltaY}px)`;
      }
    });
    
    dragHandle.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const deltaY = e.changedTouches[0].clientY - startY;
      
      if (deltaY > 100) {
        // Close if dragged down > 100px
        closeBottomSheet();
      } else {
        // Snap back
        sheet.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Click outside to close
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet) {
      closeBottomSheet();
    }
  });
}

/**
 * Open bottom sheet with player panel content
 */
export function openBottomSheet() {
  console.log('🚪 openBottomSheet called');
  
  const sheet = document.getElementById('mobileEditSheet');
  const sheetContent = document.getElementById('mobileSheetContent');
  const playerPanel = document.querySelector('.player-panel');
  
  console.log('  Sheet:', sheet ? 'FOUND' : 'NOT FOUND');
  console.log('  Content:', sheetContent ? 'FOUND' : 'NOT FOUND');
  console.log('  Player panel:', playerPanel ? 'FOUND' : 'NOT FOUND');
  
  if (!sheet || !sheetContent || !playerPanel) {
    console.error('❌ Missing elements, cannot open sheet');
    return;
  }
  
  console.log('📋 Cloning player panel...');
  
  // Clear previous content
  sheetContent.innerHTML = '';
  
  // Clone player panel content
  const panelClone = playerPanel.cloneNode(true);
  panelClone.style.display = 'block';
  panelClone.style.width = '100%';
  panelClone.style.position = 'relative';
  panelClone.style.right = 'auto';
  panelClone.style.top = 'auto';
  
  // Remove desktop-only features
  const moveGrid = panelClone.querySelector('.move-grid');
  if (moveGrid) moveGrid.remove();
  
  const customColorInput = panelClone.querySelector('#playerCustomColor');
  if (customColorInput) customColorInput.closest('div').remove();
  
  const customColorCheckbox = panelClone.querySelector('#useCustomColor');
  if (customColorCheckbox) customColorCheckbox.closest('div').remove();
  
  sheetContent.appendChild(panelClone);
  
  console.log('✅ Panel cloned, showing sheet...');
  
  // Show sheet
  sheet.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scroll
  
  console.log('🎯 Setting up event listeners...');
  
  // Setup event listeners for cloned inputs
  setupSheetEventListeners(panelClone);
  
  console.log('✅ Bottom sheet opened successfully');
}

/**
 * Setup event listeners for bottom sheet inputs
 */
function setupSheetEventListeners(panel) {
  // Track if any changes were made
  let hasChanges = false;
  
  // Get currently selected player
  const getSelectedPlayer = () => {
    const selected = document.querySelector('.player.selected');
    console.log('🔍 Selected player:', selected);
    return selected;
  };
  
  // Number input
  const numberInput = panel.querySelector('#playerNumber');
  if (numberInput) {
    console.log('📝 Number input found, adding listener');
    numberInput.addEventListener('input', (e) => {
      hasChanges = true;
      const newNumber = e.target.value;
      console.log('🔢 Number changed to:', newNumber);
      
      const playerEl = getSelectedPlayer();
      if (playerEl) {
        // Update number display
        const numberEl = playerEl.querySelector('.player-number');
        if (numberEl) {
          numberEl.textContent = newNumber;
          console.log('✅ Updated number on pitch');
        }
        
        // Update data attribute
        playerEl.dataset.number = newNumber;
      } else {
        console.warn('⚠️ No selected player found');
      }
    });
  }
  
  // Name input
  const nameInput = panel.querySelector('#playerName');
  if (nameInput) {
    console.log('📝 Name input found, adding listener');
    nameInput.addEventListener('input', (e) => {
      hasChanges = true;
      const newName = e.target.value;
      console.log('👤 Name changed to:', newName);
      
      const playerEl = getSelectedPlayer();
      if (playerEl) {
        // Update name display
        const nameEl = playerEl.querySelector('.player-name');
        if (nameEl) {
          nameEl.textContent = newName;
          console.log('✅ Updated name on pitch');
        }
      } else {
        console.warn('⚠️ No selected player found');
      }
    });
  }
  
  // Role select
  const roleSelect = panel.querySelector('#playerRole');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      hasChanges = true;
      const originalSelect = document.querySelector('.player-panel #playerRole');
      if (originalSelect) {
        originalSelect.value = e.target.value;
        originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  
  // Color presets
  const colorBtns = panel.querySelectorAll('[data-color]');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hasChanges = true;
      const color = btn.dataset.color;
      const originalBtn = document.querySelector(`.player-panel [data-color="${color}"]`);
      if (originalBtn) {
        originalBtn.click();
      }
      
      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      // Show success toast
      showToast('Color updated', 'success');
    });
  });
  
  // Avatar upload
  const uploadBtn = panel.querySelector('#uploadAvatarBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      hasChanges = true;
      const originalBtn = document.querySelector('.player-panel #uploadAvatarBtn');
      if (originalBtn) {
        originalBtn.click();
      }
    });
  }
  
  // Delete avatar
  const deleteAvatarBtn = panel.querySelector('#deleteAvatarBtn');
  if (deleteAvatarBtn) {
    deleteAvatarBtn.addEventListener('click', () => {
      hasChanges = true;
      const originalBtn = document.querySelector('.player-panel #deleteAvatarBtn');
      if (originalBtn) {
        originalBtn.click();
      }
      showToast('Avatar deleted', 'success');
    });
  }
  
  // Card buttons
  const yellowCardBtn = panel.querySelector('button[onclick*="yellow"]');
  const redCardBtn = panel.querySelector('button[onclick*="red"]');
  
  if (yellowCardBtn) {
    yellowCardBtn.addEventListener('click', () => {
      hasChanges = true;
      const originalBtn = document.querySelector('.player-panel button[onclick*="yellow"]');
      if (originalBtn) originalBtn.click();
      showToast('Yellow card added', 'success');
    });
  }
  
  if (redCardBtn) {
    redCardBtn.addEventListener('click', () => {
      hasChanges = true;
      const originalBtn = document.querySelector('.player-panel button[onclick*="red"]');
      if (originalBtn) originalBtn.click();
      showToast('Red card added', 'success');
    });
  }
  
  // Done button (close sheet)
  const doneBtn = document.createElement('button');
  doneBtn.textContent = '✓ Done';
  doneBtn.style.cssText = `
    width: 100%;
    padding: 14px;
    background: #00a651;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    cursor: pointer;
  `;
  doneBtn.addEventListener('click', () => {
    if (hasChanges) {
      showToast('Changes saved!', 'success');
    }
    closeBottomSheet();
  });
  panel.appendChild(doneBtn);
  
  // Auto-close after 3 seconds of no activity
  let inactivityTimer;
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    // Don't auto-close, wait for user to click Done
  };
  
  // Reset timer on any interaction
  panel.addEventListener('input', resetTimer);
  panel.addEventListener('change', resetTimer);
  panel.addEventListener('click', resetTimer);
}

/**
 * Close bottom sheet
 */
function closeBottomSheet() {
  console.log('🚪 closeBottomSheet called');
  const sheet = document.getElementById('mobileEditSheet');
  if (sheet) {
    sheet.classList.remove('active');
    sheet.style.transform = '';
    document.body.style.overflow = ''; // Restore scroll
    console.log('✅ Bottom sheet closed');
  } else {
    console.warn('Sheet element not found');
  }
}

/**
 * Responsive handlers
 */
function setupResponsiveHandlers() {
  // Handle orientation change
  window.addEventListener('orientationchange', () => {
    console.log('📱 Orientation changed');
    
    // Wait for rotation to complete
    setTimeout(() => {
      handleOrientationChange();
    }, 200);
  });
  
  // Handle resize (including rotation)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth < 1024;
      
      if (isMobile) {
        // DON'T call showMobileElements - it resets tab state!
        // Just adjust scale
        adjustPitchScale();
      } else {
        // Hide mobile elements if switched to desktop
        hideMobileElements();
      }
    }, 250);
  });
  
  // Initial scale adjustment
  adjustPitchScale();
}

/**
 * Handle orientation change
 */
function handleOrientationChange() {
  const orientation = screen.orientation?.type || 
                     (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
  
  console.log('📱 New orientation:', orientation);
  
  // Close bottom sheet on orientation change
  const sheet = document.getElementById('mobileEditSheet');
  if (sheet?.classList.contains('active')) {
    closeBottomSheet();
  }
  
  // Adjust pitch scale
  adjustPitchScale();
  
  // Show orientation tip
  if (orientation.includes('landscape')) {
    showOrientationTip('📱 Landscape mode - Better view!');
  }
  
  // Force layout recalculation
  window.dispatchEvent(new Event('resize'));
}

/**
 * Adjust pitch scale based on screen size
 */
function adjustPitchScale() {
  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return;
  
  const pitch = document.getElementById('pitch');
  if (!pitch) return;
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isLandscape = screenWidth > screenHeight;
  
  if (isLandscape) {
    // Landscape: wider pitch
    pitch.style.maxWidth = '400px';
    pitch.style.height = '600px';
  } else {
    // Portrait: narrower pitch
    pitch.style.maxWidth = '360px';
    pitch.style.height = '540px';
  }
}

/**
 * Show orientation tip
 */
function showOrientationTip(message) {
  const tip = document.createElement('div');
  tip.textContent = message;
  tip.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: #00a651;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(tip);
  
  // Remove after 2s
  setTimeout(() => {
    tip.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => tip.remove(), 300);
  }, 2000);
}

/**
 * Hide mobile elements
 */
function hideMobileElements() {
  const mobileHeader = document.querySelector('.mobile-header');
  const mobileFABs = document.querySelector('.mobile-fab-container');
  const mobileFormation = document.querySelector('.mobile-formation-controls');
  const mobileToggles = document.querySelector('.mobile-toggle-group');
  
  [mobileHeader, mobileFABs, mobileFormation, mobileToggles].forEach(el => {
    if (el) el.style.display = 'none';
  });
  
  // Restore desktop layout
  const mainContent = document.querySelector('.main-content');
  const sidebar = document.querySelector('.sidebar');
  
  if (mainContent) mainContent.style.display = 'flex';
  if (sidebar) {
    sidebar.style.display = 'block';
    sidebar.style.width = '';
    sidebar.style.height = '';
    sidebar.style.position = '';
  }
}

/**
 * Setup touch handlers for bench players (called after bench renders)
 */
export function setupBenchTouchHandlers() {
  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return;
  
  // Bench has id="bench" and class="bench-zone"
  const bench = document.getElementById('bench') || document.querySelector('.bench-zone');
  if (!bench) {
    console.log('⚠️ Bench not found, skipping bench touch setup');
    return;
  }
  
  const benchPlayers = bench.querySelectorAll('.bench-player');
  console.log(`👆 Setting up touch for ${benchPlayers.length} bench players`);
  
  benchPlayers.forEach(benchPlayer => {
    if (!benchPlayer._touchSetup) {
      setupBenchPlayerTouch(benchPlayer);
    }
  });
}

/**
 * Enhance touch interactions for players
 */
export function setupMobileTouchHandlers() {
  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return;
  
  // Prevent duplicate setup
  if (_mobileTouchHandlersInitialized) {
    console.log('⚠️ Touch handlers already initialized, skipping');
    return;
  }
  
  console.log('👆 Setting up mobile touch handlers (first time only)');
  _mobileTouchHandlersInitialized = true;
  
  // DON'T prevent text selection on pitch - it blocks scroll!
  // Only prevent on players themselves
  
  // Setup touch for each player
  const players = document.querySelectorAll('.player');
  console.log(`👆 Setting up touch for ${players.length} players`);
  
  players.forEach(player => {
    setupPlayerTouch(player);
  });
  
  // Setup bench touch handlers (will be called separately after bench renders)
  // See setupBenchTouchHandlers()
  
  // Also setup for future players (using event delegation on pitch)
  if (pitch) {
    // On click
    pitch.addEventListener('click', (e) => {
      const player = e.target.closest('.player');
      if (player && !player._touchSetup) {
        setupPlayerTouch(player);
      }
    });
    
    // On touchstart (for new players created after formation change)
    pitch.addEventListener('touchstart', (e) => {
      const player = e.target.closest('.player');
      if (player && !player._touchSetup) {
        setupPlayerTouch(player);
      }
    }, { passive: true });
  }
}

/**
 * Setup touch handlers for a single player
 */
function setupPlayerTouch(player) {
  if (player._touchSetup) return; // Already setup
  player._touchSetup = true;
  
  let touchStartTime = 0;
  let touchStartPos = { x: 0, y: 0 };
  let isDragging = false;
  let isLongPress = false;
  let longPressTimer = null;
  
  // Touch start - only on this player
  player.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    isDragging = false;
    isLongPress = false;
    
    // Start long press timer
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      
      // Haptic
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      
      // Visual feedback
      player.style.opacity = '0.8';
      player.style.transform = 'scale(1.15)';
      player.style.zIndex = '1000';
      
      // Don't show toast - it's annoying and can't dismiss
    }, 500);
    
    // Light haptic
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  }, { passive: true });
  
  // Touch move - only when dragging this player
  player.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // If moved before long press, cancel
    if (!isLongPress && (deltaX > 10 || deltaY > 10)) {
      clearTimeout(longPressTimer);
      return; // Allow scroll
    }
    
    // If long press active, start dragging
    if (isLongPress && (deltaX > 5 || deltaY > 5)) {
      isDragging = true;
      player.classList.add('dragging');
      
      // PREVENT SCROLL when dragging
      e.preventDefault();
      e.stopPropagation();
      
      // Move player - simple pixel positioning
      const wrapper = player.parentElement;
      const pitch = wrapper.parentElement; // .pitch-area
      const pitchRect = pitch.getBoundingClientRect();
      
      // Calculate position in pixels relative to pitch
      let x = touch.clientX - pitchRect.left - (player.offsetWidth / 2);
      let y = touch.clientY - pitchRect.top - (player.offsetHeight / 2);
      
      // Clamp to pitch boundaries
      const minX = 0;
      const minY = 0;
      const maxX = pitchRect.width - player.offsetWidth;
      const maxY = pitchRect.height - player.offsetHeight;
      
      x = Math.max(minX, Math.min(maxX, x));
      y = Math.max(minY, Math.min(maxY, y));
      
      // Update wrapper position directly in pixels
      wrapper.style.left = `${x}px`;
      wrapper.style.top = `${y}px`;
      
      // Name is now inside player element, so it moves automatically!
    }
  }, { passive: false }); // Must be non-passive to preventDefault
  
  // Touch end
  player.addEventListener('touchend', (e) => {
    clearTimeout(longPressTimer);
    
    const touchDuration = Date.now() - touchStartTime;
    const wasDragging = isDragging;
    const wasLongPress = isLongPress;
    
    // Reset visual
    player.style.opacity = '';
    player.style.transform = '';
    player.style.zIndex = '';
    player.classList.remove('dragging');
    
    // Reset state
    isDragging = false;
    isLongPress = false;
    
    // Short tap = open sheet
    if (touchDuration < 500 && !wasDragging && !wasLongPress) {
      player.click();
      
      requestAnimationFrame(() => {
        openBottomSheet();
      });
    }
  }, { passive: true });
}

/**
 * Setup touch handlers for bench player (for drag swap)
 */
function setupBenchPlayerTouch(benchPlayer) {
  if (benchPlayer._touchSetup) return;
  benchPlayer._touchSetup = true;
  
  console.log('🏋️ Setting up bench touch for:', benchPlayer.textContent?.trim());
  
  // Prevent context menu (right-click menu) on touch hold
  benchPlayer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  let touchStartTime = 0;
  let touchStartPos = { x: 0, y: 0 };
  let isLongPress = false;
  let longPressTimer = null;
  let isDragging = false;
  let ghostElement = null;
  
  benchPlayer.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    const touch = e.touches[0];
    touchStartPos = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    isLongPress = false;
    isDragging = false;
    
    console.log('👆 Bench touch start:', benchPlayer.textContent?.trim());
    
    // Long press timer (500ms)
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      
      console.log('⏰ Bench long press activated!');
      
      // Haptic
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      
      // Visual feedback
      benchPlayer.style.opacity = '0.5';
      benchPlayer.style.zIndex = '1000';
      
      console.log('🎯 Ready to drag');
    }, 500);
    
    // Light haptic
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  }, { passive: true });
  
  benchPlayer.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // Cancel if moved before long press
    if (!isLongPress && (deltaX > 10 || deltaY > 10)) {
      console.log('❌ Moved before long press, canceling');
      clearTimeout(longPressTimer);
      return;
    }
    
    // If long press active, just prevent default
    if (isLongPress) {
      isDragging = true;
      e.preventDefault();
    }
  }, { passive: false });
  
  benchPlayer.addEventListener('touchend', (e) => {
    clearTimeout(longPressTimer);
    
    const touchDuration = Date.now() - touchStartTime;
    
    console.log('👆 Bench touch end, duration:', touchDuration, 'isLongPress:', isLongPress);
    
    // Reset visual
    benchPlayer.style.opacity = '';
    benchPlayer.style.zIndex = '';
    
    if (isLongPress && isDragging) {
      const touch = e.changedTouches[0];
      
      // Get final drop target at CURRENT visual position
      const elementAtDrop = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetWrapper = elementAtDrop?.closest('.player-wrapper');
      const targetPlayer = targetWrapper?.querySelector('.player');
      
      console.log('🎯 Drop detection:', {
        x: touch.clientX,
        y: touch.clientY,
        foundWrapper: !!targetWrapper,
        foundPlayer: !!targetPlayer,
        benchPlayer: benchPlayer._player?.name,
        targetPlayer: targetPlayer?._player?.name
      });
      
      // 🆕 DIRECT MOBILE SWAP - Bypass drag-swap.js
      if (targetPlayer && targetPlayer._player && benchPlayer._player) {
        const lineupPlayer = targetPlayer._player;
        const benchPlayerData = benchPlayer._player;
        
        console.log('🔄 Direct mobile swap:', benchPlayerData.name, '↔', lineupPlayer.name);
        
        // Access main.js state and functions
        if (window.mobileSwapHandler) {
          window.mobileSwapHandler(benchPlayerData, lineupPlayer);
        } else {
          alert('❌ Handler not found!'); // Keep this - critical error
          console.error('⚠️ mobileSwapHandler not found!');
        }
      } else {
        console.log('⚠️ No valid drop target found');
      }
    }
    
    isLongPress = false;
    isDragging = false;
  }, { passive: true });
}

/**
 * Add visual touch feedback
 */
function addTouchFeedback(element) {
  if (!element) return;
  
  element.addEventListener('touchstart', () => {
    element.style.opacity = '0.7';
    
    // Haptic
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  }, { passive: true });
  
  element.addEventListener('touchend', () => {
    setTimeout(() => {
      element.style.opacity = '';
    }, 100);
  }, { passive: true });
}

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return; // Only show on mobile
  
  const toast = document.createElement('div');
  toast.className = `mobile-toast mobile-toast-${type}`;
  
  // Icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#00a651' : type === 'error' ? '#d32f2f' : '#333'};
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideUp 0.3s ease;
    max-width: 80%;
  `;
  
  document.body.appendChild(toast);
  
  // Haptic feedback
  if (window.navigator.vibrate) {
    window.navigator.vibrate(type === 'error' ? [10, 50, 10] : 10);
  }
  
  // Remove after 3s
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Disable features not supported on mobile
 */
export function disableMobileUnsupportedFeatures() {
  const isMobile = window.innerWidth < 1024;
  if (!isMobile) return;
  
  // Multi-select: Disable Ctrl/Cmd key
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  });
  
  // Direction arrows: Already hidden via CSS
  
  // Custom colors: Already hidden via CSS
}