/**
 * =============================================
 * INVOICE MANAGER
 * Handles invoice CRUD operations and storage
 * =============================================
 */

/**
 * Save an invoice to localStorage
 * @param {Object} invoiceData - Invoice object
 * @returns {boolean} Success status
 */
function saveInvoice(invoiceData) {
    try {
        let invoices = getStorageData('invoices', []);
        invoiceData.id = Date.now();
        invoices.push(invoiceData);
        return setStorageData('invoices', invoices);
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please check your browser storage.');
        return false;
    }
}

/**
 * Load all invoices from localStorage
 * @returns {Array} Array of invoice objects
 */
function loadAllInvoices() {
    return getStorageData('invoices', []);
}

/**
 * Get a specific invoice by ID
 * @param {number} id - Invoice ID
 * @returns {Object|null} Invoice object or null if not found
 */
function getInvoiceById(id) {
    const invoices = loadAllInvoices();
    return invoices.find(inv => inv.id === id) || null;
}

/**
 * Delete an invoice by ID
 * @param {number} id - Invoice ID
 * @returns {boolean} Success status
 */
function deleteInvoiceById(id) {
    try {
        let invoices = loadAllInvoices();
        invoices = invoices.filter(inv => inv.id !== id);
        return setStorageData('invoices', invoices);
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return false;
    }
}

/**
 * Delete all invoices
 * @returns {boolean} Success status
 */
function deleteAllInvoices() {
    try {
        localStorage.removeItem('invoices');
        return true;
    } catch (error) {
        console.error('Error deleting all invoices:', error);
        return false;
    }
}

/**
 * Load saved clients from localStorage
 * @returns {Array} Array of client objects
 */
function loadAllClients() {
    return getStorageData('clients', []);
}

/**
 * Get a specific client by ID
 * @param {number} id - Client ID
 * @returns {Object|null} Client object or null if not found
 */
function getClientById(id) {
    const clients = loadAllClients();
    return clients.find(c => c.id === id) || null;
}

/**
 * Save a client to localStorage
 * @param {Object} clientData - Client object
 * @returns {boolean} Success status
 */
function saveClient(clientData) {
    try {
        let clients = loadAllClients();
        clientData.id = Date.now();
        clients.push(clientData);
        return setStorageData('clients', clients);
    } catch (error) {
        console.error('Error saving client:', error);
        return false;
    }
}

/**
 * Delete a client by ID
 * @param {number} id - Client ID
 * @returns {boolean} Success status
 */
function deleteClientById(id) {
    try {
        let clients = loadAllClients();
        clients = clients.filter(c => c.id !== id);
        return setStorageData('clients', clients);
    } catch (error) {
        console.error('Error deleting client:', error);
        return false;
    }
}

/**
 * Search invoices by query string
 * @param {string} query - Search query
 * @returns {Array} Filtered invoices
 */
function searchInvoices(query) {
    const invoices = loadAllInvoices();
    const lowerQuery = query.toLowerCase();
    return invoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        invoice.clientName.toLowerCase().includes(lowerQuery) ||
        invoice.businessName.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Search clients by query string
 * @param {string} query - Search query
 * @returns {Array} Filtered clients
 */
function searchClients(query) {
    const clients = loadAllClients();
    const lowerQuery = query.toLowerCase();
    return clients.filter(client => 
        client.name.toLowerCase().includes(lowerQuery) ||
        (client.company && client.company.toLowerCase().includes(lowerQuery)) ||
        (client.email && client.email.toLowerCase().includes(lowerQuery))
    );
}
