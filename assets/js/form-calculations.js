/**
 * =============================================
 * INVOICE FORM CALCULATIONS
 * Handles all calculations: subtotal, tax, total
 * =============================================
 */

/**
 * Calculate line item total
 * @param {number} quantity - Item quantity
 * @param {number} unitPrice - Unit price
 * @returns {number} Total amount
 */
function calculateLineItemTotal(quantity, unitPrice) {
    return (quantity || 0) * (unitPrice || 0);
}

/**
 * Calculate invoice subtotal
 * Sums all line item totals
 * @returns {number} Subtotal amount
 */
function calculateSubtotal() {
    const itemsBody = document.getElementById('itemsBody');
    if (!itemsBody) return 0;
    
    let subtotal = 0;
    const rows = itemsBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const quantityInput = row.querySelector('input[data-quantity]');
        const priceInput = row.querySelector('input[data-price]');
        
        if (quantityInput && priceInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            subtotal += calculateLineItemTotal(quantity, price);
        }
    });
    
    return subtotal;
}

/**
 * Calculate tax amount
 * @param {number} subtotal - Invoice subtotal
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Tax amount
 */
function calculateTaxAmount(subtotal, taxRate) {
    return (subtotal * (taxRate || 0)) / 100;
}

/**
 * Calculate total amount
 * @param {number} subtotal - Invoice subtotal
 * @param {number} taxAmount - Tax amount
 * @returns {number} Total invoice amount
 */
function calculateTotal(subtotal, taxAmount) {
    return subtotal + (taxAmount || 0);
}

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

/**
 * Update all totals on the page
 * Recalculates and displays subtotal, tax, and total
 */
function updateTotals() {
    const subtotalElement = document.getElementById('subtotal');
    const taxAmountElement = document.getElementById('taxAmount');
    const totalElement = document.getElementById('total');
    const taxRateInput = document.getElementById('taxRate');
    
    // Calculate values
    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(taxRateInput?.value) || 0;
    const taxAmount = calculateTaxAmount(subtotal, taxRate);
    const total = calculateTotal(subtotal, taxAmount);
    
    // Update display
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (taxAmountElement) taxAmountElement.textContent = formatCurrency(taxAmount);
    if (totalElement) totalElement.textContent = formatCurrency(total);
}

/**
 * Initialize calculation event listeners
 * Attach change handlers to form inputs
 */
function initializeCalculationListeners() {
    const taxRateInput = document.getElementById('taxRate');
    const itemsBody = document.getElementById('itemsBody');
    
    // Tax rate change
    if (taxRateInput) {
        taxRateInput.addEventListener('change', updateTotals);
    }
    
    // Item changes
    if (itemsBody) {
        itemsBody.addEventListener('change', (e) => {
            if (e.target.tagName === 'INPUT') {
                updateTotals();
            }
        });
    }
}

/**
 * Add line item row to table
 * Creates a new row for adding invoice items
 */
function addItemRow() {
    const itemsBody = document.getElementById('itemsBody');
    if (!itemsBody) return;
    
    const rowCount = itemsBody.querySelectorAll('tr').length + 1;
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>
            <input type="text" placeholder="Item description" data-description>
        </td>
        <td>
            <input type="number" placeholder="Qty" data-quantity min="1" value="1">
        </td>
        <td>
            <input type="number" placeholder="$0.00" data-price min="0" step="0.01" value="0.00">
        </td>
        <td>
            <span class="amount">$0.00</span>
        </td>
        <td>
            <button type="button" class="btn-delete" onclick="removeItemRow(this)">Delete</button>
        </td>
    `;
    
    itemsBody.appendChild(row);
    
    // Add change listener to new row inputs
    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', updateTotals);
        input.addEventListener('input', updateTotals);
    });
    
    updateTotals();
}

/**
 * Remove line item row from table
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
 * Initialize on page load
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCalculationListeners);
} else {
    initializeCalculationListeners();
}
