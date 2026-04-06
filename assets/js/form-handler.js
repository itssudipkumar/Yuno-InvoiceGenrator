/**
 * =============================================
 * FORM HANDLER
 * Handles invoice form submission, item management, and calculations
 * =============================================
 */

// Cache for frequently used DOM elements
let invoiceForm = null;
let invoiceFormCache = {};

/**
 * Initialize invoice form
 * Sets up form elements and event listeners
 */
function initializeInvoiceForm() {
    invoiceForm = document.getElementById('invoiceForm');
    if (!invoiceForm) return;
    
    // Cache commonly used elements
    invoiceFormCache = {
        addItemBtn: document.getElementById('addItemBtn'),
        itemsBody: document.getElementById('itemsBody'),
        taxRateInput: document.getElementById('taxRate'),
        previewBtn: document.getElementById('previewBtn'),
        previewModal: document.getElementById('previewModal'),
        savedClientSelect: document.getElementById('savedClient'),
        downloadPdfBtn: document.getElementById('downloadPdfBtn'),
        printBtn: document.getElementById('printBtn')
    };
    
    // Add initial empty item row
    addItemRow();
    
    // Set today's date as default
    const invoiceDateInput = document.getElementById('invoiceDate');
    if (invoiceDateInput) {
        invoiceDateInput.valueAsDate = new Date();
    }
    
    // Load saved clients into dropdown
    loadSavedClientsDropdown();
    
    // Add event listeners
    if (invoiceFormCache.addItemBtn) {
        invoiceFormCache.addItemBtn.addEventListener('click', addItemRow);
    }
    
    if (invoiceFormCache.taxRateInput) {
        invoiceFormCache.taxRateInput.addEventListener('change', updateTotals);
    }
    
    if (invoiceFormCache.previewBtn) {
        invoiceFormCache.previewBtn.addEventListener('click', previewInvoice);
    }
    
    invoiceForm.addEventListener('submit', handleInvoiceSubmit);
    invoiceForm.addEventListener('input', updateTotals);
    
    if (invoiceFormCache.savedClientSelect) {
        invoiceFormCache.savedClientSelect.addEventListener('change', populateClientFields);
    }
    
    // Close modal buttons
    const closeModals = document.querySelectorAll('.close, .close-modal');
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            if (invoiceFormCache.previewModal) {
                invoiceFormCache.previewModal.classList.add('hidden');
            }
        });
    });
    
    if (invoiceFormCache.downloadPdfBtn) {
        invoiceFormCache.downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    
    if (invoiceFormCache.printBtn) {
        invoiceFormCache.printBtn.addEventListener('click', printInvoice);
    }
}

/**
 * Add a new line item row to the invoice table
 */
function addItemRow() {
    const itemsBody = invoiceFormCache.itemsBody || document.getElementById('itemsBody');
    if (!itemsBody) return;
    
    const row = document.createElement('tr');
    row.className = 'item-row';
    row.innerHTML = `
        <td><input type="text" class="description" placeholder="Item description"></td>
        <td><input type="number" class="quantity" placeholder="Qty" min="0" value="1"></td>
        <td><input type="number" class="unitPrice" placeholder="Price" min="0" step="0.01" value="0.00"></td>
        <td class="amount">$0.00</td>
        <td><button type="button" class="btn-delete" onclick="removeItemRow(this)">Remove</button></td>
    `;
    
    const quantityInput = row.querySelector('.quantity');
    const unitPriceInput = row.querySelector('.unitPrice');
    
    quantityInput.addEventListener('input', updateTotals);
    unitPriceInput.addEventListener('input', updateTotals);
    
    itemsBody.appendChild(row);
    updateTotals();
}

/**
 * Remove a line item row from the invoice table
 * @param {HTMLElement} button - Delete button element
 */
function removeItemRow(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        updateTotals();
    }
}

/**
 * Update all totals on the invoice form
 * Recalculates subtotal, tax, and grand total
 */
