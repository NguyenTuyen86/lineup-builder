/**
 * Formation Configuration and Calculations
 * 
 * Grid-based formation system using 5x4 or 5x5 matrices.
 * Pure functions - no DOM, no state.
 */

// ============================================
// FORMATION DEFINITIONS (Grid Matrices)
// ============================================

/**
 * Grid-based formation definitions
 * Key: Player count (5, 7, 11)
 * Value: Formation name -> Matrix (rows x 5 columns)
 * 
 * Matrix format:
 * - Row 1 (bottom) = GK
 * - Row 2-4/5 = Field players
 * - 1 = player position, 0 = empty
 */
export const formationDefinitions = {
  5: {
    '2-0-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [0,0,0,0,0], // Row 3: 0 MF
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '2-1-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [0,0,1,0,0], // Row 3: 1 MF
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '1-2-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [0,1,0,1,0], // Row 3: 2 MF
      [0,0,1,0,0], // Row 2: 1 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '1-1-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [0,0,1,0,0], // Row 3: 1 MF
      [0,0,1,0,0], // Row 2: 1 CB
      [0,0,1,0,0]  // Row 1: GK
    ]
  },
  
  7: {
    // 4-number formations use 5 rows
    '2-1-2-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [0,0,1,0,0], // Row 3: 1 DM
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '1-4-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [1,1,0,1,1], // Row 3: 4 MF
      [0,0,1,0,0], // Row 2: 1 DM
      [0,0,1,0,0]  // Row 1: GK
    ],
    // 3-number formations use 4 rows
    '2-3-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [1,0,1,0,1], // Row 3: 3 CM
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-2-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [0,1,0,1,0], // Row 3: 2 CM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '2-2-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [0,1,0,1,0], // Row 3: 2 CM
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '2-1-3': [
      [1,0,1,0,1], // Row 4: 3 ST
      [0,0,1,0,0], // Row 3: 1 CM
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-1-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [0,0,1,0,0], // Row 3: 1 CM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ]
  },
  
  11: {
    // 3-number formations use 4 rows
    '4-4-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [1,1,0,1,1], // Row 3: 4 MF
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-3-3': [
      [1,0,1,0,1], // Row 4: 3 ST
      [1,0,1,0,1], // Row 3: 3 MF
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-5-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [1,1,1,1,1], // Row 3: 5 MF
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-5-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [1,1,1,1,1], // Row 3: 5 MF
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-4-3': [
      [1,0,1,0,1], // Row 4: 3 ST
      [1,1,0,1,1], // Row 3: 4 MF
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '5-3-2': [
      [0,1,0,1,0], // Row 4: 2 ST
      [1,0,1,0,1], // Row 3: 3 MF
      [1,1,1,1,1], // Row 2: 5 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '5-4-1': [
      [0,0,1,0,0], // Row 4: 1 ST
      [1,1,0,1,1], // Row 3: 4 MF
      [1,1,1,1,1], // Row 2: 5 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '5-2-3': [
      [1,0,1,0,1], // Row 4: 3 ST
      [0,1,0,1,0], // Row 3: 2 MF
      [1,1,1,1,1], // Row 2: 5 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    
    // 4-number formations use 5 rows
    '4-2-3-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [1,0,1,0,1], // Row 4: 3 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-1-4-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [1,1,0,1,1], // Row 4: 4 AM
      [0,0,1,0,0], // Row 3: 1 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-3-1-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [1,0,1,0,1], // Row 3: 3 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-4-1-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [1,1,0,1,1], // Row 3: 4 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-2-2-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-3-2-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [1,0,1,0,1], // Row 3: 3 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-1-3-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [1,0,1,0,1], // Row 4: 3 AM
      [0,0,1,0,0], // Row 3: 1 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-1-2-3': [
      [1,0,1,0,1], // Row 5: 3 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [0,0,1,0,0], // Row 3: 1 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-2-4': [
      [1,1,0,1,1], // Row 4: 4 ST
      [0,1,0,1,0], // Row 3: 2 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '4-2-1-3': [
      [1,0,1,0,1], // Row 5: 3 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,1,0,1,1], // Row 2: 4 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-4-2-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [1,1,0,1,1], // Row 3: 4 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-4-1-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [1,1,0,1,1], // Row 3: 4 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-1-4-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [1,1,0,1,1], // Row 4: 4 AM
      [0,0,1,0,0], // Row 3: 1 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-5-1-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [1,1,1,1,1], // Row 3: 5 MF
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-3-1-3': [
      [1,0,1,0,1], // Row 5: 3 ST
      [0,0,1,0,0], // Row 4: 1 AM
      [1,0,1,0,1], // Row 3: 3 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-3-3-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [1,0,1,0,1], // Row 4: 3 AM
      [1,0,1,0,1], // Row 3: 3 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-2-4-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [1,1,0,1,1], // Row 4: 4 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '5-2-2-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [0,1,0,1,0], // Row 4: 2 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,1,1,1,1], // Row 2: 5 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '2-3-4-1': [
      [0,0,1,0,0], // Row 5: 1 ST
      [1,1,0,1,1], // Row 4: 4 AM
      [1,0,1,0,1], // Row 3: 3 DM
      [0,1,0,1,0], // Row 2: 2 CB
      [0,0,1,0,0]  // Row 1: GK
    ],
    '3-2-3-2': [
      [0,1,0,1,0], // Row 5: 2 ST
      [1,0,1,0,1], // Row 4: 3 AM
      [0,1,0,1,0], // Row 3: 2 DM
      [1,0,1,0,1], // Row 2: 3 CB
      [0,0,1,0,0]  // Row 1: GK
    ]
  }
};

