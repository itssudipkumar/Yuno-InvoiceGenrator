/**
 * =============================================
 * AUTHENTICATION MANAGER
 * Handles user registration, login, and session management
 * =============================================
 */

class AuthManager {
    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} businessName - Business name
     * @returns {Object} Result object with success flag and message
     */
    static register(email, password, businessName) {
        try {
            const users = getStorageData('users', []);
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                return { success: false, message: 'Email already registered' };
            }
            
            const user = {
                id: Date.now(),
                email: email,
                password: btoa(password), // Simple encoding (not secure for production)
                businessName: businessName,
                createdAt: new Date().toISOString()
            };
            
            users.push(user);
            setStorageData('users', users);
            console.log('✅ REGISTER SUCCESS: New user:', user);
            return { success: true, message: 'Registration successful' };
        } catch (e) {
            console.error('❌ REGISTER ERROR:', e);
            return { success: false, message: 'Registration failed' };
        }
    }
    
    /**
     * Log in a user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Object} Result object with success flag, message, and user data
     */
    static login(email, password) {
        try {
            const users = getStorageData('users', []);
            const user = users.find(u => u.email === email && u.password === btoa(password));
            
            if (!user) {
                return { success: false, message: 'Invalid email or password' };
            }
            
            setStorageData('currentUser', user);
            console.log('✅ LOGIN SUCCESS: User stored as:', user);
            return { success: true, message: 'Login successful', user: user };
        } catch (e) {
            console.error('❌ LOGIN ERROR:', e);
            return { success: false, message: 'Login failed' };
        }
    }
    
    /**
     * Log out the current user
     */
    static logout() {
        localStorage.removeItem('currentUser');
    }
    
    /**
     * Get the currently logged-in user
     * @returns {Object|null} User object or null if not logged in
     */
    static getCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error('Error parsing currentUser:', e);
            localStorage.removeItem('currentUser');
            return null;
        }
    }
    
    /**
     * Check if a user is logged in
     * @returns {boolean} True if logged in, false otherwise
     */
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }
}

/**
 * Check authentication on page load
 * Redirects users based on their login status
 */
function checkAuthentication() {
    const isLoggedIn = AuthManager.isLoggedIn();
    const currentPage = window.location.pathname;
    
    // Redirect logic based on page access
    // Dashboard, Clients pages require login
    if (!isLoggedIn && (currentPage.includes('dashboard.html') || currentPage.includes('clients.html') || currentPage.includes('account.html'))) {
        window.location.href = getPagePath('login.html') + '?redirect=' + currentPage;
    }
    
    // Redirect logged-in users from login page to dashboard
    if (isLoggedIn && currentPage.includes('login.html')) {
        window.location.href = getPagePath('dashboard.html');
    }
    
    // Redirect logged-in users from index to dashboard
    if (isLoggedIn && currentPage.includes('index.html')) {
        window.location.href = getPagePath('dashboard.html');
    }
}

// Initialize authentication on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthentication);
} else {
    checkAuthentication();
}
