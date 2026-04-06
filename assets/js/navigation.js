/**
 * =============================================
 * NAVIGATION MANAGER
 * Handles dynamic navigation and user menu
 * =============================================
 */

/**
 * Initialize navigation menu
 * Builds navigation links based on user authentication status
 */
function initializeNavigation() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    try {
        const isLoggedIn = AuthManager.isLoggedIn();
        const user = AuthManager.getCurrentUser();
        
        let navHTML = '';
        
        if (isLoggedIn && user) {
            // Logged-in user navigation
            navHTML = `
                <a href="${getPagePath('dashboard.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Dashboard</a>
                <a href="${getPagePath('invoice.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Create Invoice</a>
                <a href="${getPagePath('clients.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Clients</a>
                <a href="${getPagePath('features.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Features</a>
                <a href="${getPagePath('account.html')}" style="text-decoration: none; color: white; font-weight: 600; padding: 0.7rem 1.2rem; background: #5b62b5; border-radius: 5px; white-space: nowrap; display: inline-block; transition: background 0.3s;">My Account</a>
                <button onclick="handleLogout()" style="background: #e74c3c; color: white; border: none; font-weight: 600; padding: 0.7rem 1.2rem; border-radius: 5px; cursor: pointer; white-space: nowrap; transition: background 0.3s;">Logout</button>
            `;
        } else {
            // Visitor navigation
            navHTML = `
                <a href="${getPagePath('index.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Home</a>
                <a href="${getPagePath('demo.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Create Invoice</a>
                <a href="${getPagePath('features.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Features</a>
                <a href="${getPagePath('login.html')}" style="text-decoration: none; color: white; font-weight: 600; padding: 0.7rem 1.2rem; background: #5b62b5; border-radius: 5px; white-space: nowrap; display: inline-block; transition: background 0.3s;">Sign In</a>
            `;
        }
        
        navMenu.innerHTML = navHTML;
    } catch (e) {
        console.error('Error initializing navigation:', e);
    }
}

/**
 * Try to initialize navigation with retry logic
 * Waits for DOM to be fully ready before initializing
 */
function tryInitializeNavigation() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) {
        // Wait a bit more for DOM to be ready
        setTimeout(tryInitializeNavigation, 100);
        return;
    }
    initializeNavigation();
    
    // Add debug info
    const user = AuthManager.getCurrentUser();
    const isLoggedIn = AuthManager.isLoggedIn();
    console.log('🔍 DEBUG: isLoggedIn =', isLoggedIn);
    console.log('🔍 DEBUG: currentUser =', user);
    console.log('🔍 DEBUG: localStorage.currentUser =', localStorage.getItem('currentUser'));
}

/**
 * Handle logo click - navigate to home
 */
function initializeLogoClickHandler() {
    const navBrand = document.getElementById('navBrand');
    if (navBrand) {
        navBrand.addEventListener('click', function() {
            const isLoggedIn = AuthManager.isLoggedIn();
            if (isLoggedIn) {
                window.location.href = getPagePath('dashboard.html');
            } else {
                window.location.href = getPagePath('index.html');
            }
        });
    }
}

/**
 * Handle logout
 * Clears user session and redirects to home
 */
window.handleLogout = function() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 LOGOUT: Clearing session...');
        AuthManager.logout();
        console.log('🚪 LOGOUT: Redirecting to index.html');
        setTimeout(() => {
            window.location.href = getPagePath('index.html');
        }, 100);
    }
};

// Initialize navigation on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tryInitializeNavigation();
        initializeLogoClickHandler();
    });
} else {
    tryInitializeNavigation();
    initializeLogoClickHandler();
}

// Add smooth scrolling effect for anchor links only
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        // Only prevent default for anchor links (starting with #)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // Let regular page links navigate normally
    });
});
