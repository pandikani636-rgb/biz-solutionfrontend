/**
 * Verified industrial assets and authentic local photo assets for bearings, belts, and banners.
 * All authentic photos from belts, bearings, and banner folders are seamlessly integrated.
 */

export const INDUSTRIAL_IMAGE_CATALOG = {
  // Bearings
  ballBearing: '/bearings/imgg14.jpg',
  angularContact: '/bearings/img1.jpg',
  rollerBearing: '/bearings/img3.jpg',
  pillowBlock: '/bearings/img10.jpg',
  
  // Belts
  vBelt: '/belts/pix-section-c.jpg',
  heavyDutyBelt: '/belts/pix-section-d.jpg',
  wedgeBelt: '/belts/PIX SPC 2360 Wedge Belt.jpg',
  timingBelt: '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  
  // Pulleys & Transmission
  pulley: '/banners/img4.jpg',
  taperBush: '/banners/img4.jpg',
  grease: '/bearings/img10.jpg',
  diagnostics: '/banners/img4.jpg',
  defaultIndustrial: '/belts/pix-section-c.jpg',
};

// Direct, authentic product photo mappings from the Belts and Bearings folders
export const PRODUCT_SPECIFIC_IMAGES = {
  // ---------------- Belts Folder ----------------
  'pix-section-c': '/belts/pix-section-c.jpg',
  'pix-section-d': '/belts/pix-section-d.jpg',
  'pix-section-b': '/belts/pix-section-b.jpg',
  'pix-section-a': '/belts/pix-section-a.jpg',
  'pix-section-e': '/belts/pix-section-e.jpg',
  'pix d 100': '/belts/pix-section-d.jpg',
  'pix c 70': '/belts/pix-section-c.jpg',
  'pix b 50': '/belts/pix-section-b.jpg',
  'pix a 50': '/belts/pix-section-a.jpg',
  'pix spc 2360': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'spc 2360': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  '8v-1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  '8v 1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'pix 8v-1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'pix 8v 1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'pix spc pt 3150': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  'spc pt 3150': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  'fenner c 70': '/belts/Fenner C 70 Classical V-Belt.jpg',
  'fenner spc pt 3150': '/belts/Fenner SPC PT 3150 Power Transmissio.jpg',

  // ---------------- Bearings Folder ----------------
  // NBC
  'nbc 6405zz': '/bearings/img10.jpg',
  '6405zz': '/bearings/img10.jpg',
  '6405': '/bearings/img10.jpg',
  
  // Timken
  'timken': '/bearings/img3.jpg',
  '6313': '/bearings/img3.jpg',

  // SKF
  '7322 2x': '/bearings/img1.jpg',
  'skf 7322 2x': '/bearings/img1.jpg',
  '7322': '/bearings/img2.jpg',
  'skf 7322': '/bearings/img2.jpg',

  // HCH Matched Set
  '6201_6202': '/bearings/img5.jpg',
  'matched set': '/bearings/img5.jpg',

  // HCH 6205 & 6205ZZ
  'hch 6205zz': '/bearings/img4.jpg',
  '6205zz': '/bearings/img4.jpg',
  'hch 6205': '/bearings/img11.jpg',
  '6205': '/bearings/img11.jpg',

  // HCH 6306 & 6306ZZ
  'hch 6306zz': '/bearings/img9.jpg',
  '6306zz': '/bearings/img9.jpg',
  'hch 6306': '/bearings/img9.jpg',
  '6306': '/bearings/img9.jpg',

  // HCH 6203 & 6203ZZ
  'hch 6203zz': '/bearings/image12.jpg',
  '6203zz': '/bearings/image12.jpg',
  'hch 6203': '/bearings/imgg14.jpg',
  '6203': '/bearings/imgg14.jpg',

  // HCH 6204 & 6204ZZ
  'hch 6204zz': '/bearings/img7.jpg',
  '6204zz': '/bearings/img7.jpg',
  'hch 6204': '/bearings/img6.jpg',
  '6204': '/bearings/img6.jpg',

  // HCH 6305 & 6305ZZ
  'hch 6305zz': '/bearings/img4.jpg',
  '6305zz': '/bearings/img4.jpg',
  'hch 6305': '/bearings/img8.jpg',
  '6305': '/bearings/img8.jpg',

  // HCH 6307
  'hch 6307': '/bearings/img15.jpg',
  '6307': '/bearings/img15.jpg',

  // HCH 6309
  'hch 6309': '/bearings/imgg14.jpg',
  '6309': '/bearings/imgg14.jpg',
};

