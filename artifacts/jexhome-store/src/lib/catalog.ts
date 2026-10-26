import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { featuredProducts, products as defaultProducts, type Product } from '../data/products';
import {
  bestSellerCategories, blogPosts as defaultBlogPosts, homeOffers, newArrivals as defaultNewArrivals,
  type BestSellerCategory, type BlogPost, type HomeOffer, type NewArrival,
} from '../data/content';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export type Order = {
  id: string;
  date: string; // ISO timestamp
  status: OrderStatus;
  payment: string;
  customer: {
    fullName: string; phone: string; email: string; address: string; apartment?: string;
    city: string; state: string; pincode: string;
  };
  items: { name: string; slug: string; image: string; price: number; quantity: number; color: string; size: string }[];
  subtotal: number;
  total: number;
};

type CatalogState = {
  products: Product[];
  featuredIds: string[];
  bestSellers: BestSellerCategory[];
  newArrivals: NewArrival[];
  offers: HomeOffer[];
  blogPosts: BlogPost[];
  orders: Order[];
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  setFeatured: (ids: string[]) => void;
  setBestSellers: (list: BestSellerCategory[]) => void;
  setNewArrivals: (list: NewArrival[]) => void;
  setOffers: (list: HomeOffer[]) => void;
  setBlogPosts: (list: BlogPost[]) => void;
  addOrder: (order: Order) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  resetContent: () => void;
};

const defaults = () => ({
  products: defaultProducts,
  featuredIds: featuredProducts.map(p => p.id),
  bestSellers: bestSellerCategories,
  newArrivals: defaultNewArrivals,
  offers: homeOffers,
  blogPosts: defaultBlogPosts,
});

// localStorage holds ~5MB; uploaded photos can overflow it, so report instead of crashing the page.
const safeStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  removeItem: (name: string) => localStorage.removeItem(name),
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      window.dispatchEvent(new CustomEvent('catalog-storage-full'));
    }
  },
}));

export const useCatalog = create<CatalogState>()(persist((set) => ({
  ...defaults(),
  orders: [],
  saveProduct: product => set(state => ({
    products: state.products.some(p => p.id === product.id)
      ? state.products.map(p => p.id === product.id ? product : p)
      : [product, ...state.products],
  })),
  deleteProduct: id => set(state => ({
    products: state.products.filter(p => p.id !== id),
    featuredIds: state.featuredIds.filter(f => f !== id),
  })),
  setFeatured: featuredIds => set({ featuredIds }),
  setBestSellers: bestSellers => set({ bestSellers }),
  setNewArrivals: newArrivals => set({ newArrivals }),
  setOffers: offers => set({ offers }),
  setBlogPosts: blogPosts => set({ blogPosts }),
  addOrder: order => set(state => ({ orders: [order, ...state.orders] })),
  setOrderStatus: (id, status) => set(state => ({ orders: state.orders.map(o => o.id === id ? { ...o, status } : o) })),
  deleteOrder: id => set(state => ({ orders: state.orders.filter(o => o.id !== id) })),
  // Orders are kept; only the editable storefront content goes back to the shipped defaults.
  resetContent: () => set(defaults()),
}), { name: 'jexhome-catalog', version: 1, storage: safeStorage }));

// An order placed in another tab must reach an already-open admin tab; otherwise that tab's
// next save writes its stale copy back and wipes the new order.
window.addEventListener('storage', e => {
  if (e.key === 'jexhome-catalog') useCatalog.persist.rehydrate();
});

export const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
