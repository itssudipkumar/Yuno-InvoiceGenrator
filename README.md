# 🎯 YUNO — Professional Invoice Generator

<div align="center">

> **Free, Private, Powerful Invoice Management for Australian Businesses**  
> Built for sole traders, freelancers, and small business owners who demand simplicity and security.

[![YUNO](https://img.shields.io/badge/version-3.0.0-C9A84C?style=flat-square&labelColor=0A0F1E)](https://github.com/itssudipkumar/InvoGenrator)
[![License](https://img.shields.io/badge/license-MIT-2DD4A7?style=flat-square&labelColor=0A0F1E)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&labelColor=0A0F1E&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&labelColor=0A0F1E&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## What is YUNO?

**YUNO** is a **100% free**, browser-based invoice generator designed specifically for the Australian market. 

✨ **No subscriptions. No ads. No servers. Your data stays on YOUR device.**

### Why Choose YUNO?

| Feature | Benefit |
|---------|---------|
| ✅ **8 Professional Designs** | Choose the perfect template for your brand |
| ✅ **100% Private** | Your invoices stay on your device — encrypted in localStorage |
| ✅ **Australian Tax Ready** | GST, ABN, BAS reminders — all built-in |
| ✅ **Works Offline** | Create invoices anywhere, anytime |
| ✅ **Completely Free** | Forever. No hidden charges. |

**Powered by [TechnoForty](https://technoforty.com)**

---

## 🎨 Features Showcase

<div align="center">
  
### See YUNO in Action

<table style="border: none; background: transparent;">
  <tr>
    <td width="33%"><img src="src/assets/yuno1.jpg" alt="Dashboard & Invoice Management" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(201,168,76,0.2); border: 2px solid #C9A84C;"></td>
    <td width="33%"><img src="src/assets/yuno2.jpg" alt="Invoice Creation Form" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(201,168,76,0.2); border: 2px solid #C9A84C;"></td>
    <td width="33%"><img src="src/assets/yuno3.jpg" alt="Professional Invoice Templates" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(201,168,76,0.2); border: 2px solid #C9A84C;"></td>
  </tr>
  <tr>
    <td align="center"><strong>📊 Smart Dashboard</strong></td>
    <td align="center"><strong>📝 Easy Invoice Form</strong></td>
    <td align="center"><strong>✨ Beautiful Templates</strong></td>
  </tr>
</table>

</div>

---

## 🚀 Quick Start

### Try YUNO Now! 📱

<div align="center">

**Scan to access the live demo:**

<img src="src/assets/QR.png" alt="QR Code - Try YUNO Now" style="width: 150px; height: 150px; border-radius: 12px; padding: 10px; border: 3px solid #C9A84C;">

**No registration required • Works on desktop & mobile**

</div>

### 💻 Local Development

**Prerequisites:**
- Node.js 18+
- pnpm (recommended) — or npm/yarn

**Installation:**

```bash
# Clone the repository
git clone https://github.com/itssudipkumar/InvoGenrator.git
cd InvoGenrator

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🏗️ Build for Production

```bash
pnpm build
```

Output goes to `dist/`. Deploy to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

---

## ✨ Core Features

### 📄 Invoice Creation
- **8 professional invoice designs** — Prestige, Frost, Terra, Prism, Linen, Blueprint, Flora, Slate
- Auto-fill business details from your saved profile
- Australian address autocomplete powered by OpenStreetMap (free, no API key)
- Real-time GST calculations
- Logo support on every invoice
- Bank details printed directly on invoice
- Generate, save as draft, preview, print, or email instantly

### 👤 Guest Mode
Perfect for one-off invoices — no registration needed:
- Full business info form (ABN, name, email, phone, address)
- Logo upload support
- Complete bank details
- Client information with AU address autocomplete
- Access to all 8 invoice designs
- Save invoices to your device

### 🏢 Registered Users
Power up with a saved profile:
- Business profile saved once — auto-fills every invoice
- Client management with saved profiles for recurring customers
- Full invoice history with dashboard
- Manual status management: **Sent** | **Paid** | **Overdue** | **On Hold** | **Disputed** | **Draft**
- Add status notes per invoice for tracking

### 📊 Dashboard
Your business at a glance:
- Revenue overview (total invoiced, received, pending, overdue)
- Invoice history with search, filter & sorting
- One-click status updates
- Invoice preview from dashboard
- Quick export functionality

### 🇦🇺 Australian Tax Reminders
Built for Australian business owners:
- **BAS** — Quarterly Business Activity Statements (Oct 28, Jan 28, Apr 28, Jul 28)
- **Superannuation** — Quarterly contribution reminders
- **PAYG** & **TPAR** — Annual deadline tracking
- All dates auto-calculated for the current financial year

### 🔒 Privacy First
Your data, your control:
- ✅ 100% localStorage — no backend servers
- ✅ No data transmitted anywhere
- ✅ Works offline after first load
- ✅ You own and control all your data
- ✅ Export or delete anytime

---

```
src/
├── App.tsx                         # Router — splits guest vs authenticated
├── main.tsx
│
├── types/
│   └── invoice.types.ts            # All shared TypeScript interfaces & constants
│
├── utils/
│   └── invoice.ts                  # CRUD operations, formatters, ATO date utils
│
├── context/
│   └── AuthContext.tsx             # Auth state (localStorage-based)
│
├── components/
│   ├── invoice/
│   │   └── InvoiceTemplates.tsx    # All 8 invoice designs + InvoicePreview dispatcher
│   ├── layout/
│   │   └── Nav.tsx                 # Top navigation bar
│   └── ui/
│       ├── AutocompleteInput.tsx   # Generic autocomplete + AU address hook (Nominatim)
│       ├── LineItemsTable.tsx      # Invoice line items with add/remove
│       ├── StatusPicker.tsx        # Status update modal (Sent/Paid/Overdue etc.)
│       └── TotalsSidebar.tsx       # GST calculation summary
│
├── features/
│   ├── auth/
│   │   └── Login.tsx               # Sign in / Register
│   ├── dashboard/
│   │   └── Dashboard.tsx           # Invoice list, stats, ATO deadlines
│   ├── invoices/
│   │   ├── GuestInvoice.tsx        # Full form for non-registered users
│   │   └── RegisteredInvoice.tsx   # Slim form for logged-in users
│   ├── clients/
│   │   └── Clients.tsx             # Client CRUD
│   └── account/
│       └── Account.tsx             # Business profile, logo, bank details, design
│
└── pages/
    └── Landing.tsx                 # Marketing / landing page
```

---

## Invoice Designs

| # | Name | Style |
|---|------|-------|
| 1 | **Prestige** | Luxury dark header, Cormorant Garamond serif, gold rule |
| 2 | **Frost** | Deep navy gradient header, corporate clean |
| 3 | **Terra** | Dark header + terracotta stripe, warm cream body |
| 4 | **Prism** | White background, indigo geometric accents |
| 5 | **Linen** | Cream paper, left black rule, editorial italic |
| 6 | **Blueprint** | IBM Plex Mono, technical blueprint feel |
| 7 | **Flora** | Sage green accents, fresh & organic |
| 8 | **Slate** | Ultra-minimal, Bauhaus thick/thin rules |

All designs include:
- Logo area (top-left, shows nothing if no logo uploaded)
- Business info in header
- Client info
- Itemised line items table
- Subtotal + GST + Total
- Bank details (inline after total)
- Centred notes at bottom

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Pure CSS (CSS variables, no Tailwind) |
| Storage | Browser localStorage |
| Auth | Client-side (localStorage) |
| Address search | OpenStreetMap Nominatim (free, no key) |
| Fonts | Playfair Display, DM Sans, Cormorant Garamond, Syne, IBM Plex Mono, Fraunces, Plus Jakarta Sans |
| PDF/Print | Native `window.print()` |

---

## Data Storage

All data is stored in your browser's `localStorage`:

| Key | Contents |
|-----|----------|
| `yuno_users` | Registered user accounts |
| `yuno_current_user` | Active session |
| `yuno_invoices` | All saved invoices |
| `yuno_clients` | Saved client profiles |

**To backup your data:** Open DevTools → Application → Local Storage → copy the values.

---

## Australian Tax Calendar

YUNO automatically tracks these ATO deadlines:

- **BAS** — Quarterly Business Activity Statements (Oct 28, Jan 28, Apr 28, Jul 28)
- **Super** — Superannuation Guarantee quarterly contributions
- **Tax Return** — Annual individual/company tax return (Oct 31)
- **TPAR** — Taxable Payments Annual Report (Aug 28)

---

## Roadmap

- [ ] PDF export (jsPDF)
- [ ] Revenue chart on dashboard
- [ ] Recurring invoice templates
- [ ] Export data as JSON backup
- [ ] Import/restore data
- [ ] Mobile hamburger nav
- [ ] Duplicate invoice function
- [ ] Email via EmailJS (200 free/month)
- [ ] Multi-currency support

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open a pull request
```

---

## 💬 Support YUNO

YUNO is completely **free and open-source**. If it saves you time and money, we'd love your support!

<div align="center">

[![Buy Me A Coffee](https://img.shields.io/badge/☕%20Buy%20Me%20A%20Coffee-C9A84C?style=for-the-badge&labelColor=0A0F1E)](https://www.buymeacoffee.com/technoforty)
[![Star on GitHub](https://img.shields.io/badge/⭐%20Star%20Us-GitHub-yellow?style=for-the-badge&labelColor=0A0F1E)](https://github.com/itssudipkumar/InvoGenrator)

</div>

---

## 📄 License

MIT © [TechnoForty](https://technoforty.com) — Free to use, modify, and distribute.

---

<div align="center">

### 🌟 Built with ❤️ by [TechnoForty](https://technoforty.com)

**YUNO** — Professional Invoice Management Made Simple

[Live Demo](https://github.com/itssudipkumar/InvoGenrator) • [Report Bug](https://github.com/itssudipkumar/InvoGenrator/issues) • [Request Feature](https://github.com/itssudipkumar/InvoGenrator/issues)

</div>