function updateTotals() {
    const itemsBody = invoiceFormCache.itemsBody || document.getElementById('itemsBody');
    const subtotalElement = document.getElementById('subtotal');
    const taxAmountElement = document.getElementById('taxAmount');
    const totalElement = document.getElementById('total');
    const taxRateInput = invoiceFormCache.taxRateInput || document.getElementById('taxRate');
    
    if (!itemsBody) return;
    
    let subtotal = 0;
    const rows = itemsBody.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.unitPrice').value) || 0;
        const amount = quantity * unitPrice;
        row.querySelector('.amount').textContent = formatCurrency(amount);
        subtotal += amount;
    });
    
    const taxRate = parseFloat(taxRateInput?.value) || 0;
    const taxAmount = calculatePercentage(subtotal, taxRate);
    const total = subtotal + taxAmount;
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (taxAmountElement) taxAmountElement.textContent = formatCurrency(taxAmount);
    if (totalElement) totalElement.textContent = formatCurrency(total);
}

/**
 * Collect all invoice data from the form
 * @returns {Object} Invoice data object
 */
function getInvoiceData() {
    const items = [];
    const itemsBody = invoiceFormCache.itemsBody || document.getElementById('itemsBody');
    
    const rows = itemsBody?.querySelectorAll('.item-row') || [];
    rows.forEach(row => {
        const description = row.querySelector('.description').value;
        const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.unitPrice').value) || 0;
        
        if (description && quantity > 0 && unitPrice > 0) {
            items.push({
                description,
                quantity,
                unitPrice,
                amount: quantity * unitPrice
            });
        }
    });
    
    const taxRateInput = invoiceFormCache.taxRateInput || document.getElementById('taxRate');
    const taxRate = parseFloat(taxRateInput?.value) || 0;
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.amount;
    });
    const taxAmount = calculatePercentage(subtotal, taxRate);
    const total = subtotal + taxAmount;
    
    return {
        invoiceNumber: document.getElementById('invoiceNumber')?.value || '',
        invoiceDate: document.getElementById('invoiceDate')?.value || '',
        dueDate: document.getElementById('dueDate')?.value || '',
        businessName: document.getElementById('businessName')?.value || '',
        businessEmail: document.getElementById('businessEmail')?.value || '',
        businessPhone: document.getElementById('businessPhone')?.value || '',
        businessAddress: document.getElementById('businessAddress')?.value || '',
        clientName: document.getElementById('clientName')?.value || '',
        clientEmail: document.getElementById('clientEmail')?.value || '',
        clientPhone: document.getElementById('clientPhone')?.value || '',
        clientAddress: document.getElementById('clientAddress')?.value || '',
        items: items,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        notes: document.getElementById('notes')?.value || '',
        createdAt: new Date().toISOString()
    };
}

/**
 * Handle invoice form submission
 * @param {Event} e - Form submit event
 */
function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const invoiceData = getInvoiceData();
    
    if (!invoiceData.invoiceNumber || !invoiceData.businessName || !invoiceData.clientName || invoiceData.items.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
    }
    
    // Save to local storage
    if (saveInvoice(invoiceData)) {
        alert('Invoice saved successfully!');
        invoiceForm.reset();
        const itemsBody = invoiceFormCache.itemsBody || document.getElementById('itemsBody');
        if (itemsBody) {
            itemsBody.innerHTML = '';
            addItemRow();
        }
        const invoiceDateInput = document.getElementById('invoiceDate');
        if (invoiceDateInput) {
            invoiceDateInput.valueAsDate = new Date();
        }
        updateTotals();
    }
}

/**
 * Load saved clients dropdown
 */
function loadSavedClientsDropdown() {
    const savedClientSelect = invoiceFormCache.savedClientSelect || document.getElementById('savedClient');
    if (!savedClientSelect) return;
    
    try {
        const clients = loadAllClients();
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name + (client.company ? ` (${client.company})` : '');
            savedClientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading saved clients:', error);
    }
}

