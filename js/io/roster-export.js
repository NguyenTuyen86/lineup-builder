/**
 * Roster Export Module
 * Generates team roster image with staff and players
 */

/**
 * Truncate long names intelligently
 * @param {string} name - Full name
 * @param {number} maxLength - Max length (default 21)
 * @returns {string} Truncated name
 */
function truncateName(name, maxLength = 21) {
  if (!name || name.length <= maxLength) return name;
  
  // Split by spaces
  const parts = name.trim().split(/\s+/);
  
  // If single word, just truncate
  if (parts.length === 1) {
    return name.substring(0, maxLength - 3) + '...';
  }
  
  // Keep last 2 words (given name)
  const lastTwo = parts.slice(-2).join(' ');
  
  // If last 2 words fit
  if (lastTwo.length <= maxLength) {
    return '...' + lastTwo;
  }
  
  // If last word fits
  const lastName = parts[parts.length - 1];
  if (lastName.length <= maxLength - 3) {
    return '...' + lastName;
  }
  
  // Fallback: just truncate
  return name.substring(0, maxLength - 3) + '...';
}

/**
 * Generate team roster HTML
 * @param {Object} teamData - Team data
 * @returns {HTMLElement} Roster container
 */
export function generateRosterHTML(teamData) {
  const { team, staff, squad } = teamData;
  
  const container = document.createElement('div');
  container.className = 'roster-container';
  container.style.cssText = `
    width: 1200px;
    padding: 40px;
    background: #ffffff;
    color: #000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  
  // Header: Logo + Team Name
  const header = createRosterHeader(team);
  container.appendChild(header);
  
  // Coaching Staff Section
  if (staff && staff.length > 0) {
    const staffSection = createStaffSection(staff);
    container.appendChild(staffSection);
  }
  
  // Players Section
  if (squad && squad.length > 0) {
    const playersSection = createPlayersSection(squad);
    container.appendChild(playersSection);
  }
  
  return container;
}

/**
 * Create roster header (logo + team name)
 */
function createRosterHeader(team) {
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 3px solid #000;
  `;
  
  // Logo (preserve aspect ratio, max 120px - 20% larger)
  if (team.logo) {
    const logo = document.createElement('img');
    logo.src = team.logo;
    logo.style.cssText = `
      max-width: 120px;
      max-height: 120px;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 8px;
    `;
    header.appendChild(logo);
  }
  
  // Team Name
  if (team.name) {
    const name = document.createElement('div');
    name.textContent = team.name.toUpperCase();
    name.style.cssText = `
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #000;
    `;
    header.appendChild(name);
  }
  
  return header;
}

/**
 * Create staff section
 */
function createStaffSection(staff) {
  const section = document.createElement('div');
  section.style.cssText = `
    margin-bottom: 50px;
  `;
  
  // Section title
  const title = document.createElement('h2');
  title.textContent = '👔 BAN HUẤN LUYỆN';
  title.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #000;
    text-align: center;
    padding-bottom: 12px;
    border-bottom: 2px solid #ddd;
  `;
  section.appendChild(title);
  
  // Staff grid (5 per row)
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  `;
  
  staff.forEach(member => {
    const card = createStaffCard(member);
    grid.appendChild(card);
  });
  
  section.appendChild(grid);
  return section;
}

/**
 * Create individual staff card
 */
