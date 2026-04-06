# 📄 Yuno - Professional Invoice Generator

A modern, user-friendly web application for small businesses to generate professional invoices and manage their billing records. Built with vanilla HTML, CSS, and JavaScript with local storage for secure data management.

## 🎯 Overview

Yuno is a self-hosted invoice generation and tracking system designed for small business owners, freelancers, and entrepreneurs. Generate professional invoices, manage client profiles, and track all your billing in one convenient dashboard—all without needing a backend server or paying subscription fees.

## ✨ Features

### � User Authentication & Account Management
- Secure user registration and login system
- Personal account dashboard with profile settings
- Business information management with auto-save
- Password security features
- Session management with automatic redirects

### 📄 Professional Invoice Generation
- Create beautifully formatted invoices with auto-filled business details
- Add itemized line items with automatic calculations
- Customizable tax rates per invoice
- Add custom notes and payment terms
- All business information editable per invoice if needed

### 💼 Business Information Management
- Save complete business profile in "My Account":
  - Business Name
  - ABN (Australian Business Number)
  - Email
  - Phone
  - Full Address
- Auto-populate these details on every invoice
- Reduce data entry with seamless integration

### 📤 Multiple Invoice Actions
- **Generate**: Create and save invoice as draft
- **Save**: Manually save invoice from invoice page
- **Print**: Print-ready professional invoice format
- **Send**: Direct email integration to send invoices to clients
- **Preview**: View invoice before saving/printing

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
- Encrypted data handling for sensitive information

### 🌙 Dark Mode Support
- Full dark mode toggle across all pages
- Professional dark theme for night-time use
- Persistent user theme preference
- Eye-friendly color schemes

### 👁️ Enhanced Invoice Preview
- Full-page invoice preview before saving
- Professional formatting and layout
- Print-ready invoice display
- Verify all details before saving
- Email preview before sending

### 📱 Responsive Design
- Works seamlessly on desktop, tablet, and mobile devices
- Professional mobile-optimized interface
- Touch-friendly buttons and inputs
- Optimized for all screen sizes (480px, 768px, 1024px, 1920px)

### ⚡ User-Friendly Interface
- Intuitive form layouts and navigation
- Clear labeling and helpful placeholders
- Real-time form validation
- Success/error message feedback
- Smooth animations and transitions

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

### Getting Started with Registration

1. **Sign Up**
   - Click on "Sign Up" in the login form
   - Enter your email, password, and business name
   - Click "Register" to create your account

2. **Log In**
   - Enter your email and password
   - Click "Sign In" to access your account

### Setting Up Your Business Profile

1. **Go to My Account**
   - Click on your business name or profile icon in the navbar
   - Select "My Account"

2. **Complete Business Information**
   - Click on "Business Info" tab
   - Fill in all fields:
     - Business Name (e.g., "ABC Solutions")
     - ABN (e.g., 12345678901)
     - Email (business@example.com)
     - Phone (+61 2 XXXX XXXX)
     - Address (123 Street, City, Country)
   - Click "Save Changes"

3. **Other Tabs**
   - **Profile**: Update personal email and phone
   - **Security**: Change your password

### Creating Your First Invoice

1. **Go to Create Invoice**
   - Click on "Create Invoice" in the navigation
   - Your business information auto-fills from your profile

2. **Review/Edit Business Information**
   - Even though details are pre-filled, you can edit them
   - Perfect if you need to use a different address or ABN

