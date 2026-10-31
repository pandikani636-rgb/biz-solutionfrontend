/**
 * Verified high-resolution industrial assets for bearings, belts, pulleys, and transmission components.
 * Completely replaces generic/unrelated vehicle or car images with authentic industrial engineering assets.
 */

export const INDUSTRIAL_IMAGE_CATALOG = {
  // 1. Deep Groove Ball Bearings (6200, 6300 series, SKF, NBC, HCH)
  ballBearing: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
  
  // 2. Angular Contact Bearings (7300 series, high thrust, SKF)
  angularContact: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
  
  // 3. Spherical Roller Bearings & Taper Bearings (22200 series, Timken, ZKL)
  rollerBearing: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  
  // 4. Mounted Units & Pillow Blocks (UCP 205, UCP 208, Plummer block)
  pillowBlock: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  
  // 5. Industrial V-Belts & Wedge Belts (PIX Classical A/B/C, Narrow Wedge SPZ/SPA/SPB/SPC, Fenner)
  vBelt: 'https://cobrel.co.za/wp-content/uploads/2019/10/Classical-V-Belts-copy3.png',
  
  // 6. Timing Belts & Synchronous Cogged Belts (HTD 8M, 14M)
  timingBelt: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
  
  // 7. Pulleys & Taper-Lock Bushes (Cast iron SPA/SPB pulleys, 2517/2012 bushes)
  pulley: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80',
  taperBush: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  
  // 8. Lubricants & Industrial Greases (SKF LGMT 2/1, high temp grease)
  grease: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  
  // 9. Laser Alignment & Vibration Diagnostics
  diagnostics: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',

  // 10. General Industrial Fallback
  defaultIndustrial: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
};

// Known generic car / placeholder / broken photo IDs to automatically replace
const UNRELATED_IMAGE_PATTERNS = [
  'photo-1617788138017', // Tesla / car wheel
  'photo-1454165804606', // Laptop / desk
  'photo-1486406146926', // Skyscraper building
  'photo-1504917599217', // 404 broken Unsplash URL
  'photo-1581092335397', // 404 broken Unsplash URL
];

/**
 * Intelligently resolves the most accurate, relevant industrial engineering image
 * based on product title, part number, brand, and category.
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

  // Check if current image is a valid non-car image that was explicitly uploaded by user
  const isCarOrGenericImage = UNRELATED_IMAGE_PATTERNS.some((pattern) => currentImage.includes(pattern));

  if (currentImage && !isCarOrGenericImage && !currentImage.includes('unsplash.com/photo-1617788138017')) {
    return currentImage;
  }

  const query = `${name} ${partNumber} ${brand} ${categoryName}`.toLowerCase();

  // 1. V-Belts & Wedge Belts
  if (
    query.includes('belt') ||
    query.includes('spz') ||
    query.includes('spa') ||
    query.includes('spb') ||
    query.includes('spc') ||
    query.includes('wedge') ||
    query.includes('fenner') ||
    query.includes('pix') ||
    query.includes('c 70') ||
    query.includes('a 45') ||
    query.includes('b 60') ||
    query.includes('c 90')
  ) {
    if (query.includes('timing') || query.includes('cogged') || query.includes('htd')) {
      return INDUSTRIAL_IMAGE_CATALOG.timingBelt;
    }
    return INDUSTRIAL_IMAGE_CATALOG.vBelt;
  }

  // 2. Pulleys & Taper Bushes
  if (query.includes('pulley') || query.includes('groove') || query.includes('sheave')) {
    return INDUSTRIAL_IMAGE_CATALOG.pulley;
  }
  if (query.includes('bush') || query.includes('taper-lock') || query.includes('2517') || query.includes('2012')) {
    return INDUSTRIAL_IMAGE_CATALOG.taperBush;
  }

  // 3. Angular Contact Bearings
  if (query.includes('angular') || query.includes('7322') || query.includes('72') || query.includes('73')) {
    return INDUSTRIAL_IMAGE_CATALOG.angularContact;
  }

  // 4. Mounted Units & Pillow Blocks
  if (query.includes('pillow') || query.includes('ucp') || query.includes('plummer') || query.includes('housing')) {
    return INDUSTRIAL_IMAGE_CATALOG.pillowBlock;
  }

  // 5. Spherical & Taper Roller Bearings
  if (
    query.includes('spherical') ||
    query.includes('taper') ||
    query.includes('roller') ||
    query.includes('22220') ||
    query.includes('22218') ||
    query.includes('30206') ||
    query.includes('32210')
  ) {
    return INDUSTRIAL_IMAGE_CATALOG.rollerBearing;
  }

  // 6. Lubrication & Industrial Grease
  if (query.includes('grease') || query.includes('lgmt') || query.includes('lubricant') || query.includes('oil')) {
    return INDUSTRIAL_IMAGE_CATALOG.grease;
  }

  // 7. Laser Alignment & Vibration
  if (query.includes('laser') || query.includes('alignment') || query.includes('vibration') || query.includes('diagnostic')) {
    return INDUSTRIAL_IMAGE_CATALOG.diagnostics;
  }

  // 8. Ball Bearings (Default for bearing category: 6204, 6306, 6205, etc.)
  if (query.includes('bearing') || query.includes('skf') || query.includes('nbc') || query.includes('hch') || query.includes('ball')) {
    return INDUSTRIAL_IMAGE_CATALOG.ballBearing;
  }

  return INDUSTRIAL_IMAGE_CATALOG.ballBearing;
};
