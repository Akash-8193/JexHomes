export type Product = {
  id: string; slug: string; name: string; category: string; price: number; rating: number;
  reviews: number; colors: string[]; sizes: string[]; image: string; type?: string; listingVisible?: boolean;
  // Real product photography: gallery shots, copy, and siblings that share a `group` act as colour variants.
  gallery?: string[]; mrp?: number; description?: string; highlights?: string[]; group?: string; isNew?: boolean; badge?: string;
};

const tee = '/images/prod-good-vibes.jpg';
const artworks: Record<string, string[]> = {
  men: [
    '/images/prod-good-vibes.jpg',
    '/images/prod-abstract-tee.jpg',
    '/images/prod-basic-tee.jpg',
    '/images/prod-skull-tee.jpg',
    '/images/prod-typography-tee.jpg',
    '/images/prod-moon-tee.jpg',
    '/images/prod-minimal-tee.jpg',
    '/images/prod-graphic-art.png',
  ],
  women: [
    '/images/cat-women.jpg',
    '/images/prod-good-vibes.jpg',
    '/images/prod-typography-tee.jpg',
    '/images/prod-abstract-tee.jpg',
    '/images/prod-moon-tee.jpg',
    '/images/prod-basic-tee.jpg',
  ],
  kids: [
    '/images/prod-dino-kids.png',
    '/images/cat-kids.jpg',
    '/images/prod-typography-tee.jpg',
    '/images/prod-good-vibes.jpg',
    '/images/prod-dino-kids.png',
    '/images/prod-abstract-tee.jpg',
  ],
  hoodies: [
    '/images/prod-oversized-hoodie.jpg',
    '/images/prod-oversized-hoodie.jpg',
    '/images/prod-oversized-hoodie.jpg',
    '/images/prod-oversized-hoodie.jpg',
    '/images/prod-oversized-hoodie.jpg',
    '/images/prod-oversized-hoodie.jpg',
  ],
};
const make = (category: string, names: string[], prices: number[], ratings: number[], colors: string[][]): Product[] =>
  names.map((name, i) => ({
    id: `${category}-${i + 1}`, slug: name === 'Good Vibes T-Shirt' ? 'good-vibes-oversized-t-shirt' : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name, category, price: prices[i], rating: ratings[i], reviews: [120, 96, 72, 68, 91, 64][i % 6],
    colors: colors[i % colors.length], sizes: category === 'kids' ? ['2-3 Years', '4-5 Years', '5-6 Years', '7-8 Years'] : ['S', 'M', 'L', 'XL', 'XXL'],
    image: artworks[category]?.[i % (artworks[category]?.length ?? 1)] ?? tee, type: category === 'cushions-pillow' ? 'Cushion' : 'T-Shirt',
    // Old graphic men's tees stay only as data (custom print base); the men's range is now the zip polos.
    listingVisible: category !== 'men',
  }));

const poloHighlights = [
  'Premium cotton-blend pique knit, soft and breathable',
  'Gold-tone metal quarter zip placket',
  'Classic flat-knit collar that holds its shape',
  'Ribbed sleeve cuffs and side vents at the hem',
  'Regular smart fit, easy to dress up or down',
];
const poloColors = { white: '#f7f6f2', black: '#111', navy: '#1f2f5c', grey: '#a9abad', maroon: '#8e1b26' };
const polo = (color: keyof typeof poloColors, label: string, shots: string[], rating: number, reviews: number, mood: string): Product => ({
  id: `polo-${color}`, slug: `zip-polo-t-shirt-${color}`, name: `Zip Polo T-Shirt – ${label}`, category: 'men', type: 'Polo T-Shirts',
  price: 799, mrp: 1099, rating, reviews, colors: [poloColors[color]], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  image: `/images/polo-${color}-front.jpg`, gallery: shots.map(s => `/images/polo-${color}-${s}.jpg`),
  group: 'zip-polo', isNew: true,
  description: `A modern take on the classic polo. Our ${label.toLowerCase()} zip polo pairs a soft pique knit with a gold-tone quarter zip for a clean, elevated look. ${mood}`,
  highlights: poloHighlights,
});

