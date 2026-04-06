/**
 * =============================================
 * DASHBOARD MANAGER
 * Handles invoice display, filtering, and management
 * =============================================
 */

let dashboardState = {
    table: null,
    filterInput: null,
    deleteAllBtn: null
};

/**
 * Initialize dashboard
 * Sets up table and event listeners
 */
function initializeDashboard() {
    dashboardState.table = document.getElementById('invoicesTable');
    dashboardState.filterInput = document.getElementById('filterInput');
    dashboardState.deleteAllBtn = document.getElementById('deleteAllBtn');
    
    if (!dashboardState.table) return;
    
    loadInvoicesTable();
    
    if (dashboardState.filterInput) {
        dashboardState.filterInput.addEventListener('keyup', filterInvoices);
    }
    
    if (dashboardState.deleteAllBtn) {
        dashboardState.deleteAllBtn.addEventListener('click', handleDeleteAllInvoices);
    }
}

/**
 * Load invoices and populate table
 */
function loadInvoicesTable() {
    if (!dashboardState.table) return;
    
    try {
        const invoices = loadAllInvoices();
        const tbody = dashboardState.table.querySelector('tbody');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (invoices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">No invoices found. <a href="${getPagePath('demo.html')}">Create one</a></td></tr>`;
            return;
        }
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(invoice.invoiceNumber)}</td>
                <td>${escapeHtml(invoice.clientName)}</td>
                <td>${formatDate(invoice.invoiceDate)}</td>
                <td>${formatDate(invoice.dueDate)}</td>
                <td>${formatCurrency(invoice.total)}</td>
                <td><span class="status-badge pending">Unpaid</span></td>
                <td>
                    <button class="btn-small" onclick="handleViewInvoice(${invoice.id})">View</button>
                    <button class="btn-small btn-delete" onclick="handleDeleteInvoice(${invoice.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading invoices:', error);
        const tbody = dashboardState.table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading invoices.</td></tr>';
        }
    }
}

/**
 * View invoice in modal
 * @param {number} id - Invoice ID
 */
function handleViewInvoice(id) {
    try {
        const invoice = getInvoiceById(id);
        
        if (invoice) {
            const previewContent = generateInvoiceHTML(invoice);
            const invoicePreview = document.getElementById('invoicePreview');
            if (invoicePreview) {
                invoicePreview.innerHTML = previewContent;
            }
            
            const previewModal = document.getElementById('previewModal');
            if (previewModal) {
                previewModal.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error viewing invoice:', error);
        alert('Error loading invoice. Please try again.');
    }
}

/**
 * Delete invoice
 * @param {number} id - Invoice ID
 */
function handleDeleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        try {
            if (deleteInvoiceById(id)) {
                loadInvoicesTable();
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Error deleting invoice. Please try again.');
        }
    }
}

/**
 * Filter invoices by search query
 */
function filterInvoices() {
    if (!dashboardState.table || !dashboardState.filterInput) return;
    
    const filterValue = dashboardState.filterInput.value.toLowerCase();
    const rows = dashboardState.table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filterValue) ? '' : 'none';
    });
}

/**
 * Delete all invoices
 */
function handleDeleteAllInvoices() {
    if (confirm('Are you sure you want to delete ALL invoices? This cannot be undone.')) {
        try {
            if (deleteAllInvoices()) {
                loadInvoicesTable();
            }
        } catch (error) {
            console.error('Error deleting all invoices:', error);
            alert('Error deleting invoices. Please try again.');
        }
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
