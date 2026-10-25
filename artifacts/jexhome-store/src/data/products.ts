export type Product = {
  id: string; slug: string; name: string; category: string; price: number; rating: number;
  reviews: number; colors: string[]; sizes: string[]; image: string; type?: string; listingVisible?: boolean;
};

const tee = '/images/product-good-vibes-tshirt.svg';
const artworks: Record<string, string[]> = {
  men: ['/images/product-good-vibes-tshirt.svg','/images/product-abstract-print-tshirt.svg','/images/product-basic-oversized-tshirt.svg','/images/product-skull-art-tshirt.svg','/images/product-typography-tshirt.svg','/images/product-moon-graphic-tshirt.svg','/images/product-basic-oversized-tshirt.svg','/images/product-abstract-print-tshirt.svg'],
  women: ['/images/product-wildflower-tshirt.svg','/images/product-abstract-print-tshirt.svg','/images/product-good-vibes-tshirt.svg','/images/product-typography-tshirt.svg','/images/product-wildflower-tshirt.svg','/images/product-moon-graphic-tshirt.svg'],
  kids: ['/images/product-dino-kids-tshirt.svg','/images/product-good-vibes-tshirt.svg','/images/product-abstract-print-tshirt.svg','/images/product-typography-tshirt.svg','/images/product-dino-kids-tshirt.svg','/images/product-moon-graphic-tshirt.svg'],
  hoodies: ['/images/product-oversized-hoodie.svg','/images/product-oversized-hoodie.svg','/images/product-oversized-hoodie.svg','/images/product-oversized-hoodie.svg','/images/product-oversized-hoodie.svg','/images/product-oversized-hoodie.svg'],
  'cushions-pillow': ['/images/product-cushion-botanical.svg'],
};
const make = (category: string, names: string[], prices: number[], ratings: number[], colors: string[][]): Product[] =>
  names.map((name, i) => ({
    id: `${category}-${i + 1}`, slug: name === 'Good Vibes T-Shirt' ? 'good-vibes-oversized-t-shirt' : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name, category, price: prices[i], rating: ratings[i], reviews: [120, 96, 72, 68, 91, 64][i % 6],
    colors: colors[i % colors.length], sizes: category === 'kids' ? ['2-3 Years', '4-5 Years', '5-6 Years', '7-8 Years'] : ['S', 'M', 'L', 'XL', 'XXL'],
    image: artworks[category]?.[i % (artworks[category]?.length ?? 1)] ?? tee, type: category === 'cushions-pillow' ? 'Cushion' : 'T-Shirt',
    listingVisible: !['Minimal Text T-Shirt','Graphic Art T-Shirt'].includes(name),
  }));

export const products: Product[] = [
  ...make('men', ['Good Vibes T-Shirt', 'Abstract Print T-Shirt', 'Basic Oversized T-Shirt', 'Skull Art T-Shirt', 'Typography T-Shirt', 'Moon Graphic T-Shirt', 'Minimal Text T-Shirt', 'Graphic Art T-Shirt'], [499,549,499,599,499,549,499,549], [4.8,4.7,4.6,4.7,4.8,4.7,4.8,4.7], [['#111','#ef897f','#cc2871'],['#b8d9ed','#132b4a','#111'],['#e25354','#d14a8b','#6333a4'],['#ed8b35','#763c85','#2273c2'],['#e78b41','#9b4637','#111'],['#e9833a','#172a4b','#777']]),
  ...make('women', ['Wildflower Graphic T-Shirt', 'Everyday Essential Tee', 'Soft Lines T-Shirt', 'Sunshine Club T-Shirt', 'Abstract Bloom T-Shirt', 'Weekend Mood Tee'], [549,449,599,499,549,499], [4.8,4.7,4.9,4.6,4.8,4.7], [['#f5e7dc','#111','#d98e87'],['#ded8cd','#111','#b86f65'],['#bfcbd5','#111','#c47579']]),
  ...make('kids', ['Dino Kids T-Shirt', 'Little Explorer Tee', 'Happy Rocket T-Shirt', 'Rainbow Days Tee', 'Jungle Friends T-Shirt', 'Super Cool Kids Tee'], [399,399,449,399,449,399], [4.8,4.7,4.8,4.9,4.7,4.8], [['#edc52d','#3e91c1','#239d9b'],['#f2c943','#3092c1','#e8754e']]),
  ...make('hoodies', ['Oversized Hoodie', 'Weekend Graphic Hoodie', 'Classic Comfort Hoodie', 'Good Energy Hoodie', 'Minimal Mark Hoodie', 'Abstract Art Hoodie'], [999,1199,899,1099,999,1199], [4.7,4.8,4.6,4.9,4.7,4.8], [['#111','#c94743','#392e68'],['#222','#b24942','#f0e9df']]),
  ...make('cushions-pillow', ['Botanical Cushion Cover', 'Sunset Abstract Cushion', 'Good Vibes Cushion', 'Modern Lines Pillow', 'Wildflower Cushion Cover', 'Soft Geometry Cushion'], [499,549,449,499,549,499], [4.8,4.7,4.9,4.6,4.8,4.7], [['#d8cabe','#e2a681','#aaa89b'],['#d5d0c6','#cc9d82','#858978']]),
];

export const featuredProducts: Product[] = [
  products.find(p => p.name === 'Minimal Text T-Shirt')!,
  products.find(p => p.name === 'Oversized Hoodie')!,
  products.find(p => p.name === 'Dino Kids T-Shirt')!,
  products.find(p => p.name === 'Graphic Art T-Shirt')!,
];

export const categoryMeta: Record<string, {title: string; subtitle: string; description: string}> = {
  men: {title:'Men T-Shirts',subtitle:'T-Shirts & Hoodies',description:"Explore our premium collection of men's t-shirts."},
  women: {title:'Women T-Shirts',subtitle:'Trendy & Comfortable',description:"Explore our premium collection of women's t-shirts."},
  kids: {title:'Kids T-Shirts',subtitle:'Cute & Fun Styles',description:"Explore our premium collection of kids' t-shirts."},
  hoodies: {title:'Hoodies',subtitle:'Comfort for Every Day',description:'Find your new favorite layer in our hoodie collection.'},
  'cushions-pillow': {title:'Cushions & Pillow',subtitle:'Decorate Your Space',description:'Bring a little personality home with our cushion collection.'},
};
