import 'server-only'
import { PDFParse } from 'pdf-parse'

interface ParsedPDF {
  text: string
  pageCount: number
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  await parser.destroy()

  const text = result.text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!text || text.length < 50) {
    throw new Error(
      'Could not extract text from this PDF. The file may be scanned or image-based.'
    )
  }

  return {
    text,
    pageCount: result.total,
  }
}