const polos: Product[] = [
  polo('white', 'White', ['front', 'full', 'side', 'back', 'flat'], 4.8, 142, 'Crisp and fresh – wear it with beige chinos and white sneakers for an easy café-to-dinner outfit.'),
  polo('black', 'Black', ['front', 'side', 'back', 'profile', 'flat'], 4.9, 168, 'Sleek and versatile – pair it with black trousers for a sharp monochrome look, or with chinos for contrast.'),
  polo('navy', 'Navy Blue', ['front', 'angle', 'back', 'full', 'flat'], 4.8, 131, 'Rich and smart – a go-to for match days, weekend outings and evenings out.'),
  polo('grey', 'Grey', ['front', 'full', 'side', 'back', 'flat'], 4.7, 96, 'Understated and polished – perfect with dark trousers for work-to-weekend styling.'),
  {
    id: 'polo-pack-2', slug: 'zip-polo-t-shirt-pack-of-2', name: 'Zip Polo T-Shirt – Pack of 2', category: 'men', type: 'Polo T-Shirts',
    price: 1449, mrp: 2198, rating: 4.9, reviews: 88, colors: [poloColors.maroon, poloColors.navy, poloColors.black, poloColors.white], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/polo-pack2-navy-maroon.jpg',
    gallery: ['/images/polo-pack2-navy-maroon.jpg', '/images/polo-pack2-maroon-black.jpg', '/images/polo-pack2-maroon-white.jpg', '/images/polo-navy-flat.jpg', '/images/polo-black-flat.jpg'],
    isNew: true, badge: 'Pack of 2',
    description: 'Two zip polos, one great price. Mix your favourite shades – Maroon with Navy, Black or White – and you are set for the whole week. Same soft pique knit and gold-tone zip as our signature polo.',
    highlights: ['Pack of 2 zip polos – save more than 30%', ...poloHighlights.slice(0, 4)],
  },
  {
    id: 'polo-pack-3', slug: 'zip-polo-t-shirt-pack-of-3', name: 'Zip Polo T-Shirt – Pack of 3', category: 'men', type: 'Polo T-Shirts',
    price: 1999, mrp: 3297, rating: 4.9, reviews: 74, colors: [poloColors.navy, poloColors.black, poloColors.maroon], sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: '/images/polo-pack3.jpg',
    gallery: ['/images/polo-pack3.jpg', '/images/polo-navy-front.jpg', '/images/polo-black-front.jpg', '/images/polo-pack2-maroon-black.jpg', '/images/polo-navy-flat.jpg'],
    isNew: true, badge: 'Pack of 3',
    description: 'The complete zip polo wardrobe: Navy, Black and Maroon in one value pack. Three timeless shades that pair with everything from chinos to tailored trousers.',
    highlights: ['Pack of 3 zip polos – Navy, Black & Maroon', ...poloHighlights.slice(0, 4)],
  },
];

const cushions: Product[] = [
  {
    id: 'cushion-pompom', slug: 'pom-pom-cushion-cover-set', name: 'Pom Pom Cushion Cover – Set of 2', category: 'cushions-pillow', type: 'Cushion',
    price: 699, mrp: 999, rating: 4.9, reviews: 112, colors: ['#e3226f'], sizes: ['12" x 20"'],
    image: '/images/cushion-pompom-sofa.jpg',
    gallery: ['/images/cushion-pompom-sofa.jpg', '/images/cushion-pompom-angled.jpg', '/images/cushion-pompom-side.jpg', '/images/cushion-pompom-front.jpg', '/images/cushion-pompom-details.jpg', '/images/cushion-pompom-collage.jpg'],
    isNew: true, badge: 'Set of 2',
    description: 'Add a pop of colour to your home! These hot pink lumbar cushion covers are trimmed with playful yellow pom poms for a cheerful, trendy touch on your sofa, bed or lounge chair.',
    highlights: ['Set of 2 rectangular cushion covers', 'Soft textured fabric, gentle on skin', 'Hand-finished yellow pom pom trim', 'Durable stitching with hidden zip closure', 'Perfect for living room, bedroom or any space'],
  },
  {
    id: 'cushion-blush-stripe', slug: 'blush-pleated-stripe-cushion-set', name: 'Blush Pleated Stripe Cushion Set', category: 'cushions-pillow', type: 'Cushion',
    price: 899, mrp: 1299, rating: 4.8, reviews: 84, colors: ['#c98b95'], sizes: ['16" x 16"', '18" x 18"'],
    image: '/images/cushion-blush-stripe-set.jpg',
    gallery: ['/images/cushion-blush-stripe-set.jpg', '/images/cushion-blush-stripe-sofa.jpg'],
    isNew: true,
    description: 'Elegant pin-tuck pleats in mauve, blush and ivory stripes give these velvet-touch cushion covers a luxe, layered look. A soft, romantic accent for neutral sofas.',
    highlights: ['Pleated velvet-touch fabric with a soft sheen', 'Mauve, blush & ivory colour-block stripes', 'Matching drawstring gift pouch included', 'Hidden zip closure for easy washing', 'Pairs beautifully with beige or grey sofas'],
  },
  {
    id: 'cushion-rosette', slug: 'rosette-ruffle-cushion-cover', name: 'Rosette Ruffle Cushion Cover – Set of 2', category: 'cushions-pillow', type: 'Cushion',
    price: 749, mrp: 1099, rating: 4.7, reviews: 63, colors: ['#e9a99a'], sizes: ['16" x 16"'],
    image: '/images/cushion-rosette.jpg',
    gallery: ['/images/cushion-rosette.jpg'],
    isNew: true, badge: 'Set of 2',
    description: 'A statement piece for your sofa – layered ruffles in wine and ivory swirl into a soft rosette centre on a dusty-peach base. Handcrafted texture that looks beautiful in warm lighting.',
    highlights: ['Set of 2 square cushion covers', 'Handcrafted 3D ruffle rosette design', 'Dusty peach, wine & ivory tones', 'Pleated corner accents', 'Hidden zip closure'],
  },
  {
    id: 'cushion-mustard-fringe', slug: 'mustard-fringe-lumbar-cushion', name: 'Mustard Fringe Lumbar Cushion – Set of 2', category: 'cushions-pillow', type: 'Cushion',
    price: 649, mrp: 949, rating: 4.8, reviews: 71, colors: ['#e9b824'], sizes: ['12" x 20"'],
    image: '/images/cushion-mustard-fringe.jpg',
    gallery: ['/images/cushion-mustard-fringe.jpg'],
    isNew: true, badge: 'Set of 2',
    description: 'Sunny mustard lumbar cushions with tonal pin-tuck lines and soft fringe edges. A bright, boho accent that lifts grey and neutral sofas instantly.',
    highlights: ['Set of 2 rectangular lumbar covers', 'Cotton canvas with pin-tuck stripes', 'Hand-knotted fringe side trims', 'Hidden zip closure', 'Great for sofas, beds and reading nooks'],
  },
];

