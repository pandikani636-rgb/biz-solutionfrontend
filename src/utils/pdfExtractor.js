import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure the worker source using a reliable CDN matching the pdfjs-dist version (3.11.174)
if (typeof window !== 'undefined') {
  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  } catch (e) {
    console.warn('[PDF.js Worker Setup Notice]', e);
  }
}

/**
 * Extracts plain text from a user-selected PDF File object entirely in the browser.
 * This circumvents Vercel serverless request body limits (4.5 MB hard cap) by turning
 * large 5MB - 30MB binary PDF files into compact 50KB - 200KB text payloads.
 *
 * @param {File} file - The uploaded PDF File object
 * @param {Function} [onProgress] - Optional progress callback: (percent: number, currentPage: number, totalPages: number) => void
 * @returns {Promise<{ text: string, numPages: number, fileName: string, fileSize: number }>}
 */
export const extractPdfTextInBrowser = async (file, onProgress) => {
  if (!file) {
    throw new Error('No PDF file provided for text extraction.');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (typeof onProgress === 'function') {
        const percent = Math.round((pageNum / numPages) * 100);
        onProgress(percent, pageNum, numPages);
      }

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item.str ? item.str.trim() : ''))
        .filter(Boolean)
        .join(' ');

      fullText += pageText + '\n';
    }

    return {
      text: fullText,
      numPages,
      fileName: file.name,
      fileSize: file.size,
    };
  } catch (error) {
    console.error('[Browser PDF Extractor]', error);
    throw new Error(
      `Unable to parse PDF '${file.name}' in browser: ${error.message || 'Corrupted or password-protected PDF'}`
    );
  }
};
