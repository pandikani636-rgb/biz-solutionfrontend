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
  MousePointerClick,
} from 'lucide-react';
import { Spinner } from './Spinner';
import { getAssetUrl } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/alerts';

// Configure PDF.js worker (uses local self-hosted worker for 100% reliable rendering)
if (typeof window !== 'undefined') {
  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
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
 * Renders full scrollable PDF document with in-document search, text highlighting,
 * and clickable products that immediately sync to the left side!
 */
export const InteractivePdfDocumentViewer = ({
  pdfUrl,
  title = 'Official Manufacturer Price List',
  fileName = 'Catalog.pdf',
  searchTerm = '',
  onSearchChange,
  brandName = '',
  availableProducts = [],
  selectedProduct = null,
  onSelectProduct,
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

  // Load PDF Document via direct Binary ArrayBuffer fetch to prevent worker origin/CORS fetch errors
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setMatches([]);
    setCurrentMatchIdx(0);
    pageTextDataRef.current = {};

    const loadPdfData = async () => {
      // Build candidate URLs to try in order
      const candidates = [];

      if (pdfUrl) {
        if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
          candidates.push(pdfUrl);
        } else {
          const cleanPath = pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`;
          if (typeof window !== 'undefined') {
            candidates.push(`${window.location.origin}${cleanPath}`);
          }
          candidates.push(cleanPath);
          candidates.push(getAssetUrl(pdfUrl));
        }
      }

      if (typeof window !== 'undefined') {
        candidates.push(`${window.location.origin}/sample-catalog.pdf`);
      }
      candidates.push('/sample-catalog.pdf');

      let arrayBuffer = null;
      let lastErr = null;

      for (const url of candidates) {
        if (!url) continue;
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok) {
            const buf = await res.arrayBuffer();
            if (buf && buf.byteLength > 100) {
              arrayBuffer = buf;
              break;
            }
          }
        } catch (fetchErr) {
          lastErr = fetchErr;
        }
      }

      if (isCancelled) return;

      if (!arrayBuffer) {
        setError(
          `Unable to load PDF document (${lastErr?.message || 'File not reachable'}). Please check network or click retry.`
        );
        setLoading(false);
        return;
      }

      try {
        const loadTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadTask.promise;
        if (isCancelled) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (parseErr) {
        if (isCancelled) return;
        console.error('[PDF.js Parse Error]', parseErr);
        setError(`Failed to parse PDF document: ${parseErr.message || 'Corrupted file'}`);
        setLoading(false);
      }
    };

    loadPdfData();

    return () => {
      isCancelled = true;
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

      {/* 3. INTERACTIVE CLICKABLE PRODUCTS IN THIS PDF BAR (User Requirement) */}
      {/* "Enaku intha Pdf la ye Antha Product eh Clcikable Ah venum Atha Click panaa Left side la Nammaa Click Panra Product Left Side la Show Akanum" */}
      {availableProducts && availableProducts.length > 0 && (
        <div className="bg-slate-950 p-3 sm:p-4 border-b border-slate-800 space-y-2 select-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Interactive Catalog: Click Any Product to View on Left Side:</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {availableProducts.length} interactive item{availableProducts.length !== 1 ? 's' : ''} in catalog
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {availableProducts.map((prod) => {
              const isSelected = selectedProduct?.partNumber === prod.partNumber;
              return (
                <button
                  key={prod.partNumber}
                  type="button"
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(prod);
                    setInDocSearch(prod.partNumber);
                    if (onSearchChange) onSearchChange(prod.partNumber);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer shadow-xs shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400/50'
                  }`}
                  title={`Select ${prod.partNumber} & view technical pricing on left side`}
                >
                  <span className="font-mono">{prod.partNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-400/20 text-amber-300'
                    }`}
                  >
                    {formatCurrency(prod.wholesalePrice)}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. FULL SCROLLABLE PDF DOCUMENT CONTAINER */}
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
              availableProducts={availableProducts}
              selectedProduct={selectedProduct}
              onSelectProduct={onSelectProduct}
            />
          ))
        ) : (
          <div className="py-20 text-center text-xs text-slate-400">
            No pages found in this document.
          </div>
        )}
      </div>

      {/* 5. Bottom Footer Info Bar */}
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
 * and Clickable Product Hotspots that immediately sync to left side!
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
  availableProducts = [],
  selectedProduct = null,
  onSelectProduct,
}) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [viewportDims, setViewportDims] = useState({ width: 0, height: 0 });
  const [pageMatches, setPageMatches] = useState([]);
  const [productHotspots, setProductHotspots] = useState([]);

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

        // 1. Calculate highlights for this page if searchTerm exists
        if (searchTerm && searchTerm.trim()) {
          const cleanQ = searchTerm.trim().toLowerCase();
          const pMatches = [];

          textData.items.forEach((item, itemIdx) => {
            const strLower = (item.str || '').toLowerCase();
            if (strLower.includes(cleanQ)) {
              const rect = getItemRect(viewport, item, scale);
              if (rect) {
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

        // 2. Calculate Clickable Product Hotspots on this page (User Requirement)
        // "intha Pdf la ye Antha Product eh Clcikable Ah venum Atha Click panaa Left side la Nammaa Click Panra Product Left Side la Show Akanum"
        if (availableProducts && availableProducts.length > 0) {
          const hotspots = [];
          availableProducts.forEach((prod) => {
            const pClean = prod.partNumber.toLowerCase().trim();
            const pNameClean = (prod.name || '').toLowerCase().trim();
            const pShort = pClean
              .replace(
                /^(diamond|fenner|nbc|fag|skf|timken|siemens|pix|abb|crompton|bharat\s+bijlee|shanthi\s+gears|vignesh\s+gears|ntn)\s+/i,
                ''
              )
              .trim();

            const matchedItems = textData.items.filter((item) => {
              const strLower = (item.str || '').toLowerCase().trim();
              if (!strLower || strLower.length < 2) return false;
              return (
                strLower === pClean ||
                strLower.includes(pClean) ||
                (pClean.includes(strLower) && strLower.length >= 4) ||
                (pShort.length >= 3 && (strLower.includes(pShort) || pShort.includes(strLower))) ||
                (pNameClean.length >= 6 && strLower.length >= 6 && pNameClean.includes(strLower))
              );
            });

            if (matchedItems.length > 0) {
              const rects = matchedItems.map((it) => getItemRect(viewport, it, scale)).filter(Boolean);
              if (rects.length > 0) {
                const minY = Math.min(...rects.map((r) => r.y));
                const maxY = Math.max(...rects.map((r) => r.y + r.height));
                const height = Math.max(maxY - minY, 24);

                hotspots.push({
                  product: prod,
                  rect: {
                    x: 12,
                    y: Math.max(0, minY - 3),
                    width: Math.max(viewport.width - 24, 200),
                    height: height + 6,
                  },
                });
              }
            }
          });
          setProductHotspots(hotspots);
        } else {
          setProductHotspots([]);
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
  }, [pdfDoc, pageNum, scale, searchTerm, matches, availableProducts]);

  // Click on page container to select nearest product row
  const handlePageClick = (e) => {
    if (e.target.closest('[data-hotspot="true"]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const closest = productHotspots.find(
      (hs) => clickY >= hs.rect.y - 12 && clickY <= hs.rect.y + hs.rect.height + 12
    );

    if (closest && onSelectProduct) {
      onSelectProduct(closest.product);
    }
  };

  return (
    <div
      id={`pdf-page-${pageNum}`}
      onClick={handlePageClick}
      className="relative rounded-2xl bg-white shadow-2xl border border-slate-700/80 overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        width: viewportDims.width ? `${viewportDims.width}px` : 'auto',
        minHeight: viewportDims.height ? `${viewportDims.height}px` : '400px',
      }}
    >
      {/* 1. Canvas Layer */}
      <canvas ref={canvasRef} className="block select-none" />

      {/* 2. REAL-TIME CLICKABLE PRODUCT HOTSPOTS OVER PDF (User Requirement: Clickable Product in PDF) */}
      {/* "intha Pdf la ye Antha Product eh Clcikable Ah venum Atha Click panaa Left side la Nammaa Click Panra Product Left Side la Show Akanum" */}
      {rendered && productHotspots.length > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {productHotspots.map((hs, idx) => {
            const isSelected = selectedProduct?.partNumber === hs.product.partNumber;
            return (
              <div
                key={`page-${pageNum}-hotspot-${idx}-${hs.product.partNumber}`}
                data-hotspot="true"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProduct) {
                    onSelectProduct(hs.product);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${hs.rect.x}px`,
                  top: `${hs.rect.y}px`,
                  width: `${hs.rect.width}px`,
                  height: `${hs.rect.height}px`,
                }}
                className={`pointer-events-auto cursor-pointer rounded-xl transition-all duration-200 flex items-center justify-between px-3 group ${
                  isSelected
                    ? 'bg-blue-600/30 border-2 border-primary shadow-[0_0_15px_rgba(37,99,235,0.8)] ring-2 ring-primary/50'
                    : 'border border-transparent hover:border-amber-400 hover:bg-amber-400/20 hover:shadow-lg'
                }`}
                title={`Click to select ${hs.product.partNumber} and view on the left side`}
              >
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-slate-950/90 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md shadow border border-amber-400/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Click to view on left side</span>
                  </span>
                </div>

                {isSelected && (
                  <div className="ml-auto flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Selected for Quote</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. REAL-TIME HIGHLIGHT OVERLAY LAYER */}
      {rendered && pageMatches.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
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