export const products: Product[] = [
  ...make('men', ['Good Vibes T-Shirt', 'Abstract Print T-Shirt', 'Basic Oversized T-Shirt', 'Skull Art T-Shirt', 'Typography T-Shirt', 'Moon Graphic T-Shirt', 'Minimal Text T-Shirt', 'Graphic Art T-Shirt'], [499,549,499,599,499,549,499,549], [4.8,4.7,4.6,4.7,4.8,4.7,4.8,4.7], [['#111','#ef897f','#cc2871'],['#b8d9ed','#132b4a','#111'],['#e25354','#d14a8b','#6333a4'],['#ed8b35','#763c85','#2273c2'],['#e78b41','#9b4637','#111'],['#e9833a','#172a4b','#777']]),
  ...polos,
  ...make('women', ['Wildflower Graphic T-Shirt', 'Everyday Essential Tee', 'Soft Lines T-Shirt', 'Sunshine Club T-Shirt', 'Abstract Bloom T-Shirt', 'Weekend Mood Tee'], [549,449,599,499,549,499], [4.8,4.7,4.9,4.6,4.8,4.7], [['#f5e7dc','#111','#d98e87'],['#ded8cd','#111','#b86f65'],['#bfcbd5','#111','#c47579']]),
  ...make('kids', ['Dino Kids T-Shirt', 'Little Explorer Tee', 'Happy Rocket T-Shirt', 'Rainbow Days Tee', 'Jungle Friends T-Shirt', 'Super Cool Kids Tee'], [399,399,449,399,449,399], [4.8,4.7,4.8,4.9,4.7,4.8], [['#edc52d','#3e91c1','#239d9b'],['#f2c943','#3092c1','#e8754e']]),
  ...make('hoodies', ['Oversized Hoodie', 'Weekend Graphic Hoodie', 'Classic Comfort Hoodie', 'Good Energy Hoodie', 'Minimal Mark Hoodie', 'Abstract Art Hoodie'], [999,1199,899,1099,999,1199], [4.7,4.8,4.6,4.9,4.7,4.8], [['#111','#c94743','#392e68'],['#222','#b24942','#f0e9df']]),
  ...cushions,
];

export const featuredProducts: Product[] = ['polo-white', 'polo-black', 'polo-navy', 'polo-grey'].map(id => products.find(p => p.id === id)!);

export const categoryMeta: Record<string, {title: string; subtitle: string; description: string}> = {
  men: {title:'Men T-Shirts',subtitle:'T-Shirts & Hoodies',description:"Explore our premium collection of men's t-shirts."},
  women: {title:'Women T-Shirts',subtitle:'Trendy & Comfortable',description:"Explore our premium collection of women's t-shirts."},
  kids: {title:'Kids T-Shirts',subtitle:'Cute & Fun Styles',description:"Explore our premium collection of kids' t-shirts."},
  hoodies: {title:'Hoodies',subtitle:'Comfort for Every Day',description:'Find your new favorite layer in our hoodie collection.'},
  'cushions-pillow': {title:'Cushions & Pillow',subtitle:'Decorate Your Space',description:'Bring a little personality home with our cushion collection.'},
};
