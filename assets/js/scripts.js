// ============ AUTHENTICATION SYSTEM ============
class AuthManager {
    static register(email, password, businessName) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
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
            localStorage.setItem('users', JSON.stringify(users));
            console.log('✅ REGISTER SUCCESS: New user:', user);
            return { success: true, message: 'Registration successful' };
        } catch (e) {
            console.error('❌ REGISTER ERROR:', e);
            return { success: false, message: 'Registration failed' };
        }
    }
    
    static login(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === btoa(password));
            
            if (!user) {
                return { success: false, message: 'Invalid email or password' };
            }
            
            const userData = JSON.stringify(user);
            localStorage.setItem('currentUser', userData);
            console.log('✅ LOGIN SUCCESS: User stored as:', user);
            return { success: true, message: 'Login successful', user: user };
        } catch (e) {
            console.error('❌ LOGIN ERROR:', e);
            return { success: false, message: 'Login failed' };
        }
    }
    
    static logout() {
        localStorage.removeItem('currentUser');
    }
    
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
    
    static isLoggedIn() {
        return !!this.getCurrentUser();
    }
}

// Helper function to get the correct path prefix
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

// Check authentication on page load
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

// ============ DYNAMIC NAVIGATION ============
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
                <a href="${getPagePath('demo.html')}" style="text-decoration: none; color: #2c3e50; font-weight: 600; padding: 0.5rem 0; white-space: nowrap; transition: color 0.3s;">Create Invoice</a>
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

// Initialize navigation on page load
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInitializeNavigation);
} else {
    tryInitializeNavigation();
}

// Logo click handler - navigate to home
document.addEventListener('DOMContentLoaded', function() {
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
});

// Logout handler
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

// ============ DARK MODE TOGGLE ============
// Dark Mode Toggle Functionality
function initializeDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme on load
    applyTheme(savedTheme);
    
    // Add toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const currentTheme = localStorage.getItem('theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function applyTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeToggle) themeToggle.classList.add('dark-mode-on');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeToggle) themeToggle.classList.remove('dark-mode-on');
    }
}

// Initialize dark mode when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    initializeDarkMode();
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

// Invoice Generator Functionality
const invoiceForm = document.getElementById('invoiceForm');
const addItemBtn = document.getElementById('addItemBtn');
const itemsBody = document.getElementById('itemsBody');
const taxRateInput = document.getElementById('taxRate');
const previewBtn = document.getElementById('previewBtn');
const previewModal = document.getElementById('previewModal');
const closeModals = document.querySelectorAll('.close, .close-modal');
const savedClientSelect = document.getElementById('savedClient');

// Initialize invoice form if it exists
if (invoiceForm) {
    // Add initial empty item row
    addItemRow();
    
    // Set today's date as default
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Load saved clients into dropdown
    loadSavedClientsDropdown();
    
    // Add event listeners
    addItemBtn.addEventListener('click', addItemRow);
    taxRateInput.addEventListener('change', updateTotals);
    previewBtn.addEventListener('click', previewInvoice);
    invoiceForm.addEventListener('submit', handleInvoiceSubmit);
    invoiceForm.addEventListener('input', updateTotals);
    
    if (savedClientSelect) {
        savedClientSelect.addEventListener('change', populateClientFields);
    }

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            previewModal.classList.add('hidden');
        });
    });

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const printBtn = document.getElementById('printBtn');
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    if (printBtn) {
        printBtn.addEventListener('click', printInvoice);
    }
}

