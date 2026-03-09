/**
 * Staff Management Module
 * 
 * Manages coaching staff (Ban Huấn Luyện)
 */

// ============================================
// CONSTANTS
// ============================================

export const STAFF_ROLES = [
  "HLV chính",
  "HLV trợ lý",
  "HLV thủ môn",
  "HLV thể lực",
  "Bác sĩ",
  "Trợ lý y tế",
  "Nhân viên y tế",
  "Quản lý đội"
];

export const MAX_STAFF = 10;

// ============================================
// STAFF CREATION
// ============================================

/**
 * Create initial staff array
 * @param {number} count - Number of default staff (optional)
 * @returns {Array<Object>} Staff array
 */
export function createStaff(count = 0) {
  const staff = [];
  
  for (let i = 0; i < count; i++) {
    staff.push(createStaffMember({
      name: `Staff ${i + 1}`,
      role: STAFF_ROLES[0]
    }));
  }
  
  return staff;
}

/**
 * Create a staff member
 * @param {Object} data - Staff data
 * @returns {Object} Staff member
 */
export function createStaffMember(data = {}) {
  return {
    id: data.id || `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name || 'Staff Member',
    role: data.role || STAFF_ROLES[0],
    avatar: data.avatar || null
  };
}

// ============================================
// STAFF OPERATIONS
// ============================================

/**
 * Add staff member
 * @param {Array<Object>} staff - Staff array
 * @param {Object} memberData - Staff member data
 * @returns {Object} New staff member
 */
export function addStaffMember(staff, memberData = {}) {
  if (staff.length >= MAX_STAFF) {
    throw new Error(`Maximum ${MAX_STAFF} staff members allowed`);
  }
  
  const newMember = createStaffMember(memberData);
  staff.push(newMember);
  return newMember;
}

/**
 * Remove staff member
 * @param {Array<Object>} staff - Staff array
 * @param {Object} member - Staff member to remove
 * @returns {boolean} True if removed
 */
export function removeStaffMember(staff, member) {
  const index = staff.indexOf(member);
  if (index === -1) return false;
  
  staff.splice(index, 1);
  return true;
}

/**
 * Update staff member
 * @param {Object} member - Staff member
 * @param {Object} updates - Updates to apply
 */
export function updateStaffMember(member, updates) {
  Object.keys(updates).forEach(key => {
    if (key !== 'id') { // Don't allow ID changes
      member[key] = updates[key];
    }
  });
}

/**
 * Find staff member by ID
 * @param {Array<Object>} staff - Staff array
 * @param {string} id - Staff ID
 * @returns {Object|null} Staff member or null
 */
export function findStaffById(staff, id) {
  return staff.find(s => s.id === id) || null;
}

/**
 * Get staff by role
 * @param {Array<Object>} staff - Staff array
 * @param {string} role - Staff role
 * @returns {Array<Object>} Staff members with role
 */
export function getStaffByRole(staff, role) {
  return staff.filter(s => s.role === role);
}

/**
 * Validate staff data
 * @param {Object} member - Staff member
 * @returns {Object} {valid, errors}
 */
export function validateStaff(member) {
  const errors = [];
  
  if (!member.name || member.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!member.role || !STAFF_ROLES.includes(member.role)) {
    errors.push('Valid role is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
