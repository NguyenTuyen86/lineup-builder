/**
 * Team Info Module
 * Manages team name and logo display on pitch
 */

/**
 * Update team header display on pitch
 * @param {HTMLElement} headerEl - Team header element
 * @param {Object} team - Team data {name, logo, showOnPitch}
 */
export function updateTeamHeader(headerEl, team) {
  if (!headerEl) return;
  
  // Hide if disabled
  if (!team.showOnPitch) {
    headerEl.style.display = 'none';
    return;
  }
  
  headerEl.style.display = 'flex';
  
  // Update logo
  const logoEl = headerEl.querySelector('.team-logo');
  if (logoEl) {
    if (team.logo) {
      logoEl.src = team.logo;
      logoEl.style.display = 'block';
    } else {
      logoEl.style.display = 'none';
    }
  }
  
  // Update name
  const nameEl = headerEl.querySelector('.team-name');
  if (nameEl) {
    if (team.name) {
      nameEl.textContent = team.name.toUpperCase();
      nameEl.style.display = 'block';
    } else {
      nameEl.style.display = 'none';
    }
  }
  
  // Hide entire header if no logo and no name
  if (!team.logo && !team.name) {
    headerEl.style.display = 'none';
  }
}

/**
 * Update team logo preview in sidebar
 * @param {HTMLElement} previewEl - Logo preview element
 * @param {string} logoSrc - Logo data URL
 * @param {HTMLElement} placeholderEl - Placeholder element (optional)
 */
export function updateTeamLogoPreview(previewEl, logoSrc, placeholderEl = null) {
  if (!previewEl) return;
  
  if (logoSrc) {
    previewEl.src = logoSrc;
    previewEl.style.display = 'block';
    
    // Hide placeholder if provided
    if (placeholderEl) {
      placeholderEl.style.display = 'none';
    }
  } else {
    previewEl.style.display = 'none';
    
    // Show placeholder if provided
    if (placeholderEl) {
      placeholderEl.style.display = 'block';
    }
  }
}