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

  // pdfjs Node.js FakeWorker calls `await import(workerSrc)` internally where
  // workerSrc is a runtime string. That dynamic-variable import is unreliable
  // in Vercel's Lambda sandbox. pdfjs checks `globalThis.pdfjsWorker` *first*
  // and skips the dynamic import entirely when it's present — so we pre-load
  // the worker module ourselves (a static import path the bundler can handle)
  // and inject it before the first getDocument call.
  if (!(globalThis as Record<string, unknown>).pdfjsWorker) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- pdfjs-dist ships no types for this sub-path
    const workerModule = await import('pdfjs-dist/legacy/build/pdf.worker.mjs')
    ;(globalThis as Record<string, unknown>).pdfjsWorker = workerModule
  }

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
