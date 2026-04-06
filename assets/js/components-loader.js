/**
 * =============================================
 * COMPONENT LOADER
 * Dynamically loads reusable components (footer, etc.)
 * =============================================
 */

/**
 * Load external HTML components
 * Fetches and injects component HTML into corresponding containers
 */
async function loadComponents() {
    try {
        // Determine correct path based on current location
        const currentPath = window.location.pathname;
        const pathPrefix = currentPath.includes('/pages/') ? '../' : '';
        
        // Load footer
        const footerResponse = await fetch(pathPrefix + 'components/footer.html');
        const footerContent = await footerResponse.text();
        const footerContainer = document.querySelector('footer');
        if (footerContainer) {
            footerContainer.innerHTML = footerContent.replace('<footer>', '').replace('</footer>', '');
        }
    } catch (error) {
        console.log('Components loaded from inline content or not available');
    }
}

/**
 * Load components when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}