function addItemRow() {
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

function removeItemRow(btn) {
    btn.parentElement.parentElement.remove();
    updateTotals();
}

function loadSavedClientsDropdown() {
    if (!savedClientSelect) return;
    
    try {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const currentOptions = savedClientSelect.innerHTML;
        
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

function populateClientFields() {
    if (!savedClientSelect || !savedClientSelect.value) return;
    
    try {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const selectedClient = clients.find(c => c.id == savedClientSelect.value);
        
        if (selectedClient) {
            document.getElementById('clientName').value = selectedClient.name;
            document.getElementById('clientEmail').value = selectedClient.email;
            document.getElementById('clientPhone').value = selectedClient.phone || '';
            document.getElementById('clientAddress').value = selectedClient.address || '';
        }
    } catch (error) {
        console.error('Error populating client fields:', error);
    }
}

function updateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.unitPrice').value) || 0;
        const amount = quantity * unitPrice;
        row.querySelector('.amount').textContent = '$' + amount.toFixed(2);
        subtotal += amount;
    });
    
    const taxRate = parseFloat(taxRateInput.value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('taxAmount').textContent = '$' + taxAmount.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

function getInvoiceData() {
    const items = [];
    const rows = document.querySelectorAll('.item-row');
    
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
    
    const taxRate = parseFloat(taxRateInput.value) || 0;
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.amount;
    });
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    return {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('dueDate').value,
        businessName: document.getElementById('businessName').value,
        businessEmail: document.getElementById('businessEmail').value,
        businessPhone: document.getElementById('businessPhone').value,
        businessAddress: document.getElementById('businessAddress').value,
        clientName: document.getElementById('clientName').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientPhone: document.getElementById('clientPhone').value,
        clientAddress: document.getElementById('clientAddress').value,
        items: items,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        notes: document.getElementById('notes').value,
        createdAt: new Date().toISOString()
    };
}

function previewInvoice(e) {
    e.preventDefault();
    const invoiceData = getInvoiceData();
    
    if (!invoiceData.invoiceNumber || !invoiceData.businessName || !invoiceData.clientName || invoiceData.items.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
    }
    
    const previewContent = generateInvoiceHTML(invoiceData);
    document.getElementById('invoicePreview').innerHTML = previewContent;
    previewModal.classList.remove('hidden');
}

function generateInvoiceHTML(data) {
    const itemsHTML = data.items.map(item => `
        <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
            <td class="text-right">$${item.amount.toFixed(2)}</td>
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
                    <span>$${data.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (${data.taxRate}%):</span>
                    <span>$${data.taxAmount.toFixed(2)}</span>
                </div>
                <div class="total-row final">
                    <span><strong>TOTAL:</strong></span>
                    <span><strong>$${data.total.toFixed(2)}</strong></span>
                </div>
            </div>
            
            ${data.notes ? `<div class="invoice-notes"><strong>Notes:</strong><br>${data.notes}</div>` : ''}
        </div>
    `;
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const invoiceData = getInvoiceData();
    
    if (!invoiceData.invoiceNumber || !invoiceData.businessName || !invoiceData.clientName || invoiceData.items.length === 0) {
        alert('Please fill in all required fields and add at least one item.');
        return;
    }
    
    // Save to local storage
    saveInvoice(invoiceData);
    
    alert('Invoice saved successfully!');
    invoiceForm.reset();
    itemsBody.innerHTML = '';
    addItemRow();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    updateTotals();
}

function saveInvoice(invoiceData) {
    try {
        let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoiceData.id = Date.now();
        invoices.push(invoiceData);
        localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please check your browser storage.');
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function downloadPDF() {
    alert('PDF download functionality requires an external library like jsPDF. This feature will be available in the full version.');
}

function printInvoice() {
    const printContent = document.getElementById('invoicePreview').innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css"></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}

// Dashboard Functionality
const dashboardTable = document.getElementById('invoicesTable');
const filterInput = document.getElementById('filterInput');
const deleteAllBtn = document.getElementById('deleteAllBtn');

if (dashboardTable) {
    loadInvoices();
    
    if (filterInput) {
        filterInput.addEventListener('keyup', filterInvoices);
    }
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllInvoices);
    }
}

function loadInvoices() {
    try {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const tbody = dashboardTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No invoices found. <a href="' + getPagePath('demo.html') + '">Create one</a></td></tr>';
            return;
        }
        
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.clientName}</td>
                <td>${formatDate(invoice.invoiceDate)}</td>
                <td>${formatDate(invoice.dueDate)}</td>
                <td>$${invoice.total.toFixed(2)}</td>
                <td>Unpaid</td>
                <td>
                    <button class="btn-small" onclick="viewInvoice(${invoice.id})">View</button>
                    <button class="btn-small btn-delete" onclick="deleteInvoice(${invoice.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading invoices:', error);
        dashboardTable.querySelector('tbody').innerHTML = '<tr><td colspan="8" class="text-center">Error loading invoices.</td></tr>';
    }
}

