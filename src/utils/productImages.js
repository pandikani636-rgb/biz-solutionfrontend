/**
 * Verified industrial assets and authentic local photo assets for bearings, belts, and banners.
 * All downloaded authentic photos from Belts, Bearings, and Banner folders are seamlessly integrated.
 */

export const INDUSTRIAL_IMAGE_CATALOG = {
  // Bearings
  ballBearing: '/bearings/imgg14.jpg',
  angularContact: '/bearings/img1.jpg',
  rollerBearing: '/bearings/img3.jpg',
  pillowBlock: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  
  // Belts
  vBelt: '/belts/PIX C 70 Classical V-Belt.jpg',
  timingBelt: '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  wedgeBelt: '/belts/PIX SPC 2360 Wedge Belt.jpg',
  
  // Pulleys & Transmission
  pulley: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
  taperBush: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  grease: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  diagnostics: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  defaultIndustrial: '/bearings/imgg14.jpg',
};

// Direct, authentic product photo mappings from the Belts and Bearings folders
export const PRODUCT_SPECIFIC_IMAGES = {
  // ---------------- Belts Folder ----------------
  'pix spc 2360': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  'spc 2360': '/belts/PIX SPC 2360 Wedge Belt.jpg',
  '8v-1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'pix 8v-1900': '/belts/PIX 8V-1900 Heavy Duty V-Belt.jpg',
  'pix spc pt 3150': '/belts/PIX SPC PT 3150 Power Transmission.jpg',
  'pix c 70': '/belts/PIX C 70 Classical V-Belt.jpg',
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
 * prioritizing local photo assets from the Belts and Bearings directories.
 */
export const getProductImageUrl = (productOrImage, optionalCategory = '') => {
  if (!productOrImage) return INDUSTRIAL_IMAGE_CATALOG.defaultIndustrial;

  let currentImage = '';
  let name = '';
  let categoryName = '';
  let partNumber = '';
  let brand = '';

  if (typeof productOrImage === 'string') {
    currentImage = productOrImage;
    categoryName = optionalCategory;
  } else if (typeof productOrImage === 'object') {
    currentImage = productOrImage.mainImage || productOrImage.image || productOrImage.imageUrl || '';
    name = productOrImage.name || productOrImage.title || '';
    categoryName =
      (typeof productOrImage.category === 'object' ? productOrImage.category?.name : productOrImage.category) ||
      optionalCategory ||
      '';
    partNumber = productOrImage.partNumber || '';
    brand = productOrImage.brand || '';
  }

  // 1. If image is already an authentic local path (belts, bearings, banners, uploads), return immediately
  if (
    currentImage &&
    (currentImage.startsWith('/belts/') ||
      currentImage.startsWith('/bearings/') ||
      currentImage.startsWith('/banners/') ||
      currentImage.startsWith('/uploads/') ||
      currentImage.startsWith('data:image'))
  ) {
    return currentImage;
  }

  // 2. Exact lookup by part number, name, or key combinations
  const pNorm = (partNumber || '').trim().toLowerCase();
  const nNorm = (name || '').trim().toLowerCase();
  const bNorm = (brand || '').trim().toLowerCase();
  const combined = `${bNorm} ${pNorm} ${nNorm}`.toLowerCase();

  for (const [key, imagePath] of Object.entries(PRODUCT_SPECIFIC_IMAGES)) {
    if (
      pNorm === key ||
      nNorm.includes(key) ||
      combined.includes(key)
    ) {
      return imagePath;
    }
  }

  // 3. Fallback to generic non-unsplash image if present and not car-related
  if (currentImage && !currentImage.includes('unsplash.com')) {
    return currentImage;
  }

  // 4. Category-based fallback
  const query = `${name} ${partNumber} ${brand} ${categoryName}`.toLowerCase();

  // V-Belts
  if (
    query.includes('belt') ||
    query.includes('spz') ||
    query.includes('spa') ||
    query.includes('spb') ||
    query.includes('spc') ||
    query.includes('wedge') ||
    query.includes('fenner') ||
    query.includes('pix') ||
    query.includes('c 70')
  ) {
    return INDUSTRIAL_IMAGE_CATALOG.vBelt;
  }

  // Bearings fallback
  if (query.includes('nbc')) return '/bearings/img10.jpg';
  if (query.includes('timken')) return '/bearings/img3.jpg';
  if (query.includes('skf')) return '/bearings/img1.jpg';
  if (query.includes('hch')) return '/bearings/imgg14.jpg';

  return INDUSTRIAL_IMAGE_CATALOG.ballBearing;
};