function createStaffCard(member) {
  const card = document.createElement('div');
  card.style.cssText = `
    text-align: center;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 12px;
    border: 2px solid #ddd;
    min-height: 220px;
  `;
  
  // Avatar
  const avatarContainer = document.createElement('div');
  avatarContainer.style.cssText = `
    width: 120px;
    height: 120px;
    margin: 0 auto 16px;
    border-radius: 12px;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid #ccc;
  `;
  
  if (member.avatar) {
    const avatar = document.createElement('img');
    avatar.src = member.avatar;
    avatar.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    avatarContainer.appendChild(avatar);
  } else {
    // Placeholder
    const placeholder = document.createElement('div');
    placeholder.textContent = '👔';
    placeholder.style.cssText = `
      font-size: 48px;
    `;
    avatarContainer.appendChild(placeholder);
  }
  
  card.appendChild(avatarContainer);
  
  // Name (truncated)
  const name = document.createElement('div');
  name.textContent = truncateName(member.name, 21);
  name.title = member.name;  // Show full name on hover
  name.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #000;
    height: 20px;
    line-height: 20px;
  `;
  card.appendChild(name);
  
  // Role
  const role = document.createElement('div');
  role.textContent = member.role;
  role.style.cssText = `
    font-size: 14px;
    color: #666;
  `;
  card.appendChild(role);
  
  return card;
}

/**
 * Create players section
 */
function createPlayersSection(squad) {
  const section = document.createElement('div');
  section.style.cssText = `
    margin-bottom: 30px;
  `;
  
  // Section title
  const title = document.createElement('h2');
  title.textContent = '⚽ CẦU THỦ';
  title.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #000;
    text-align: center;
    padding-bottom: 12px;
    border-bottom: 2px solid #ddd;
  `;
  section.appendChild(title);
  
  // Players grid (5 per row)
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  `;
  
  // Sort by number
  const sortedSquad = [...squad].sort((a, b) => {
    const numA = parseInt(a.number) || 999;
    const numB = parseInt(b.number) || 999;
    return numA - numB;
  });
  
  sortedSquad.forEach(player => {
    const card = createPlayerCard(player);
    grid.appendChild(card);
  });
  
  section.appendChild(grid);
  return section;
}

/**
 * Create individual player card
 */
function createPlayerCard(player) {
  const card = document.createElement('div');
  card.style.cssText = `
    text-align: center;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 12px;
    border: 2px solid #ddd;
    min-height: 215px;
  `;
  
  // Avatar container with number badge
  const avatarContainer = document.createElement('div');
  avatarContainer.style.cssText = `
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto 12px;
    border-radius: 12px;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid #ccc;
  `;
  
  if (player.avatar) {
    const avatar = document.createElement('img');
    avatar.src = player.avatar;
    avatar.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    avatarContainer.appendChild(avatar);
  } else {
    // Placeholder
    const placeholder = document.createElement('div');
    placeholder.textContent = '⚽';
    placeholder.style.cssText = `
      font-size: 40px;
    `;
    avatarContainer.appendChild(placeholder);
  }
  
  // Number badge
  const numberBadge = document.createElement('div');
  numberBadge.textContent = player.number || '?';
  numberBadge.style.cssText = `
    position: absolute;
    top: 4px;
    right: 4px;
    width: 32px;
    height: 32px;
    background: #000;
    color: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    border: 2px solid #fff;
  `;
  avatarContainer.appendChild(numberBadge);
  
  card.appendChild(avatarContainer);
  
  // Name (truncated)
  const playerName = player.name || `Player ${player.number}`;
  const name = document.createElement('div');
  name.textContent = truncateName(playerName, 21);
  name.title = playerName;  // Show full name on hover
  name.style.cssText = `
    font-size: 14px;
    font-weight: bold;
    color: #000;
    height: 18px;
    line-height: 18px;
  `;
  card.appendChild(name);
  
  return card;
}

/**
 * Export roster as PNG
 * @param {Object} teamData - Team data
 * @param {Function} exportFn - Export function (html2canvas wrapper)
 */
export async function exportRosterAsPNG(teamData, exportFn) {
  // Generate roster HTML
  const roster = generateRosterHTML(teamData);
  
  // Add to DOM temporarily (offscreen)
  roster.style.position = 'fixed';
  roster.style.left = '-9999px';
  roster.style.top = '0';
  document.body.appendChild(roster);
  
  try {
    // Export
    const filename = `${teamData.team.name || 'team'}_roster_${Date.now()}.png`;
    await exportFn(roster, filename, {
      canvasOptions: {
        backgroundColor: '#ffffff',
        scale: 2
      }
    });
  } finally {
    // Cleanup
    document.body.removeChild(roster);
  }
}