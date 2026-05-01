import 'server-only'

// pdfjs-dist v5 executes `const SCALE_MATRIX = new DOMMatrix()` at module load
// time. Vercel's Lambda runtime (Node.js without browser globals) does not have
// DOMMatrix. We must polyfill it before the first import of pdfjs-dist.
// Only the constructor and chainable transform methods are needed; we only call
// getTextContent (no canvas rendering), so return values are never actually used.
if (typeof (globalThis as Record<string, unknown>).DOMMatrix === 'undefined') {
  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
    m11 = 1; m12 = 0; m13 = 0; m14 = 0
    m21 = 0; m22 = 1; m23 = 0; m24 = 0
    m31 = 0; m32 = 0; m33 = 1; m34 = 0
    m41 = 0; m42 = 0; m43 = 0; m44 = 1
    is2D = true; isIdentity = true

    constructor(init?: string | number[]) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1]
        this.c = init[2]; this.d = init[3]
        this.e = init[4]; this.f = init[5]
        this.m11 = init[0]; this.m12 = init[1]
        this.m21 = init[2]; this.m22 = init[3]
        this.m41 = init[4]; this.m42 = init[5]
        this.isIdentity = false
      }
    }

    multiply()       { return new DOMMatrixPolyfill() }
    translate()      { return new DOMMatrixPolyfill() }
    scale()          { return new DOMMatrixPolyfill() }
    rotate()         { return new DOMMatrixPolyfill() }
    inverse()        { return new DOMMatrixPolyfill() }
    invertSelf()     { return this }
    multiplySelf()   { return this }
    preMultiplySelf(){ return this }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 } }
    toJSON()         { return { a: this.a, b: this.b, c: this.c, d: this.d, e: this.e, f: this.f } }
  }
  ;(globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill
}

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

  // In Node.js, pdfjs uses a FakeWorker that calls `await import(workerSrc)` where
  // workerSrc is a runtime string — unreliable in Vercel's Lambda sandbox.
  // pdfjs checks globalThis.pdfjsWorker first and skips that dynamic import if set.
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
