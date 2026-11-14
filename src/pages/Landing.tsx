import { useEffect, useRef } from 'react'
import {
  ArrowRight,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Repeat,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Nav from '../components/layout/Nav'
import type { Page } from '../App'

export default function Landing({ nav }: { nav: (p: Page) => void }) {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = pageRef.current
    if (!root) return

    const reveals = root.querySelectorAll<HTMLElement>('.reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach(element => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          currentObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })

    reveals.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="page-landing" ref={pageRef}>
      <Nav nav={nav} current="landing" />

      <section className="hero">
        <div className="hero-content reveal">
          <div className="hero-badge"><span /> Made for Australian small business</div>
          <h1 className="hero-title">
            Good invoices.<br />
            <span className="gold">Less admin.</span>
          </h1>
          <p className="hero-desc">
            Create polished invoices, keep an eye on payments, and stay across key
            dates. Use it as a guest, or sign in to access your work across devices.
          </p>
          <div className="hero-actions">
            <button className="btn-gold" onClick={() => nav('create-invoice')}>
              Create an invoice <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button className="btn-ghost" onClick={() => nav('login')}>Create a free account</button>
          </div>
          <div className="hero-assurance">
            <span><ShieldCheck size={15} aria-hidden="true" /> No subscription</span>
            <span><ShieldCheck size={15} aria-hidden="true" /> Cloud access when signed in</span>
          </div>
        </div>
        <div className="hero-visual reveal">
          <div className="preview-caption"><span>INVOICE PREVIEW</span><span>AUD · GST</span></div>
          <div className="invoice-preview-card">
            <div className="ipc-header">
              <div>
                <div className="ipc-logo-placeholder">NORTH STUDIO</div>
                <div className="ipc-business-detail">ABN 12 345 678 901</div>
              </div>
              <div className="ipc-inv-label">TAX INVOICE<span>INV-0042</span></div>
            </div>
            <div className="ipc-parties">
              <div><span>ISSUED TO</span><strong>Alex Morgan</strong><small>Brightside Co.</small></div>
              <div><span>DUE DATE</span><strong>In 14 days</strong></div>
            </div>
            <div className="ipc-table-head"><span>DESCRIPTION</span><span>AMOUNT</span></div>
            <div className="ipc-row"><span>Brand and web design</span><span>$2,400.00</span></div>
            <div className="ipc-row"><span>Consultation</span><span>$800.00</span></div>
            <div className="ipc-row"><span>Hosting setup</span><span>$350.00</span></div>
            <div className="ipc-totals">
              <div><span>Subtotal</span><span>$3,550.00</span></div>
              <div><span>GST (10%)</span><span>$355.00</span></div>
              <div className="ipc-total"><strong>Total due</strong><strong>$3,905.00</strong></div>
            </div>
            <div className="ipc-footer"><span>Thank you for your business.</span><span>01 / 01</span></div>
          </div>
          <div className="preview-note"><span className="preview-note-dot" /> Ready to print or send</div>
        </div>
      </section>

      <section className="features-section reveal">
        <div className="section-heading">
          <span className="section-eyebrow">THE ESSENTIALS</span>
          <h2>Less time formatting.<br /><span className="gold">More time for your work.</span></h2>
          <p>The everyday tools to create invoices and keep business details close at hand.</p>
        </div>
        <div className="features-grid">
          {[
            { icon: FileText, title: 'Invoices that feel like yours', desc: 'Choose from five designs, add your logo, and download a print-ready PDF.' },
            { icon: LayoutDashboard, title: 'A clear overview', desc: 'Compare monthly invoiced and received totals and see how revenue is trending.' },
            { icon: CalendarDays, title: 'Australian due dates', desc: 'Keep upcoming BAS and other key business dates in view.' },
            { icon: Repeat, title: 'Recurring invoices', desc: 'Set a schedule and get a draft to review when the next invoice is due.' },
            { icon: Users, title: 'Client details, ready', desc: 'Save client profiles and bring their details into your next invoice.' },
            { icon: ShieldCheck, title: 'Access wherever you work', desc: 'Sign in to access your invoices, clients and business details across devices.' },
          ].map(f => (
            <div key={f.title} className="feature-card reveal">
              <div className="feature-icon"><f.icon size={20} strokeWidth={1.7} aria-hidden="true" /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="au-section">
        <div className="au-content reveal">
          <div className="au-intro">
            <span className="section-eyebrow">LOCAL DETAILS</span>
            <h2>Made with Australian business in mind.</h2>
            <p>GST calculations and useful reminders for common Australian business dates, all in one place.</p>
          </div>
          <div className="au-cards">
            {[
              { label: 'GST', desc: 'Add GST to invoice totals when it applies to your business.' },
              { label: 'BAS', desc: 'Keep quarterly lodgement dates on your radar.' },
              { label: 'SUPER', desc: 'See upcoming superannuation due dates.' },
              { label: 'TAX & TPAR', desc: 'A quick reminder of other important dates.' },
            ].map(a => (
              <div key={a.label} className="au-card">
                <div className="au-label">{a.label}</div>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="upcoming-section">
        <div className="upcoming-content reveal">
          <div className="section-heading">
            <span className="section-eyebrow">WHAT'S NEXT</span>
            <h2>Useful now. Getting better.</h2>
            <p>We’re building YUNO thoughtfully, one practical improvement at a time.</p>
          </div>
          <div className="upcoming-grid">
            {[
              {label:'Online payments',desc:'Accept payments directly from an invoice.',status:'On the roadmap'},
              {label:'Cloud backup',desc:'Keep an optional backup of your business data.',status:'On the roadmap'},
              {label:'Expense tracking',desc:'Keep business spending alongside your invoices.',status:'Available'},
              {label:'Mobile app',desc:'Manage invoices from your phone.',status:'On the roadmap'},
              {label:'Automatic reminders',desc:'Make invoice follow-ups easier to manage.',status:'On the roadmap'},
              {label:'Multi-currency',desc:'Create invoices for clients around the world.',status:'On the roadmap'},
            ].map(f=>(
              <div key={f.label} className="upcoming-card reveal">
                <div className="upcoming-body">
                  <div className="upcoming-label">{f.label}</div>
                  <div className="upcoming-desc">{f.desc}</div>
                </div>
                <div className="upcoming-status status-planned">{f.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="coffee-section">
        <div className="coffee-card reveal">
          <div>
            <span className="section-eyebrow">INDEPENDENTLY MADE</span>
            <h2>Enjoying YUNO?</h2>
            <p>YUNO is free to use. If it’s been helpful, you can support the people keeping it going.</p>
          </div>
          <a
            href="https://www.buymeacoffee.com/technoforty"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coffee"
          >
            Support YUNO <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="cta-section reveal">
        <span className="section-eyebrow">START WHEN YOU’RE READY</span>
        <h2>Make your next invoice<br /><span className="gold">a little easier.</span></h2>
        <p>Try it without an account, or create one to save your business details.</p>
        <button className="btn-gold large" onClick={() => nav('create-invoice')}>
          Create an invoice <ArrowRight size={16} aria-hidden="true" />
        </button>
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
          © {new Date().getFullYear()} TechnoForty. Guest invoices are not saved.
        </div>
      </footer>
    </div>
  )
}
