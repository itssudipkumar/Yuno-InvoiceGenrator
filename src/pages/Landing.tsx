import Nav from '../components/layout/Nav'

type Page = 'landing' | 'login' | 'dashboard' | 'create-invoice' | 'clients' | 'account'

export default function Landing({ nav }: { nav: (p: Page) => void }) {
  return (
    <div className="page-landing">
      <Nav nav={nav} current="landing" />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🇦🇺 Built for Australian Businesses</div>
          <h1 className="hero-title">
            Professional Invoicing,<br />
            <span className="gold">Completely Free.</span>
          </h1>
          <p className="hero-desc">
            From sole traders to growing businesses — create beautiful invoices,
            track payments, and never miss an ATO deadline. Your data stays on your device.
          </p>
          <div className="hero-actions">
            <button className="btn-gold" onClick={() => nav('login')}>Start for Free</button>
            <button className="btn-ghost" onClick={() => nav('create-invoice')}>Try Without Account →</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-n">100%</span><span className="stat-l">Free Forever</span></div>
            <div className="stat"><span className="stat-n">∞</span><span className="stat-l">Invoices</span></div>
            <div className="stat"><span className="stat-n">0¢</span><span className="stat-l">Subscription</span></div>
            <div className="stat"><span className="stat-n">🔒</span><span className="stat-l">Private Data</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="invoice-preview-card">
            <div className="ipc-header">
              <div className="ipc-logo-placeholder">ACME PTY LTD</div>
              <div className="ipc-inv-num">INV-0042</div>
            </div>
            <div className="ipc-divider" />
            <div className="ipc-row"><span>Web Design Services</span><span>$2,400.00</span></div>
            <div className="ipc-row"><span>SEO Consultation</span><span>$800.00</span></div>
            <div className="ipc-row"><span>Hosting Setup</span><span>$350.00</span></div>
            <div className="ipc-divider" />
            <div className="ipc-row subtotal"><span>Subtotal</span><span>$3,550.00</span></div>
            <div className="ipc-row subtotal"><span>GST (10%)</span><span>$355.00</span></div>
            <div className="ipc-total"><span>Total</span><span>$3,905.00</span></div>
            <div className="ipc-status">PROFESSIONAL INVOICE</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Everything you need to run your business</h2>
        <div className="features-grid">
          {[
            { icon: '📄', title: 'Beautiful Invoices', desc: '3 professional designs. Add your logo. Auto-fill business details.' },
            { icon: '📊', title: 'Smart Dashboard', desc: 'Track income, pending payments, and Australian tax deadlines.' },
            { icon: '🗓️', title: 'ATO Reminders', desc: 'Never miss BAS, GST, Super Guarantee, or PAYG deadlines.' },
            { icon: '👥', title: 'Client Management', desc: 'Save client profiles for lightning-fast invoice creation.' },
            { icon: '📧', title: 'Send & Print', desc: 'Email invoices directly, generate PDFs, or print instantly.' },
            { icon: '🔒', title: 'Your Data, Your Device', desc: 'No cloud, no servers. 100% stored locally on your device.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="au-section">
        <div className="au-content">
          <h2>Built for the Australian Tax System</h2>
          <p>YUNO knows Australian business obligations. Stay on top of your compliance without the stress.</p>
          <div className="au-cards">
            {[
              { label: 'BAS', desc: 'Business Activity Statement reminders — quarterly lodgement dates.' },
              { label: 'GST', desc: 'Automatic GST calculations on invoices for GST-registered businesses.' },
              { label: 'SUPER', desc: 'Superannuation Guarantee quarterly deadline reminders.' },
              { label: 'PAYG', desc: 'Pay As You Go withholding reminders for employers.' },
            ].map(a => (
              <div key={a.label} className="au-card">
                <div className="au-label">{a.label}</div>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Upcoming Features */}
      <section className="upcoming-section">
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <h2 className="section-title">🚀 Coming Soon</h2>
          <p style={{textAlign:'center',color:'var(--text2)',marginBottom:'2.5rem',marginTop:'-1.5rem'}}>We're constantly improving YUNO. Here's what's on the roadmap.</p>
          <div className="upcoming-grid">
            {[
              {icon:'📄',label:'PDF Export',desc:'Download invoices as PDF with one click.',status:'In Progress'},
              {icon:'📊',label:'Revenue Analytics',desc:'Monthly charts showing income, trends and growth.',status:'Planned'},
              {icon:'🔄',label:'Recurring Invoices',desc:'Auto-generate invoices on a schedule for repeat clients.',status:'Planned'},
              {icon:'📱',label:'Mobile App',desc:'Native iOS and Android app for invoicing on the go.',status:'Planned'},
              {icon:'💳',label:'Online Payments',desc:'Accept card payments directly via invoice link.',status:'Planned'},
              {icon:'☁️',label:'Cloud Backup',desc:'Optional encrypted backup of your data to the cloud.',status:'Planned'},
              {icon:'📧',label:'Auto Email',desc:'Schedule invoice reminders and overdue follow-ups.',status:'Planned'},
              {icon:'🧾',label:'Expense Tracking',desc:'Track business expenses and deductions in one place.',status:'Planned'},
              {icon:'👥',label:'Team Access',desc:'Invite team members to manage invoices together.',status:'Planned'},
              {icon:'🌏',label:'Multi-Currency',desc:'Invoice clients in USD, EUR, GBP and more.',status:'Planned'},
            ].map(f=>(
              <div key={f.label} className="upcoming-card">
                <div className="upcoming-icon">{f.icon}</div>
                <div className="upcoming-body">
                  <div className="upcoming-label">{f.label}</div>
                  <div className="upcoming-desc">{f.desc}</div>
                </div>
                <div className={`upcoming-status ${f.status==='In Progress'?'status-inprogress':'status-planned'}`}>{f.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="coffee-section">
        <div className="coffee-card">
          <div className="coffee-emoji">☕</div>
          <h2>Love YUNO? Buy us a coffee!</h2>
          <p>YUNO is 100% free. If it saves you time and money, a small donation keeps us going.</p>
          <a
            href="https://www.buymeacoffee.com/technoforty"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coffee"
          >
            ☕ Buy TechnoForty a Coffee
          </a>
          <p className="coffee-note">No pressure. Every cup of coffee helps us maintain and improve YUNO!</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to simplify your invoicing?</h2>
        <p>Join thousands of Australian businesses using YUNO — free, forever.</p>
        <button className="btn-gold large" onClick={() => nav('login')}>Create Your Free Account</button>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div>
            <strong>YUNO</strong> by TechnoForty
            <p>Professional Invoice Management for Australian Businesses</p>
          </div>
          <div className="footer-links">
            <button onClick={() => nav('create-invoice')}>Try Free</button>
            <button onClick={() => nav('login')}>Sign In</button>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} TechnoForty. YUNO is free to use. Your data stays on your device.
        </div>
      </footer>
    </div>
  )
}