/**
 * Populate client form fields from saved client
 */
function populateClientFields() {
    const savedClientSelect = invoiceFormCache.savedClientSelect || document.getElementById('savedClient');
    if (!savedClientSelect || !savedClientSelect.value) return;
    
    try {
        const client = getClientById(parseInt(savedClientSelect.value));
        if (client) {
            const clientNameInput = document.getElementById('clientName');
            const clientEmailInput = document.getElementById('clientEmail');
            const clientPhoneInput = document.getElementById('clientPhone');
            const clientAddressInput = document.getElementById('clientAddress');
            
            if (clientNameInput) clientNameInput.value = client.name;
            if (clientEmailInput) clientEmailInput.value = client.email || '';
            if (clientPhoneInput) clientPhoneInput.value = client.phone || '';
            if (clientAddressInput) clientAddressInput.value = client.address || '';
        }
    } catch (error) {
        console.error('Error populating client fields:', error);
    }
}

/**
 * Preview invoice
 * @param {Event} e - Button click event
 */
function previewInvoice(e) {
    e.preventDefault();
    const invoiceData = getInvoiceData();
    
    if (!invoiceData.invoiceNumber || !invoiceData.businessName || !invoiceData.clientName || invoiceData.items.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
    }
    
    const previewContent = generateInvoiceHTML(invoiceData);
    const invoicePreview = document.getElementById('invoicePreview');
    if (invoicePreview) {
        invoicePreview.innerHTML = previewContent;
    }
    
    const previewModal = invoiceFormCache.previewModal || document.getElementById('previewModal');
    if (previewModal) {
        previewModal.classList.remove('hidden');
    }
}

/**
 * Generate invoice HTML
 * @param {Object} data - Invoice data
 * @returns {string} Invoice HTML
 */
function generateInvoiceHTML(data) {
    const itemsHTML = data.items.map(item => `
        <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.unitPrice)}</td>
            <td class="text-right">${formatCurrency(item.amount)}</td>
        </tr>
    `).join('');
    
    return `
        <div class="invoice-document">
            <div class="invoice-header">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-info">
                    <div><strong>${data.invoiceNumber}</strong></div>
                    <div>Date: ${formatDate(data.invoiceDate)}</div>
                    <div>Due: ${formatDate(data.dueDate)}</div>
                </div>
            </div>
            
            <div class="invoice-body">
                <div class="invoice-section">
                    <strong>FROM:</strong><br>
                    ${data.businessName}<br>
                    ${data.businessEmail}<br>
                    ${data.businessPhone}<br>
                    ${data.businessAddress}
                </div>
                
                <div class="invoice-section">
                    <strong>BILL TO:</strong><br>
                    ${data.clientName}<br>
                    ${data.clientEmail}<br>
                    ${data.clientPhone}<br>
                    ${data.clientAddress}
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="invoice-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(data.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (${data.taxRate}%):</span>
                    <span>${formatCurrency(data.taxAmount)}</span>
                </div>
                <div class="total-row final">
                    <span><strong>TOTAL:</strong></span>
                    <span><strong>${formatCurrency(data.total)}</strong></span>
                </div>
            </div>
            
            ${data.notes ? `<div class="invoice-notes"><strong>Notes:</strong><br>${data.notes}</div>` : ''}
        </div>
    `;
}

/**
 * Download invoice as PDF
 * (Requires external library like jsPDF)
 */
function downloadPDF() {
    alert('PDF download functionality requires an external library like jsPDF. This feature will be available in the full version.');
}

/**
 * Print invoice
 */
function printInvoice() {
    const invoicePreview = document.getElementById('invoicePreview');
    if (!invoicePreview) return;
    
    const printContent = invoicePreview.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<!DOCTYPE html><html><head><link rel="stylesheet" href="assets/css/core.css"></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Initialize form when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInvoiceForm);
} else {
    initializeInvoiceForm();
}
