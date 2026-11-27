import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Spinner } from './Spinner';
import { getAssetUrl } from '../../services/api';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  } catch (e) {
    console.warn('[PDF.js Worker Setup]', e);
  }
}

/**
 * Calculates rectangle bounding box for an item at given viewport scale
 */
const getItemRect = (viewport, item, scale) => {
  try {
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontHeight = Math.hypot(tx[2], tx[3]);
    const x = tx[4];
    const y = tx[5] - fontHeight;
    const width = (item.width || 0) * scale;
    const height = Math.max(fontHeight, 10);
    return { x, y, width, height };
  } catch (err) {
    return null;
  }
};

/**
 * InteractivePdfDocumentViewer
 * Renders full scrollable PDF document with in-document search and real-time text highlighting.
 */
export const InteractivePdfDocumentViewer = ({
  pdfUrl,
  title = 'Official Manufacturer Price List',
  fileName = 'Catalog.pdf',
  searchTerm = '',
  onSearchChange,
  brandName = '',
  onSelectTextMatch,
}) => {
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewer options
  const [scale, setScale] = useState(1.15);
  const [inDocSearch, setInDocSearch] = useState(searchTerm || '');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  // Page text data cache: { [pageNumber]: { items: Array, text: string } }
  const pageTextDataRef = useRef({});

  // Sync incoming searchTerm from props
  useEffect(() => {
    if (searchTerm !== undefined && searchTerm !== inDocSearch) {
      setInDocSearch(searchTerm);
    }
  }, [searchTerm]);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setMatches([]);
    setCurrentMatchIdx(0);
    pageTextDataRef.current = {};

    const effectiveUrl = pdfUrl ? getAssetUrl(pdfUrl) : '/sample-catalog.pdf';

    const loadTask = pdfjsLib.getDocument({
      url: effectiveUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    loadTask.promise
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('[PDF Load Error]', err);
        // If failed with custom URL, try fallback /sample-catalog.pdf
        if (effectiveUrl !== '/sample-catalog.pdf') {
          console.log('[PDF Viewer] Trying fallback /sample-catalog.pdf...');
          const fallbackTask = pdfjsLib.getDocument({
            url: '/sample-catalog.pdf',
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true,
          });
          fallbackTask.promise
            .then((doc) => {
              if (isCancelled) return;
              setPdfDoc(doc);
              setNumPages(doc.numPages);
              setLoading(false);
            })
            .catch((fErr) => {
              if (isCancelled) return;
              setError(`Failed to load PDF document: ${err.message || 'Network error'}`);
              setLoading(false);
            });
        } else {
          setError(`Failed to load PDF document: ${err.message || 'Network error'}`);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      try {
        loadTask.destroy();
      } catch (e) {}
    };
  }, [pdfUrl]);

  // Search across all pages in the PDF document
  const performSearch = useCallback(
    async (query) => {
      if (!pdfDoc || !query || !query.trim()) {
        setMatches([]);
        setCurrentMatchIdx(0);
        return;
      }

      setIsSearching(true);
      const cleanQ = query.trim().toLowerCase();
      const allMatches = [];

      try {
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          let textData = pageTextDataRef.current[pageNum];
          if (!textData) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            textData = {
              page,
              items: textContent.items,
            };
            pageTextDataRef.current[pageNum] = textData;
          }

          // Check each text item on this page
          for (let itemIdx = 0; itemIdx < textData.items.length; itemIdx++) {
            const item = textData.items[itemIdx];
            const strLower = (item.str || '').toLowerCase();
            if (strLower.includes(cleanQ)) {
              allMatches.push({
                pageNum,
                itemIdx,
                item,
                text: item.str,
              });
            }
          }
        }

        setMatches(allMatches);
        if (allMatches.length > 0) {
          setCurrentMatchIdx(0);
        } else {
          setCurrentMatchIdx(0);
        }
      } catch (err) {
        console.error('[In-Document Search Error]', err);
      } finally {
        setIsSearching(false);
      }
    },
    [pdfDoc]
  );

  // Trigger search when inDocSearch or pdfDoc changes
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(inDocSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [inDocSearch, performSearch]);

  // Scroll to active match
  useEffect(() => {
    if (matches.length > 0 && matches[currentMatchIdx]) {
      const matchId = `pdf-match-${currentMatchIdx}`;
      const el = document.getElementById(matchId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Scroll to page if element not rendered yet
        const pageEl = document.getElementById(`pdf-page-${matches[currentMatchIdx].pageNum}`);
        if (pageEl) {
          pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  }, [currentMatchIdx, matches, scale]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev + 1) % matches.length);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIdx((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(inDocSearch);
    if (onSearchChange) onSearchChange(inDocSearch);
  };

  const handleClearSearch = () => {
    setInDocSearch('');
    setMatches([]);
    setCurrentMatchIdx(0);
    if (onSearchChange) onSearchChange('');
  };

  const handleZoomIn = () => setScale((s) => Math.min(2.0, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(0.7, +(s - 0.15).toFixed(2)));
  const handleResetZoom = () => setScale(1.15);

  const effectivePdfAsset = pdfUrl ? getAssetUrl(pdfUrl) : '/sample-catalog.pdf';

  return (
    <div className="bg-slate-900/95 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
      {/* 1. PDF Document Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                Official Manufacturer PDF
              </span>
              {brandName && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  {brandName}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5" title={title}>
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono truncate">{fileName}</p>
          </div>
        </div>

        {/* Action Buttons: Zoom & Open New Tab */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700 p-1 text-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 font-bold">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              Fit
            </button>
          </div>

          <a
            href={effectivePdfAsset}
            target="_blank"
            rel="noreferrer"
            download={fileName}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </a>

          <a
            href={effectivePdfAsset}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors flex items-center gap-1.5 text-xs shadow-md"
            title="Open PDF in Full Screen"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Tab</span>
          </a>
        </div>
      </div>

      {/* 2. DEDICATED IN-DOCUMENT PDF SEARCH BOX (Requirement 3) */}
      {/* "Antha Pdf Ku Mela Oru Search Box irukkanum Antha Search Box La Nan Enaaa Type Panreno Athu Enakuu Show Akanum Pdf la Nan Seach box la type Pannathu Matutum Heiglight Akanum" */}
      <div className="bg-slate-950/90 p-3 sm:p-4 border-b border-slate-800 space-y-2.5">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={`Search & highlight text inside PDF (e.g. ${brandName || 'Diamond'}, C-98, 6204, 10B-1, A 18)...`}
              value={inDocSearch}
              onChange={(e) => {
                setInDocSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full pl-10 pr-24 py-2.5 bg-slate-900 border border-amber-400/40 rounded-xl text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
            {inDocSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-start">
            {/* Match Counter & Next/Prev Controls */}
            {inDocSearch && (
              <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs gap-2 shrink-0">
                {isSearching ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Spinner size="xs" /> Searching PDF...
                  </span>
                ) : matches.length > 0 ? (
                  <span className="font-extrabold text-amber-400 font-mono">
                    Match {currentMatchIdx + 1} of {matches.length}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">0 matches found</span>
                )}

                <div className="flex items-center border-l border-slate-700 pl-1.5 gap-0.5">
                  <button
                    type="button"
                    onClick={handlePrevMatch}
                    disabled={matches.length === 0}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Previous Match"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    disabled={matches.length === 0}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Next Match"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Highlight in PDF</span>
            </button>
          </div>
        </form>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-bold text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Quick Highlight:
          </span>
          {[brandName, 'C-98', '6204', '10B-1', 'SPC 2360', '8V-1900', 'Fenner', 'MRP']
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInDocSearch(term);
                  if (onSearchChange) onSearchChange(term);
                }}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  inDocSearch.toLowerCase() === term.toLowerCase()
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {term}
              </button>
            ))}
        </div>
      </div>

      {/* 3. FULL SCROLLABLE PDF DOCUMENT CONTAINER */}
      {/* "Antha Pdf Full Ah ve Nan Scroll Panni Pakura mathiri Irukkanum... Anth Pdf ah ve Irukkanum" */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto max-h-[820px] p-4 sm:p-6 bg-slate-950/80 flex flex-col items-center gap-6 scroll-smooth select-text"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #0f172a' }}
      >
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-center">
            <Spinner size="lg" />
            <p className="text-sm font-bold text-amber-300">Rendering Official PDF Document...</p>
            <p className="text-xs text-slate-400">Loading authentic price catalog from Balumuni servers</p>
          </div>
        ) : error ? (
          <div className="py-20 px-6 max-w-md text-center bg-rose-950/40 border border-rose-800/60 rounded-3xl space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <div>
              <p className="text-sm font-black text-rose-200">Unable to Display PDF</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={effectivePdfAsset}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-amber-300 transition-colors"
              >
                Open in Browser PDF Viewer
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : numPages > 0 ? (
          Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
            <PdfPageRenderer
              key={`page-${pageNum}-${scale}`}
              pdfDoc={pdfDoc}
              pageNum={pageNum}
              numPages={numPages}
              scale={scale}
              searchTerm={inDocSearch}
              matches={matches}
              currentMatchIdx={currentMatchIdx}
              pageTextDataRef={pageTextDataRef}
            />
          ))
        ) : (
          <div className="py-20 text-center text-xs text-slate-400">
            No pages found in this document.
          </div>
        )}
      </div>

      {/* 4. Bottom Footer Info Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">
            {numPages} Pages • Verified Official Price Schedule
          </span>
        </div>
        {matches.length > 0 && (
          <div className="text-amber-400 font-extrabold font-mono text-[11px]">
            {matches.length} text match{matches.length > 1 ? 'es' : ''} highlighted in document
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual PDF Page Renderer with Real-Time Highlight Overlay Layer
 */
const PdfPageRenderer = ({
  pdfDoc,
  pageNum,
  numPages,
  scale,
  searchTerm,
  matches,
  currentMatchIdx,
  pageTextDataRef,
}) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [viewportDims, setViewportDims] = useState({ width: 0, height: 0 });
  const [pageMatches, setPageMatches] = useState([]);

  // Render Page to Canvas
  useEffect(() => {
    let isCancelled = false;
    let renderTask = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        setViewportDims({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.transform(outputScale, 0, 0, outputScale, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;

        if (isCancelled) return;
        setRendered(true);

        // Fetch text content if not already cached
        let textData = pageTextDataRef.current[pageNum];
        if (!textData) {
          const textContent = await page.getTextContent();
          textData = {
            page,
            items: textContent.items,
          };
          pageTextDataRef.current[pageNum] = textData;
        }

        // Calculate highlights for this page if searchTerm exists
        if (searchTerm && searchTerm.trim()) {
          const cleanQ = searchTerm.trim().toLowerCase();
          const pMatches = [];

          textData.items.forEach((item, itemIdx) => {
            const strLower = (item.str || '').toLowerCase();
            if (strLower.includes(cleanQ)) {
              const rect = getItemRect(viewport, item, scale);
              if (rect) {
                // Find global index in matches array
                const globalIdx = matches.findIndex(
                  (m) => m.pageNum === pageNum && m.itemIdx === itemIdx
                );
                pMatches.push({
                  rect,
                  text: item.str,
                  globalIdx: globalIdx >= 0 ? globalIdx : 0,
                });
              }
            }
          });
          setPageMatches(pMatches);
        } else {
          setPageMatches([]);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(`[Page ${pageNum} Render Error]`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, pageNum, scale, searchTerm, matches]);

  return (
    <div
      id={`pdf-page-${pageNum}`}
      className="relative rounded-2xl bg-white shadow-2xl border border-slate-700/80 overflow-hidden transition-all duration-200"
      style={{
        width: viewportDims.width ? `${viewportDims.width}px` : 'auto',
        minHeight: viewportDims.height ? `${viewportDims.height}px` : '400px',
      }}
    >
      {/* 1. Canvas Layer */}
      <canvas ref={canvasRef} className="block select-none" />

      {/* 2. REAL-TIME HIGHLIGHT OVERLAY LAYER (Requirement 3) */}
      {/* "Pdf la Nan Seach box la type Pannathu Matutum Heiglight Akanum" */}
      {rendered && pageMatches.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {pageMatches.map((m, idx) => {
            const isCurrent = m.globalIdx === currentMatchIdx;
            return (
              <div
                key={`page-${pageNum}-match-${idx}`}
                id={`pdf-match-${m.globalIdx}`}
                style={{
                  position: 'absolute',
                  left: `${m.rect.x}px`,
                  top: `${m.rect.y}px`,
                  width: `${m.rect.width}px`,
                  height: `${m.rect.height}px`,
                }}
                className={`rounded-sm transition-all duration-200 pointer-events-auto ${
                  isCurrent
                    ? 'bg-amber-400/80 ring-4 ring-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.9)] z-30 animate-pulse'
                    : 'bg-yellow-300/50 border border-yellow-500 hover:bg-yellow-400/70 z-20'
                }`}
                title={`Match for "${searchTerm}": ${m.text}`}
              />
            );
          })}
        </div>
      )}

      {/* 3. Page Number Watermark Badge at bottom */}
      <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-300 font-mono text-[10px] font-bold pointer-events-none shadow-xs border border-white/10">
        Page {pageNum} of {numPages}
      </div>
    </div>
  );
};