3. **Add Invoice Details**
   - Enter invoice number (auto-generated as INV-0001)
   - Set invoice date (auto-filled with today's date)
   - Set due date (auto-filled 30 days from now)

4. **Add Client Information**
   - Enter client name, address, phone, and email
   - Client info is optional but recommended

5. **Add Line Items**
   - Click "Add Item" to add products/services
   - Enter:
     - Description (e.g., "Web Design Services")
     - Quantity (e.g., 1)
     - Unit Price (e.g., $500.00)
   - Totals update automatically
   - Remove items or add more as needed

6. **Set Tax Rate**
   - Enter tax percentage (default 10%)
   - Tax amount updates automatically

7. **Add Notes** (Optional)
   - Include payment terms, instructions, or thank you messages
   - Appears on the invoice

8. **Take Action**
   - **Generate**: Saves invoice as draft and redirects to dashboard
   - **Save**: Manually save the invoice
   - **Print**: Opens print dialog with formatted invoice
   - **Send**: Opens email client to send invoice to client
   - **Preview**: Opens new window to preview before saving

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
├── pages/
│   ├── index.html           # Landing page / Home
│   ├── login.html           # Login & registration page
│   ├── account.html         # User account & business info
│   ├── invoice.html         # Professional invoice creator
│   ├── dashboard.html       # Invoice tracking dashboard
│   ├── clients.html         # Client management page
│   ├── demo.html            # Demo/test page
│   ├── features.html        # Features showcase page
│   └── branding.html        # Branding guidelines page
├── components/
│   ├── nav.html             # Navigation component
│   └── footer.html          # Footer component
├── assets/
│   ├── css/
│   │   ├── core.css              # Core styling
│   │   ├── typography.css        # Font & text styles
│   │   ├── buttons.css           # Button styles
│   │   ├── forms.css             # Form styling
│   │   ├── navbar.css            # Navigation bar
│   │   ├── footer.css            # Footer styling
│   │   ├── hero.css              # Hero section
│   │   ├── sections.css          # Section containers
│   │   ├── account.css           # Account page styles
│   │   ├── auth.css              # Authentication styles
│   │   ├── invoice-creator.css   # Invoice page styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   ├── dark-mode.css         # Dark mode theme
│   │   ├── animations.css        # Transitions & animations
│   │   ├── responsive.css        # Mobile responsiveness
│   │   └── [additional CSS modules]
│   ├── js/
│   │   ├── auth.js               # Authentication manager
│   │   ├── utils.js              # Utility functions
│   │   ├── invoice-manager.js    # Invoice management
│   │   ├── form-handler.js       # Form handling
│   │   ├── navigation.js         # Navigation logic
│   │   ├── theme-manager.js      # Dark mode toggle
│   │   ├── components-loader.js  # Component injection
│   │   ├── carousel.js           # Carousel functionality
│   │   ├── dashboard.js          # Dashboard logic
│   │   └── [additional JS modules]
│   └── images/
│       └── logo.svg              # Yuno logo
├── README.md                # This file
└── .gitignore              # Git ignore rules
```

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **Authentication**: Client-side session management
- **Architecture**: Client-side only, no backend required
- **Browser Compatibility**: Modern browsers with ES6 support

### Project Architecture
- **Modular CSS**: 20+ CSS modules for maintainability
- **Modular JavaScript**: 16+ JS modules for code organization
- **Component System**: Dynamic component loading (nav, footer)
- **Responsive Design**: Mobile-first approach with multiple breakpoints
- **Dark Mode**: Theme switching with localStorage persistence

### Data Storage
- **Location**: Browser LocalStorage
- **Data Types**: JSON format
- **Persistence**: Survives browser restarts
- **Capacity**: ~5-10MB depending on browser
- **Structure**:
  - `users`: Array of user accounts
  - `currentUser`: Currently logged-in user
  - `invoices`: Array of saved invoices
  - `clients`: Array of client profiles

### Authentication Flow
1. User registers with email, password, business name
2. Credentials stored in localStorage (encoded password)
3. Login validates credentials against stored users
4. Successful login stores `currentUser` in localStorage
5. Protected pages redirect non-logged-in users to login
6. Session persists until logout or browser data clear

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

- **Data Privacy**: All data remains on your device - no external servers
- **User Accounts Required**: Create an account to access protected features
- **No Internet Required**: Works offline after initial load
- **Browser Storage**: Data persists until you clear browser data/localStorage
- **Password Security**: Passwords are encoded (for production, use proper hashing)
- **Backup Recommended**: Regularly export important invoice data
- **SessionPersistence**: Logging out clears your session from localStorage

## 🔮 Coming Soon

### ✅ Recently Implemented
- ✅ User authentication and registration system
- ✅ Business information management with auto-fill
- ✅ Multiple invoice action buttons (Save, Print, Send, Preview)
- ✅ Dark mode support
- ✅ Professional invoice creation page
- ✅ Auto-population of business details

### 🚀 Planned Features
- 📊 PDF export and download
- 📤 Receipt email automation
- 🔔 Payment reminder notifications
- ♻️ Recurring invoice templates
- 💱 Multi-currency support
- ☁️ Cloud backup and synchronization
- 📈 Financial reporting and analytics
- 🎨 Custom invoice templates
- 💳 Online payment integration
- 📱 Mobile app version
- 📧 Email invoice scheduling
- 📊 Expense tracking
- 🏢 Multi-business support
- 👥 Team collaboration features

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
2. **Business Profile**: Keep your profile updated for auto-fill to work correctly
3. **Tax Rates**: Set appropriate tax for your jurisdiction
4. **Client Profiles**: Save clients for quick re-use on future invoices
5. **Regular Backups**: Periodically export your data
6. **Browser Cache**: Clear cache if experiencing issues
7. **Mobile Access**: Use responsive design on mobile devices
8. **Dark Mode**: Enable for night-time viewing comfort

## 🔐 Security & Privacy

- ✅ No data sent to external servers
- ✅ All processing done locally in your browser
- ✅ Login credentials stored securely in localStorage
- ✅ Complete user control over all data
- ✅ Can delete account and data at any time
- ✅ Multi-user support with separate accounts

## 📞 Support & Feedback

For issues, suggestions, or feedback:
- Check the troubleshooting section
- Review browser console for errors (F12)
- Ensure all files are properly configured
- Test on a different browser if needed
- Check GitHub issues for known problems

## 📄 License

This project is provided as-is for business use. Feel free to customize and extend for your needs.

## 👨‍💼 About Yuno

Yuno is designed with small business owners, freelancers, and entrepreneurs in mind. We believe invoicing should be simple, free, and under your complete control. No subscriptions, no ads, no hidden fees—just pure invoicing functionality with powerful features.

---

## 📊 Version History

### v2.0.0 (April 7, 2026)
**Major Release: User Authentication & Business Profile**
- ✨ Added user registration and login system
- ✨ Business information management in My Account
- ✨ Auto-populate invoice form with saved business details
- ✨ 5-button invoice action system (Generate, Save, Print, Send, Preview)
- ✨ Professional print layout for invoices
- ✨ Email integration for sending invoices
- ✨ Preview window before saving/printing
- ✨ Dark mode support across all pages
- 🎨 Redesigned invoice creator page
- 🔧 Modular CSS and JavaScript architecture
- 📱 Improved responsive design
- 🐛 Various bug fixes and improvements

### v1.0.0 (Earlier)
- Initial release with basic invoice generation
- Client management
- Invoice dashboard
- Local storage persistence

**Happy Invoicing! 🎉**

For the latest updates and feature announcements, check back regularly.
