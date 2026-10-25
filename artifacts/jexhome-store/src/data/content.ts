// Default storefront content. The admin panel copies these into the catalog store and edits them there.
export type BestSellerCategory = { name: string; slug: string; image: string; flat?: boolean };
export type NewArrival = { slug: string; category: string; title: string; image: string; position: string };
export type HomeOffer = { tag: string; title: string; text: string; image: string; position: string; href: string };

export const bestSellerCategories: BestSellerCategory[] = [
  { name: "Men's Polos", slug: 'men', image: '/images/polo-white-flat.jpg', flat: true },
  { name: "Women's Tees", slug: 'women', image: '/images/cat-women.jpg' },
  { name: 'Kids Wear', slug: 'kids', image: '/images/cat-kids.jpg' },
  { name: 'Hoodies', slug: 'hoodies', image: '/images/prod-oversized-hoodie.jpg' },
  { name: 'Cushions & Pillow', slug: 'cushions-pillow', image: '/images/cushion-rosette.jpg' },
];

export const newArrivals: NewArrival[] = [
  { slug: 'zip-polo-t-shirt-white', category: 'men', title: 'Classic Zip Polo White Edition', image: '/images/polo-white-full.jpg', position: 'center 30%' },
  { slug: 'zip-polo-t-shirt-pack-of-3', category: 'men', title: 'Zip Polo Trio Value Pack of 3', image: '/images/polo-pack3.jpg', position: 'center 30%' },
  { slug: 'pom-pom-cushion-cover-set', category: 'cushions-pillow', title: 'Pom Pom Cushion Pop of Colour Set', image: '/images/cushion-pompom-sofa.jpg', position: '62% center' },
  { slug: 'rosette-ruffle-cushion-cover', category: 'cushions-pillow', title: 'Rosette Ruffle Cushion Pair', image: '/images/cushion-rosette.jpg', position: '40% center' },
];

export const homeOffers: HomeOffer[] = [
  {
    tag: 'Up to 39% Off', title: 'Zip polo trio value pack', text: 'Navy, Black & Maroon zip polos together in one smart pack.',
    image: '/images/polo-pack3.jpg', position: 'center 25%', href: '/product/zip-polo-t-shirt-pack-of-3'
  },
  {
    tag: '30% Off', title: 'Pom pom cushion collection', text: 'Hand-finished cushions that brighten up every sofa.',
    image: '/images/cushion-pompom-angled.jpg', position: '60% center', href: '/product/pom-pom-cushion-cover-set'
  },
  {
    tag: 'Buy 2 & Save 34%', title: 'Polo pairs that fit you', text: 'Mix two zip polo shades and look sharp all week long.',
    image: '/images/polo-pack2-maroon-black.jpg', position: 'center 25%', href: '/product/zip-polo-t-shirt-pack-of-2'
  },
];

export type BlogPost = {
  slug: string; title: string; image: string; position: string; date: string;
  body: string[]; shopHref: string; shopLabel: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'style-zip-polo-every-occasion',
    title: 'How to Style a Zip Polo for Every Occasion',
    image: '/images/polo-white-full.jpg', position: 'center 30%', date: 'October 18, 2026',
    body: [
      'The zip polo is the easiest way to look put-together without trying too hard. Its gold-tone quarter zip adds a sharp, modern detail that a regular polo simply does not have.',
      'For a relaxed café or weekend look, pair a White zip polo with beige chinos and clean white sneakers. Keep the zip half-open and add a pair of sunglasses for an effortless summer vibe.',
      'Heading to the office or a dinner? Choose Black or Navy, zip it up and tuck it into tailored trousers with loafers. The pique knit holds its shape, so you stay crisp all day.',
      'For match days and evenings out, Grey and Maroon add colour without being loud. Roll the sleeves once and finish with a leather-strap watch.',
    ],
    shopHref: '/shop/men', shopLabel: 'Shop Zip Polos',
  },
  {
    slug: 'polo-fit-size-guide',
    title: 'Choosing the Right Polo Fit: A Simple Size Guide',
    image: '/images/polo-black-front.jpg', position: 'center 25%', date: 'October 12, 2026',
    body: [
      'A polo that fits well looks twice as premium. The shoulder seam should sit right on the edge of your shoulder, and the sleeves should end around the middle of your bicep.',
      'Measure your chest just under the arms and compare it with our size chart. If you are between two sizes, pick the smaller one for a sharp fit or the larger one for a relaxed weekend feel.',
      'Length matters too: the hem should reach the middle of your zip fly so you can wear it tucked or untucked. Our zip polos have side vents that keep the hem sitting neatly either way.',
      'Not sure? Every JexHome order comes with 7-day easy size exchanges and free doorstep pickup.',
    ],
    shopHref: '/product/zip-polo-t-shirt-black', shopLabel: 'Shop the Black Polo',
  },
  {
    slug: 'brighten-living-room-statement-cushions',
    title: 'Brighten Your Living Room with Statement Cushions',
    image: '/images/cushion-pompom-sofa.jpg', position: '60% center', date: 'October 5, 2026',
    body: [
      'Cushions are the quickest, most affordable way to refresh a room. A neutral grey or beige sofa becomes a styled corner the moment you add colour and texture.',
      'Go bold with our hot pink Pom Pom cushions for a playful pop, or keep it soft and romantic with the Blush Pleated Stripe set. The Rosette Ruffle covers add handcrafted 3D texture that looks beautiful in warm evening light.',
      'Styling tip: mix one statement cushion with one simpler piece in a matching tone, and arrange them in odd numbers. Lumbar cushions like the Mustard Fringe pair work great in front of square ones.',
      'All our covers have hidden zips, so they are easy to wash and swap with the seasons.',
    ],
    shopHref: '/shop/cushions-pillow', shopLabel: 'Shop Cushions',
  },
];
