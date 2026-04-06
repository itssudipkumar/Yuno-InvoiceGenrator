/**
 * =============================================
 * DEMO PAGE INITIALIZATION
 * Handles page setup and user authentication
 * =============================================
 */

/**
 * Initialize the demo page
 * - Check for logged-in user
 * - Show/hide visitor banner
 * - Auto-populate user information
 */
function initializeDemoPage() {
    const user = AuthManager.getCurrentUser();
    const visitorBanner = document.getElementById('visitorBanner');
    
    if (!user) {
        // User is not logged in - Show visitor warning
        if (visitorBanner) {
            visitorBanner.style.display = 'block';
            visitorBanner.classList.add('show');
        }
    } else {
        // User is logged in - Hide visitor warning
        if (visitorBanner) {
            visitorBanner.style.display = 'none';
        }
        
        // Auto-populate business information from user profile
        document.getElementById('businessName').value = user.businessName || '';
        document.getElementById('businessEmail').value = user.businessEmail || '';
        document.getElementById('businessPhone').value = user.businessPhone || '';
        document.getElementById('businessAddress').value = user.businessAddress || '';
    }
}

/**
 * Initialize form event listeners
 * Attach handlers for form submission and preview
 */
function initializeFormListeners() {
    const invoiceForm = document.getElementById('invoiceForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const previewBtn = document.getElementById('previewBtn');
    
    // Form submission handler
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Add item button handler
    if (addItemBtn) {
        addItemBtn.addEventListener('click', handleAddItem);
    }
    
    // Preview button handler
    if (previewBtn) {
        previewBtn.addEventListener('click', handlePreview);
    }
}

/**
 * Initialize modal close functionality
 */
function initializeModalHandlers() {
    const modal = document.getElementById('previewModal');
    const closeBtn = document.querySelector('.modal-content .close');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => closeModal(modal));
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }
}

/**
 * Close modal helper function
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Placeholder handlers - these will be replaced by actual implementations
 */
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    // Implementation in scripts.js
}

function handleAddItem() {
    console.log('Add item clicked');
    // Implementation in scripts.js
}

function handlePreview() {
    console.log('Preview clicked');
    // Implementation in scripts.js
}

/**
 * DOM Ready Check & Initialization
 * Run initialization when DOM is fully loaded
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeDemoPage();
        initializeFormListeners();
        initializeModalHandlers();
    });
} else {
    // DOM is already loaded
    initializeDemoPage();
    initializeFormListeners();
    initializeModalHandlers();
}
