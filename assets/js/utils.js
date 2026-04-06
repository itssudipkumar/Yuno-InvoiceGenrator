/**
 * =============================================
 * UTILITY FUNCTIONS
 * Global helper functions used across modules
 * =============================================
 */

/**
 * Get the correct path prefix for page navigation
 * @param {string} pageName - The page filename (e.g., 'login.html')
 * @returns {string} Correct relative path to the page
 */
function getPagePath(pageName) {
    const currentPath = window.location.pathname;
    
    // Special case: when in pages directory and linking to index.html (home)
    if (currentPath.includes('/pages/') && pageName === 'index.html') {
        return '../index.html';
    }
    
    // If we're in pages directory, pages are in same directory
    if (currentPath.includes('/pages/')) {
        return pageName;
    }
    
    // If we're at root and linking to index.html, just return index.html (already there)
    if (pageName === 'index.html') {
        return 'index.html';
    }
    
    // If we're at root, pages are in pages/ subdirectory
    return 'pages/' + pageName;
}

/**
 * Format a date string into readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "March 15, 2026")
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "$123.45")
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

/**
 * Calculate percentage of a value
 * @param {number} value - Base value
 * @param {number} percentage - Percentage to calculate
 * @returns {number} Calculated amount
 */
function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

/**
 * Safely parse JSON from localStorage
 * @param {string} key - localStorage key
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
function getStorageData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error parsing storage key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Safely save data to localStorage as JSON
 * @param {string} key - localStorage key
 * @param {*} value - Value to save
 * @returns {boolean} Success status
 */
function setStorageData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
        return false;
    }
}
