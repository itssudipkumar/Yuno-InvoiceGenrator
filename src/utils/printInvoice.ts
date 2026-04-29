// Shared print utility for both Guest and Registered invoice pages

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght'
  + '@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600'
  + '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400'
  + '&family=Syne:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500'
  + '&family=Fraunces:ital,wght@0,300;0,700;1,300'
  + '&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'

const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; width: 210mm; margin: 0 auto; }
  @page {
    size: A4 portrait;
    margin: 0;
  }
  @media print {
    html, body { width: 210mm; height: 297mm; }
    body { margin: 0; padding: 0; }
    .invoice-wrapper {
      width: 210mm;
      min-height: 297mm;
      page-break-after: avoid;
    }
  }
`

export function printInvoiceHTML(elementId: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  const html = el.innerHTML

  const w = window.open('', '_blank', 'width=850,height=1100')
  if (!w) return

  const doc = '<!DOCTYPE html><html><head>'
    + '<meta charset="UTF-8">'
    + '<link href="' + GOOGLE_FONTS + '" rel="stylesheet">'
    + '<style>' + PRINT_STYLES + '</style>'
    + '</head><body>'
    + '<div class="invoice-wrapper">' + html + '</div>'
    + '</body></html>'

  w.document.write(doc)
  w.document.close()
  // Wait for fonts to load then print
  setTimeout(() => { w.focus(); w.print() }, 900)
}
