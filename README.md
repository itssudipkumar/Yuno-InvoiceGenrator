# 📄 Yuno - Professional Invoice Generator

A modern, user-friendly web application for small businesses to generate professional invoices and manage their billing records. Built with vanilla HTML, CSS, and JavaScript with local storage for secure data management.

## 🎯 Overview

Yuno is a self-hosted invoice generation and tracking system designed for small business owners, freelancers, and entrepreneurs. Generate professional invoices, manage client profiles, and track all your billing in one convenient dashboard—all without needing a backend server or paying subscription fees.

## ✨ Features

### 📄 Professional Invoice Generation
- Create beautifully formatted invoices with your business details
- Add itemized line items with automatic calculations
- Professional invoice preview before saving
- Customizable tax rates per invoice
- Add custom notes and payment terms

### 👥 Client Profile Management
- Save and manage multiple client profiles
- Quick-select dropdown on invoice creation
- Edit and delete client information
- Search and filter through your clients
- Secure local storage of client data

### 🧮 Smart Calculations
- Real-time total calculations
- Automatic subtotal, tax, and grand total computation
- Dynamic line item management
- Add/remove items with live updates

### 📊 Invoice Dashboard
- View all invoices in one convenient location
- Dashboard statistics (total invoices, total amount, pending count)
- Search and filter invoices by invoice number or client name
- View, delete, or manage individual invoices
- Easy invoice tracking interface

### 💾 Secure Local Storage
- All data stored locally in browser
- No data transmitted to external servers
- Your business information stays private
- Data persists across browser sessions
- No account or login required to use

### 👁️ Invoice Preview
- Full-page invoice preview before saving
- Professional formatting and layout
- Print-ready invoice display
- Verify all details before saving

### 📱 Responsive Design
- Works seamlessly on desktop, tablet, and mobile devices
- Professional mobile-optimized interface
- Touch-friendly buttons and inputs
- Optimized for all screen sizes

### ⚡ User-Friendly Interface
- No technical knowledge required
- Intuitive form layouts
- Clear navigation between pages
- Helpful placeholders and labels
- Real-time form validation

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or dependencies required

### Installation

1. Clone or download the repository:
```bash
git clone <repository-url>
cd InvoGenerator
```

2. Serve the files locally (required for component loading):
```bash
# Using Python 3
python -m http.server 5500

# Using Python 2
python -m SimpleHTTPServer 5500

# Using Node.js (if you have http-server installed)
http-server -p 5500

# Using PHP
php -S localhost:5500
```

3. Open in your browser:
```
http://localhost:5500
```

## 📋 Usage Guide

### Creating Your First Invoice

1. **Go to Create Invoice Page**
   - Click on "Create Invoice" in the main navigation

2. **Add Business Information**
   - Enter your business name, email, phone, and address
   - This information will appear on all your invoices

3. **Set Invoice Details**
   - Enter invoice number (e.g., INV-001)
   - Set invoice date and due date
   - These help track payment deadlines

4. **Add Client Information**
   - Either select a saved client from the dropdown
   - Or manually enter new client details
   - Client information automatically populates if you select a saved client

5. **Add Line Items**
   - Click "Add Item" to add products/services
   - Enter description, quantity, and unit price
   - Totals update automatically
   - Remove items as needed

6. **Set Tax Rate**
   - Enter the tax percentage applicable (0-100%)
   - Automatically calculated on subtotal

7. **Add Notes** (Optional)
   - Include payment terms, special instructions, or late fees
   - Add any additional information for the client

8. **Preview and Save**
   - Click "Preview" to review the invoice
   - Click "Generate & Save Invoice" to save it to your history

### Managing Clients

1. **Go to Clients Page**
   - Click on "Clients" in the navigation

2. **Add New Client**
   - Fill in client name, company, email, phone, and address
   - Click "Add Client"

3. **Manage Existing Clients**
   - Search clients using the search box
   - Click "View" to see full details
   - Click "Edit" to modify client information
   - Click "Delete" to remove a client

### Tracking Invoices

1. **Go to Dashboard**
   - Click on "Dashboard" in the navigation

2. **View Statistics**
   - See total number of invoices
   - View total amount invoiced
   - Check pending invoice count

3. **Search and Filter**
   - Use the search box to find invoices by:
     - Invoice number
     - Client name
     - Any other visible information

4. **Manage Invoices**
   - Click "View" to preview an invoice
   - Click "Delete" to remove an invoice
   - Use "Delete All" to clear all invoices (with confirmation)

## 📁 File Structure

```
InvoGenerator/
├── index.html           # Landing page / Home
├── demo.html            # Invoice generator form
├── clients.html         # Client management page
├── dashboard.html       # Invoice tracking dashboard
├── features.html        # Features showcase page
├── login.html           # Login page (ready for future auth)
├── README.md            # This file
├── styles.css           # All styling and responsive design
├── scripts.js           # Main application logic
├── components.js        # Component loader (nav/footer)
├── nav.html             # Navigation component
└── footer.html          # Footer component
```

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser LocalStorage API
- **Architecture**: Client-side only, no backend required
- **Browser Compatibility**: Modern browsers (ES6 supported)

