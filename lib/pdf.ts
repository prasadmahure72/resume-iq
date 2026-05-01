import 'server-only'

interface ParsedPDF {
  text: string
  pageCount: number
}

function itemToString(item: unknown): string {
  if (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof (item as Record<string, unknown>).str === 'string'
  ) {
    return (item as { str: string }).str
  }
  return ''
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // In Node.js pdfjs uses a FakeWorker that does `await import(workerSrc)`.
  // Use the bare package specifier so Node.js module resolution finds the file
  // via node_modules — a file:// URL breaks on Vercel because process.cwd()
  // doesn't point to the project root in the deployed function sandbox.
  pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs'

  const pdf = await pdfjs
    .getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true,
    })
    .promise

  const numPages = pdf.numPages
  const pageTexts: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(itemToString)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    pageTexts.push(pageText)
    page.cleanup()
  }

  await pdf.destroy()

  const text = pageTexts.join('\n\n').trim()

  if (!text || text.length < 50) {
    throw new Error(
      'Could not extract text from this PDF. The file may be scanned or image-based.'
    )
  }

  return { text, pageCount: numPages }
}
