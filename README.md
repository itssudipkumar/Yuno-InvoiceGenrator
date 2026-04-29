# YUNO — Professional Invoice Generator

> **Free, private invoice management for Australian businesses.**  
> Built for sole traders, freelancers, and small business owners.

![YUNO](https://img.shields.io/badge/version-3.0.0-C9A84C?style=flat-square&labelColor=0A0F1E)
![License](https://img.shields.io/badge/license-MIT-2DD4A7?style=flat-square&labelColor=0A0F1E)
![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&labelColor=0A0F1E&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&labelColor=0A0F1E&logo=typescript)

---

## What is YUNO?

YUNO is a **100% free**, browser-based invoice generator designed specifically for the Australian market. No subscriptions, no ads, no servers — your data stays on your device.

- ✅ Create professional invoices in seconds
- ✅ 8 beautiful invoice designs to choose from
- ✅ Australian tax system support (GST, ABN, BAS reminders)
- ✅ Works offline after first load
- ✅ Your data never leaves your device

**Powered by [TechnoForty](https://technoforty.com)**

---

## Features

### 📄 Invoice Creation
- 8 professional invoice designs (Prestige, Frost, Terra, Prism, Linen, Blueprint, Flora, Slate)
- Auto-fills business details from your saved profile
- Australian address autocomplete (OpenStreetMap — no API key needed)
- Real-time GST calculations
- Logo support on every invoice
- Bank details printed directly on invoice
- Generate, save as draft, preview, print, or email

### 👤 Guest Mode
Non-registered users can still create invoices with:
- Full business info form (name, ABN, email, phone, address)
- Logo upload
- Bank details
- Client information with AU address autocomplete
- All 8 invoice designs

### 🏢 Registered Users
- Business profile saved once — auto-fills every invoice
- Client management with saved profiles
- Invoice history & dashboard
- Manual status management: Sent / Paid / Overdue / On Hold / Disputed / Draft
- Status notes per invoice

### 📊 Dashboard
- Revenue overview (total invoiced, received, pending, overdue)
- Invoice history with search & filter
- One-click status updates
- Invoice preview from dashboard

### 🇦🇺 Australian Tax Reminders
- BAS (Business Activity Statement) quarterly deadlines
- Superannuation Guarantee reminders
- PAYG & TPAR deadline tracking
- All dates auto-calculated for current financial year

### 🔒 Privacy First
- 100% localStorage — no backend, no cloud
- No data transmitted anywhere
- Works offline
- You own and control all your data

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

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

### Build for Production

```bash
pnpm build
```

Output goes to `dist/`. Deploy to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

---

## Project Structure

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

## Support YUNO

YUNO is completely free. If it saves you time and money, consider buying us a coffee!

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-☕-C9A84C?style=flat-square&labelColor=0A0F1E)](https://www.buymeacoffee.com/technoforty)

---

## License

MIT © [TechnoForty](https://technoforty.com)

---

<div align="center">
  <strong>YUNO</strong> — Professional Invoice Management<br>
  <em>Powered by TechnoForty</em>
</div>