// ============================================
// FALLBACK MANUAL FORMATIONS
// ============================================

/**
 * Manual formations (legacy)
 * Used as fallback if grid formation not found
 */
export const formationsManual = {
  5: [
    {x: 50, y: 88, role: 'GK'},
    {x: 30, y: 65, role: 'CB'},
    {x: 70, y: 65, role: 'CB'},
    {x: 50, y: 45, role: 'AM'},
    {x: 50, y: 25, role: 'ST'}
  ],
  7: [
    {x: 50, y: 88, role: 'GK'},
    {x: 30, y: 65, role: 'CB'},
    {x: 70, y: 65, role: 'CB'},
    {x: 50, y: 55, role: 'DM'},
    {x: 30, y: 40, role: 'LM'},
    {x: 70, y: 40, role: 'RM'},
    {x: 50, y: 25, role: 'ST'}
  ],
  11: [
    {x: 50, y: 92, role: 'GK'},
    {x: 15, y: 78, role: 'LB'},
    {x: 35, y: 78, role: 'CB'},
    {x: 65, y: 78, role: 'CB'},
    {x: 85, y: 78, role: 'RB'},
    {x: 50, y: 65, role: 'DM'},
    {x: 25, y: 50, role: 'LM'},
    {x: 75, y: 50, role: 'RM'},
    {x: 50, y: 38, role: 'AM'},
    {x: 35, y: 25, role: 'CF'},
    {x: 65, y: 25, role: 'CF'}
  ]
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Convert grid position to pitch coordinates
 * @param {number} row - Row number (1-based, 1=GK)
 * @param {number} col - Column number (1-5, not used currently)
 * @param {number} totalRows - Total rows in formation (4 or 5)
 * @param {number} playersInRow - Number of players in this row
 * @param {number} playerIndexInRow - Player index within this row (0-based)
 * @returns {Object} {x, y} coordinates in percentage
 */
export function gridToCoords(row, col, totalRows, playersInRow, playerIndexInRow) {
  // X coordinate: distribute evenly based on number of players in this row
  let x;
  
  if (playersInRow === 1) {
    x = 50; // Center
  } else if (playersInRow === 2) {
    const positions = [30, 70];
    x = positions[playerIndexInRow];
  } else if (playersInRow === 3) {
    const positions = [20, 50, 80];
    x = positions[playerIndexInRow];
  } else if (playersInRow === 4) {
    const positions = [10, 36.67, 63.33, 90];
    x = positions[playerIndexInRow];
  } else if (playersInRow === 5) {
    const positions = [10, 30, 50, 70, 90];
    x = positions[playerIndexInRow];
  } else {
    // Fallback for 6+ players
    const leftMargin = playersInRow >= 4 ? 10 : 20;
    const rightMargin = playersInRow >= 4 ? 90 : 80;
    const totalWidth = rightMargin - leftMargin;
    x = leftMargin + (totalWidth / (playersInRow - 1)) * playerIndexInRow;
  }
  
  // Y coordinate: distribute based on number of rows
  let y;
  if (totalRows === 4) {
    // 3-number formations (4 rows: GK + 3 lines)
    const yPositions = [90, 65, 40, 15]; // GK, Defense, Midfield, Attack
    y = yPositions[row - 1];
  } else {
    // 4-number formations (5 rows: GK + 4 lines)
    const yPositions = [90, 71.25, 52.5, 33.75, 15]; // GK, Defense, DM, AM, Attack
    y = yPositions[row - 1];
  }
  
  return { x, y };
}

/**
 * Convert grid matrix to formation array
 * @param {Array<Array<number>>} matrix - Grid matrix (rows x 5 columns)
 * @param {number} playerCount - Total players (5, 7, or 11)
 * @returns {Array<Object>} Formation array [{x, y, role}, ...]
 */
function getDefenseRoles(count) {
  if (count === 4) return ['LB','LCB','RCB','RB'];
  if (count === 3) return ['LCB','CB','RCB'];
  if (count === 5) return ['LWB','LCB','CB','RCB','RWB'];
  return Array(count).fill('CB');
}

function getAttackRoles(count) {
  if (count === 3) return ['LW','ST','RW'];
  if (count === 2) return ['ST','ST'];
  if (count === 1) return ['ST'];
  return Array(count).fill('ST');
}

function getMidRoles(count, totalRows, rowNumber) {

  // ==========================================
  // 3-number formation (4 rows total)
  // GK + DEF + MID + ATT
  // ==========================================
  if (totalRows === 4) {

    switch (count) {
      case 1: return ['CM'];
      case 2: return ['LM','RM'];
      case 3: return ['LCM','CM','RCM'];
      case 4: return ['LM','LCM','RCM','RM'];
      case 5: return ['LM','LCM','CM','RCM','RM'];
      default: return Array(count).fill('CM');
    }
  }

  // ==========================================
  // 4-number formation (5 rows total)
  // GK + DEF + DM + AM + ATT
  // ==========================================
  if (totalRows === 5) {

    // DM line (row 3)
    if (rowNumber === 3) {
      switch (count) {
        case 1: return ['CDM'];
        case 2: return ['LDM','RDM'];
        case 3: return ['LDM','CDM','RDM'];
        case 4: return ['LDM','LCM','RCM','RDM'];
        case 5: return ['LDM','LCM','CDM','RCM','RDM'];
        default: return Array(count).fill('CDM');
      }
    }

    // AM line (row 4)
    if (rowNumber === 4) {
      switch (count) {
        case 1: return ['CAM'];
        case 2: return ['LAM','RAM'];
        case 3: return ['LAM','CAM','RAM'];
        case 4: return ['LM','LAM','RAM','RM'];
        case 5: return ['LM','LAM','CAM','RAM','RM'];
        default: return Array(count).fill('CAM');
      }
    }
  }

  return Array(count).fill('CM');
}



export function matrixToFormation(matrix, playerCount) {

  const formation = [];
  const totalRows = matrix.length;

  const playersPerRow = [];

  for (let r = 0; r < totalRows; r++) {
    let count = 0;
    for (let c = 0; c < 5; c++) {
      if (matrix[totalRows - 1 - r][c] === 1) count++;
    }
    playersPerRow[r] = count;
  }

  for (let r = 0; r < totalRows; r++) {

    const rowNumber = r + 1;
    const playersInRow = playersPerRow[r];
    let indexInRow = 0;
    let roles = [];

    if (rowNumber === 1) {
      roles = ['GK'];
    }
    else if (rowNumber === 2) {
      roles = getDefenseRoles(playersInRow);
    }
    else if (rowNumber === totalRows) {
      roles = getAttackRoles(playersInRow);
    }
    else {
      roles = getMidRoles(playersInRow, totalRows, rowNumber);
    }

    for (let c = 0; c < 5; c++) {

      if (matrix[totalRows - 1 - r][c] === 1) {

        const coords = gridToCoords(
          rowNumber,
          c + 1,
          totalRows,
          playersInRow,
          indexInRow
        );

        formation.push({
          x: coords.x,
          y: coords.y,
          role: roles[indexInRow] || 'CM'
        });

        indexInRow++;
      }
    }
  }

  return formation;
}


/**
 * Get formation data for given player count and formation name
 * @param {number} playerCount - 5, 7, or 11
 * @param {string} formationName - e.g., '4-4-2', '4-2-3-1'
 * @returns {Array<Object>|null} Formation array or null if not found
 */
export function getFormation(playerCount, formationName) {
  const definitions = formationDefinitions[playerCount];
  
  if (definitions && definitions[formationName]) {
    const matrix = definitions[formationName];
    return matrixToFormation(matrix, playerCount);
  }
  
  // Fallback to manual
  return formationsManual[playerCount] || null;
}

/**
 * Get all formation names for given player count
 * @param {number} playerCount - 5, 7, or 11
 * @returns {Array<string>} Formation names
 */
export function getFormationNames(playerCount) {
  const definitions = formationDefinitions[playerCount];
  return definitions ? Object.keys(definitions) : [];
}

/**
 * Validate if formation exists
 * @param {number} playerCount - 5, 7, or 11
 * @param {string} formationName - Formation name
 * @returns {boolean} True if formation exists
 */
export function hasFormation(playerCount, formationName) {
  return !!(formationDefinitions[playerCount] && formationDefinitions[playerCount][formationName]);
}