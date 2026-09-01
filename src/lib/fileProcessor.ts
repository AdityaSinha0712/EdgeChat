/**
 * File processing utilities for RAG.
 *
 * Handles extracting text from PDF and text files, then chunking
 * it into overlapping segments suitable for embedding.
 */

// PDF.js worker setup — bundle the worker locally with Vite
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const SUPPORTED_EXTENSIONS = ['.pdf', '.txt'];

/**
 * Check if a file type is supported for text extraction.
 */
export function isSupportedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Get the accepted file types string for file inputs.
 */
export const ACCEPTED_FILE_TYPES = SUPPORTED_EXTENSIONS.join(',');

/**
 * Extract raw text from a file.
 * Supports PDF (via pdf.js) and plain text files (.txt, .md, .csv).
 */
export async function extractText(file: File): Promise<string> {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (ext === '.pdf') {
    return extractPdfText(file);
  }

  // Plain text files
  return file.text();
}

/**
 * Extract text from a PDF file using pdf.js.
 */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

/**
 * Split text into overlapping chunks for embedding.
 *
 * @param text - The full document text
 * @param chunkSize - Target character count per chunk (default 500)
 * @param overlap - Character overlap between consecutive chunks (default 100)
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100,
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= chunkSize) return [trimmed];

  const chunks: string[] = [];
  let start = 0;

  while (start < trimmed.length) {
    let end = start + chunkSize;

    // Try to break at a sentence or word boundary
    if (end < trimmed.length) {
      // Look for the last sentence break within the chunk
      const lastSentenceBreak = Math.max(
        trimmed.lastIndexOf('. ', end),
        trimmed.lastIndexOf('.\n', end),
        trimmed.lastIndexOf('? ', end),
        trimmed.lastIndexOf('! ', end),
      );

      if (lastSentenceBreak > start + chunkSize * 0.5) {
        end = lastSentenceBreak + 1;
      } else {
        // Fall back to word boundary
        const lastSpace = trimmed.lastIndexOf(' ', end);
        if (lastSpace > start + chunkSize * 0.5) {
          end = lastSpace;
        }
      }
    }

    chunks.push(trimmed.slice(start, end).trim());
    const prevStart = start;
    start = end - overlap;

    // Avoid infinite loops on zero or negative progress
    if (start <= prevStart) {
      start = end;
    }
  }

  return chunks.filter((c) => c.length > 0);
}
