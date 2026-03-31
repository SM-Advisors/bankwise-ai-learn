import JSZip from 'jszip';
import * as XLSX from 'xlsx';

/**
 * Extract readable text from a .docx file's ArrayBuffer.
 * Unzips the docx and parses word/document.xml.
 */
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  await zip.loadAsync(buffer);
  const docXml = zip.file('word/document.xml');
  if (!docXml) throw new Error('Invalid DOCX: missing word/document.xml');
  const xml = await docXml.async('string');
  return xml
    .replace(/<w:p[^>]*\/>/gi, '\n')
    .replace(/<\/w:p>/gi, '\n')
    .replace(/<w:tab\/>/gi, '\t')
    .replace(/<w:br[^>]*\/>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract readable text from an .xlsx file's ArrayBuffer.
 * Reads each sheet and converts to CSV-like text.
 */
function extractXlsxText(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const parts: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) {
      parts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }
  }
  return parts.join('\n\n') || 'Empty spreadsheet';
}

const BINARY_EXTENSIONS = new Set(['.docx', '.xlsx', '.xls']);

/**
 * Returns true if the filename has a binary document extension
 * that needs special parsing (not plain readAsText).
 */
export function isBinaryDocumentFile(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Read a binary document file (.docx, .xlsx) and return extracted text.
 * Falls back to a helpful error message if parsing fails.
 */
export async function extractDocumentText(file: File): Promise<string> {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const buffer = await file.arrayBuffer();

  if (ext === '.docx') {
    return extractDocxText(buffer);
  }
  if (ext === '.xlsx' || ext === '.xls') {
    return extractXlsxText(buffer);
  }
  throw new Error(`Unsupported binary document format: ${ext}`);
}
