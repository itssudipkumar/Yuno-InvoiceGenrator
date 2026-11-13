import { createElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { InvoicePreview } from '../components/invoice/InvoiceTemplates'
import type { Invoice } from '../types/invoice.types'

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;z-index:-1;'
  document.body.appendChild(container)
  const root = createRoot(container)

  try {
    flushSync(() => root.render(createElement(InvoicePreview, { invoice })))
    const element = container.querySelector<HTMLElement>('.invoice-document')
    if (!element) throw new Error('Invoice preview could not be rendered.')

    await document.fonts.ready
    await Promise.all(Array.from(element.querySelectorAll('img')).map(image => image.decode()))

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      windowWidth: Math.max(document.documentElement.clientWidth, 1200),
    })
    if (!canvas.width || !canvas.height) throw new Error('Invoice could not be captured for PDF export.')

    const pdf = new jsPDF({ format: 'a4', unit: 'mm' })
    const pageHeight = Math.round(canvas.width * 297 / 210)
    const scale = canvas.width / element.getBoundingClientRect().width
    const elementTop = element.getBoundingClientRect().top
    const blocks = Array.from(element.querySelectorAll<HTMLElement>('[data-pdf-avoid]')).map(block => {
      const rect = block.getBoundingClientRect()
      return {
        top: Math.round((rect.top - elementTop) * scale),
        bottom: Math.round((rect.bottom - elementTop) * scale),
      }
    })
    const textLines: Array<{ top: number; bottom: number }> = []
    const textNodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    while (textNodes.nextNode()) {
      const range = document.createRange()
      range.selectNodeContents(textNodes.currentNode)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.height > 0) textLines.push({
          top: Math.floor((rect.top - elementTop) * scale),
          bottom: Math.ceil((rect.bottom - elementTop) * scale),
        })
      }
      range.detach()
    }
    const background = getComputedStyle(element).backgroundColor
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = pageHeight
    const context = pageCanvas.getContext('2d')
    if (!context) throw new Error('PDF image canvas is unavailable.')

    let start = 0
    let page = 0
    while (start < canvas.height) {
      let end = Math.min(start + pageHeight, canvas.height)
      if (end < canvas.height) {
        const crossing = blocks.filter(block =>
          block.top > start + pageHeight * 0.2 && block.top < end && block.bottom > end,
        )
        if (crossing.length) end = Math.min(...crossing.map(block => block.top))
        const crossingText = textLines.filter(line => line.top > start && line.top < end && line.bottom > end)
        if (crossingText.length) end = Math.min(...crossingText.map(line => line.top))
      }
      const height = end - start
      context.fillStyle = background
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      context.drawImage(canvas, 0, start, canvas.width, height, 0, 0, canvas.width, height)
      if (page > 0) pdf.addPage()
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297)
      start = end
      page += 1
    }

    const filename = `${invoice.invoiceNumber}-${invoice.client.name || 'invoice'}`
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-|-$/g, '')
    pdf.save(`${filename || 'invoice'}.pdf`)
  } catch (error) {
    console.error('Could not export the invoice PDF.', error)
    window.alert('Could not create the invoice PDF. Please check the invoice and try again.')
  } finally {
    root.unmount()
    container.remove()
  }
}