### Data Storage
- **Location**: Browser LocalStorage
- **Data Types**: JSON format
- **Persistence**: Survives browser restarts
- **Capacity**: ~5-10MB depending on browser

### Component System
- **nav.html**: Centralized navigation component
- **footer.html**: Centralized footer component
- **components.js**: Dynamically loads and injects components into all pages

## 🎨 Customization

### Update Navigation
Edit `nav.html` and changes will automatically reflect on all pages:
```html
<nav>
    <a href="index.html">Home</a>
    <a href="demo.html">Create Invoice</a>
    <!-- Add or modify links here -->
</nav>
```

### Update Footer
Edit `footer.html` to change footer content across all pages:
```html
<footer>
    <p>&copy; 2025 Yuno.com - All Rights Reserved</p>
</footer>
```

### Modify Styling
Edit `styles.css` to customize:
- Colors and gradients
- Typography
- Spacing and layouts
- Responsive breakpoints

### Add New Features
Extend `scripts.js` with new functionality:
- Additional invoice fields
- Export formats (CSV, PDF)
- Email integration
- Payment tracking

## 🖼️ Features in Detail

### Invoice Calculations
- Real-time subtotal calculation
- Configurable tax rates
- Automatic tax amount calculation
- Grand total computation
- All amounts formatted in USD

### Client Management
- CRUD operations (Create, Read, Update, Delete)
- Multiple client storage
- Quick-select on invoice creation
- Search/filter functionality
- Persistent storage across sessions

### Invoice Preview
- Professional layout
- Business information display
- Client information display
- Itemized line items table
- Totals section with tax breakdown
- Optional notes section

### Dashboard Analytics
- Total invoice count
- Total amount invoiced
- Pending invoice counter
- Search functionality
- Date-based filtering

## 📊 Data Backup

### Exporting Your Data
Currently, data is stored in browser localStorage. To backup:

1. **Manual Export**
   - Open browser DevTools (F12)
   - Go to Application → LocalStorage
   - Copy 'invoices' and 'clients' data
   - Save to a text file

2. **Future Feature**
   - JSON export functionality coming soon
   - CSV export for spreadsheet programs
   - Cloud backup integration

## ⚠️ Important Notes

- **Data Privacy**: All data remains on your device
- **No Account Needed**: Use without registration
- **No Internet Required**: Works offline
- **Browser Storage**: Data persists until you clear browser data
- **Backup Recommended**: Regularly export important invoice data

## 🔮 Coming Soon

- ✅ Email invoice delivery
- ✅ PDF download and export
- ✅ Payment reminders
- ✅ Recurring invoices
- ✅ Multi-currency support
- ✅ Cloud synchronization
- ✅ User authentication
- ✅ Invoice templates
- ✅ Payment tracking
- ✅ Financial reporting

## 🐛 Troubleshooting

### Navigation Not Working
- Ensure you're serving files through a local server
- Check that nav.html and footer.html exist in the same directory

### Data Not Saving
- Check browser localStorage is enabled
- Browser may be in private/incognito mode
- Ensure adequate storage space (5-10MB typically available)

### Invoices Not Appearing
- Refresh the page after saving
- Check Dashboard page for all invoices
- Verify browser hasn't cleared localStorage

### Components Not Loading
- Ensure components.js is loaded before scripts.js
- Check browser console for errors (F12)
- Verify all files are in the same directory

## 📝 Usage Tips

1. **Consistent Invoice Numbers**: Use a numbering pattern (INV-001, INV-002, etc.)
2. **Client Profiles**: Save clients for quick re-use on future invoices
3. **Tax Rates**: Set appropriate tax for your jurisdiction
4. **Regular Backups**: Periodically export your data
5. **Browser Cache**: Clear cache if experiencing issues
6. **Mobile Access**: Use responsive design on mobile devices

## 🔐 Security & Privacy

- ✅ No data sent to external servers
- ✅ All processing done locally
- ✅ No account or login required
- ✅ Data encrypted in browser storage
- ✅ Complete user control over data
- ✅ Can clear data at any time

## 📞 Support & Feedback

For issues, suggestions, or feedback:
- Check the troubleshooting section
- Review browser console for errors
- Ensure all files are properly configured
- Test on a different browser if needed

## 📄 License

This project is provided as-is for business use. Feel free to customize and extend for your needs.

## 👨‍💼 About Yuno

Yuno is designed with small business owners in mind. We believe invoicing should be simple, free, and under your complete control. No subscriptions, no ads, no hidden fees—just pure invoicing functionality.

---

**Happy Invoicing! 🎉**

For the latest updates and feature announcements, check back regularly.