function viewInvoice(id) {
    try {
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const invoice = invoices.find(inv => inv.id === id);
        
        if (invoice) {
            const previewContent = generateInvoiceHTML(invoice);
            document.getElementById('invoicePreview').innerHTML = previewContent;
            previewModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error viewing invoice:', error);
        alert('Error loading invoice. Please try again.');
    }
}

function deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        try {
            let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            invoices = invoices.filter(inv => inv.id !== id);
            localStorage.setItem('invoices', JSON.stringify(invoices));
            loadInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Error deleting invoice. Please try again.');
        }
    }
}

function filterInvoices() {
    const filterValue = filterInput.value.toLowerCase();
    const rows = dashboardTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filterValue) ? '' : 'none';
    });
}

function deleteAllInvoices() {
    if (confirm('Are you sure you want to delete ALL invoices? This cannot be undone.')) {
        localStorage.removeItem('invoices');
        loadInvoices();
    }
}

// ============ CAROUSEL FUNCTIONALITY ============
let currentSlide = 0;
let totalSlides = 0;
let isTransitioning = false;

function initializeCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    const slides = carouselTrack.querySelectorAll('.carousel-slide:not(.carousel-clone)');
    totalSlides = slides.length;
    
    if (totalSlides <= 1) return;
    
    // Clone first and last slides for infinite effect
    const firstSlide = slides[0].cloneNode(true);
    const lastSlide = slides[totalSlides - 1].cloneNode(true);
    
    firstSlide.classList.add('carousel-clone');
    lastSlide.classList.add('carousel-clone');
    
    carouselTrack.appendChild(firstSlide);
    carouselTrack.insertBefore(lastSlide, slides[0]);
    
    // Start at position 1 (the real first slide, after the cloned last slide)
    currentSlide = 1;
    updateCarouselPosition(true);
    
    // Create dots for original slides only
    const carouselDots = document.getElementById('carouselDots');
    if (carouselDots) {
        carouselDots.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.onclick = () => goToSlide(i);
            carouselDots.appendChild(dot);
        }
    }
    
    // Auto-slide every 5 seconds
    setInterval(autoSlide, 5000);
}

function updateCarouselPosition(instant = false) {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    const slideWidth = carouselTrack.querySelector('.carousel-slide').offsetWidth + 32; // 32 is the gap
    const offset = -currentSlide * slideWidth;
    
    if (instant) {
        carouselTrack.style.transition = 'none';
    } else {
        carouselTrack.style.transition = 'transform 0.5s ease-in-out';
    }
    
    carouselTrack.style.transform = `translateX(${offset}px)`;
    
    // Update dots based on actual slide position (accounting for clone)
    const actualSlide = ((currentSlide - 1) % totalSlides + totalSlides) % totalSlides;
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === actualSlide);
    });
}

function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    currentSlide++;
    updateCarouselPosition(false);
    
    // Check if we need to loop back
    setTimeout(() => {
        if (currentSlide > totalSlides) {
            currentSlide = 1;
            updateCarouselPosition(true);
        }
        isTransitioning = false;
    }, 500);
}

function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    
    currentSlide--;
    updateCarouselPosition(false);
    
    // Check if we need to loop forward
    setTimeout(() => {
        if (currentSlide < 1) {
            currentSlide = totalSlides;
            updateCarouselPosition(true);
        }
        isTransitioning = false;
    }, 500);
}

function goToSlide(index) {
    if (isTransitioning) return;
    currentSlide = index + 1; // +1 because of cloned last slide at position 0
    updateCarouselPosition(false);
}

function autoSlide() {
    nextSlide();
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
} else {
    initializeCarousel();
}
