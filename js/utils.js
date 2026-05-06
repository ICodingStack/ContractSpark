/**
 * utils.js
 * Shared utility functions for ContractSpark.
 * ContractSpark — Beautiful Contracts That Protect You
 */

// ─────────────────────────────────────────
// DATE & FORMATTING
// ─────────────────────────────────────────

/**
 * Format a YYYY-MM-DD date string to a readable long date.
 * Shared with contract-data.js formatDate.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

/**
 * Format currency amount.
 */
function formatCurrency(amount, currency = 'USD') {
  if (!amount || amount === '') return '[Amount]';
  const num = parseFloat(amount);
  if (isNaN(num)) return '[Amount]';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toLocaleString()}`;
  }
}

/**
 * Human-readable payment term text.
 */
function formatPaymentTerm(term) {
  const terms = {
    'net15': 'within fifteen (15) days of invoice',
    'net30': 'within thirty (30) days of invoice',
    'net45': 'within forty-five (45) days of invoice',
    'net60': 'within sixty (60) days of invoice',
    'upon-completion': 'upon completion of the project',
    'upfront': 'upfront, prior to commencement of work',
  };
  return terms[term] || 'as agreed upon by the parties';
}

/**
 * Format a saved date to a short human-readable form.
 */
function formatSavedDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return isoStr; }
}

// ─────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────

const STORAGE_KEY = 'contractspark_contracts';

/**
 * Load all saved contracts from localStorage.
 */
function loadSavedContracts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/**
 * Save contracts array to localStorage.
 */
function saveContractsToStorage(contracts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    return true;
  } catch (e) {
    console.error('Failed to save:', e);
    return false;
  }
}

// ─────────────────────────────────────────
// IMAGE HANDLING
// ─────────────────────────────────────────

/**
 * Convert a File object to a base64 data URL.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────
// COLOR UTILITIES
// ─────────────────────────────────────────

/**
 * Convert a hex color to its CSS rgb() values as a string "R, G, B".
 */
function hexToRgbString(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '201, 169, 110';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// ─────────────────────────────────────────
// MISC
// ─────────────────────────────────────────

/**
 * Generate a unique contract reference number.
 */
function generateRefNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CS-${year}-${rand}`;
}

/**
 * Deep clone an object safely.
 */
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch { return obj; }
}

/**
 * Debounce a function call.
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
