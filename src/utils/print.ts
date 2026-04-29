import type { Invoice } from '../../types/invoice.types'
import { renderToStaticMarkup } from 'react-dom/server'
import { InvoicePreview } from '../invoice/InvoiceTemplates'

// A4 print CSS injected into print window
const PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 210mm;
    height: 297mm;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-wrap {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    font-size: 13px;
  }
`

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght'
  + '@0,400;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:wght@300;400;500;600'
  + '&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400'
  + '&family=Syne:wght@400;700;800&family=IBM+Plex+Mono:wght@400;500'
  + '&family=Fraunces:ital,wght@0,300;0,700;1,300'
  + '&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'

export function printInvoice(elementId: string) {
  const html = document.getElementById(elementId)?.innerHTML || ''
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return

  const doc = '<!DOCTYPE html><html><head>'
    + '<meta charset="UTF-8">'
    + '<link href="' + GOOGLE_FONTS + '" rel="stylesheet">'
    + '<style>' + PRINT_CSS + '</style>'
    + '</head><body>'
    + '<div class="invoice-print-wrap">' + html + '</div>'
    + '<script>window.onload=function(){window.focus();window.print();window.onafterprint=function(){window.close();}}<\/script>'
    + '</body></html>'

  w.document.write(doc)
  w.document.close()
}