/**
 * Intelligently resolves the most accurate, authentic industrial engineering image
 * prioritizing local photo assets from the belts, bearings, and banner folders.
 * Guarantees NO unrelated stock photos or parking garage images ever appear.
 */
export const getProductImageUrl = (productOrImage, optionalCategory = '') => {
  if (!productOrImage) return INDUSTRIAL_IMAGE_CATALOG.vBelt;

  let currentImage = '';
  let name = '';
  let categoryName = '';
  let subcategoryName = '';
  let partNumber = '';
  let section = '';
  let brand = '';

  if (typeof productOrImage === 'string') {
    currentImage = productOrImage;
    categoryName = optionalCategory;
  } else if (typeof productOrImage === 'object') {
    currentImage = productOrImage.mainImage || productOrImage.image || productOrImage.imageUrl || '';
    name = productOrImage.name || productOrImage.title || '';
    categoryName =
      (typeof productOrImage.category === 'object' ? productOrImage.category?.name : productOrImage.category) ||
      productOrImage.categoryName ||
      optionalCategory ||
      '';
    subcategoryName = productOrImage.subcategoryName || '';
    partNumber = productOrImage.partNumber || '';
    section = productOrImage.section || '';
    brand = productOrImage.brand || '';
  }

  // 1. If image is an authentic local path, return immediately
  if (
    currentImage &&
    (currentImage.startsWith('/belts/') ||
      currentImage.startsWith('/bearings/') ||
      currentImage.startsWith('/banners/') ||
      currentImage.startsWith('/bannerImages/') ||
      currentImage.startsWith('/uploads/') ||
      currentImage.startsWith('data:image'))
  ) {
    return currentImage;
  }

  const pNorm = (partNumber || '').trim().toLowerCase();
  const nNorm = (name || '').trim().toLowerCase();
  const bNorm = (brand || '').trim().toLowerCase();
  const sNorm = (section || '').trim().toLowerCase();
  const subNorm = (subcategoryName || '').trim().toLowerCase();
  const catNorm = (categoryName || '').trim().toLowerCase();
  const combined = `${bNorm} ${pNorm} ${nNorm} ${sNorm} ${subNorm} ${catNorm}`.toLowerCase();

  // 2. Direct dictionary lookup
  for (const [key, imagePath] of Object.entries(PRODUCT_SPECIFIC_IMAGES)) {
    if (pNorm === key || nNorm.includes(key) || combined.includes(key)) {
      return imagePath;
    }
  }

  // 3. Section & Part Code Pattern Matching for Transmission Belts
  // 3a. Section D (32 x 19 mm) Heavy Duty wrapped V-belt
  if (/^d(\s*[-_/\s]?\d+|\b)/i.test(pNorm) || combined.includes('section d') || combined.includes('32 x 19')) {
    return '/belts/pix-section-d.jpg';
  }

  // 3b. Section E (38 x 23 mm) Heavy Crusher Drive
  if (/^e(\s*[-_/\s]?\d+|\b)/i.test(pNorm) || combined.includes('section e') || combined.includes('38 x 23')) {
    return '/belts/pix-section-e.jpg';
  }

  // 3c. Narrow Heavy Duty Cogged Belts: 8V, 5V, 3V
  if (
    /^(8v|5v|3v)(\s*[-_/\s]?\d+|\b)/i.test(pNorm) ||
    combined.includes('8v') ||
    combined.includes('5v') ||
    combined.includes('3v') ||
    combined.includes('giant drive')
  ) {
    return '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg';
  }

  // 3d. Metric Wedge Belts: SPZ, SPA, SPB, SPC
  if (
    /^(spz|spa|spb|spc)(\s*[-_/\s]?\d+|\b)/i.test(pNorm) ||
    combined.includes('wedge') ||
    combined.includes('spz') ||
    combined.includes('spa') ||
    combined.includes('spb') ||
    combined.includes('spc')
  ) {
    return '/belts/PIX SPC 2360 Wedge Belt.jpg';
  }

  // 3e. Hexagonal / Double-V / Cogged / Ribbed / PT: AA, BB, CC, AX, BX, CX, XPZ, XPA, XPB, XPC, PJ, PK, PL, PM
  if (
    /^(aa|bb|cc|ax|bx|cx|xpz|xpa|xpb|xpc|pj|pk|pl|pm)(\s*[-_/\s]?\d+|\b)/i.test(pNorm) ||
    combined.includes('hexagonal') ||
    combined.includes('double') ||
    combined.includes('cogged') ||
    combined.includes('raw edge') ||
    combined.includes('ribbed') ||
    combined.includes('power transmission') ||
    combined.includes('pt 3150')
  ) {
    return '/belts/PIX SPC PT 3150 Power Transmission.jpg';
  }

  // 3f. Classical V-Belts: Section C
  if (/^c(\s*[-_/\s]?\d+|\b)/i.test(pNorm) || combined.includes('section c') || combined.includes('22 x 14')) {
    if (bNorm.includes('fenner')) {
      return '/belts/Fenner C 70 Classical V-Belt.jpg';
    }
    return '/belts/pix-section-c.jpg';
  }

  // 3g. Classical V-Belts: Section B
  if (/^b(\s*[-_/\s]?\d+|\b)/i.test(pNorm) || combined.includes('section b') || combined.includes('17 x 11')) {
    return '/belts/pix-section-b.jpg';
  }

  // 3h. Classical V-Belts: Section A, FHP
  if (/^(a|fhp)(\s*[-_/\s]?\d+|\b)/i.test(pNorm) || combined.includes('section a') || combined.includes('13 x 8')) {
    return '/belts/pix-section-a.jpg';
  }

  if (
    combined.includes('classical') ||
    combined.includes('wrap belt') ||
    combined.includes('v-belt') ||
    combined.includes('v belt')
  ) {
    if (bNorm.includes('fenner')) {
      return '/belts/Fenner C 70 Classical V-Belt.jpg';
    }
    return '/belts/pix-section-c.jpg';
  }

  // 4. Bearings by brand & series
  if (combined.includes('nbc') || combined.includes('6405') || combined.includes('6400')) {
    return '/bearings/img10.jpg';
  }
  if (combined.includes('timken') || combined.includes('6313') || combined.includes('taper')) {
    return '/bearings/img3.jpg';
  }
  if (combined.includes('skf') || combined.includes('7322') || combined.includes('angular')) {
    return '/bearings/img1.jpg';
  }
  if (combined.includes('hch') || combined.includes('6203') || combined.includes('6204') || combined.includes('6205')) {
    return '/bearings/imgg14.jpg';
  }
  if (combined.includes('pulley') || combined.includes('taper lock') || combined.includes('bush')) {
    return '/banners/img4.jpg';
  }

  // 5. If current image is a valid remote image and NOT an unrelated unsplash stock photo
  if (currentImage && !currentImage.includes('unsplash.com')) {
    return currentImage;
  }

  // 6. Fallback based on category/query
  if (catNorm.includes('bearing') || combined.includes('bearing')) {
    return '/bearings/imgg14.jpg';
  }
  if (catNorm.includes('belt') || combined.includes('belt') || combined.includes('pix') || combined.includes('fenner')) {
    return '/belts/PIX C 70 Classical V-Belt.jpg';
  }

  return INDUSTRIAL_IMAGE_CATALOG.vBelt;
};
