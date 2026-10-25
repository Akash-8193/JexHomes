import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/products';

export type CartItem = { key: string; product: Product; quantity: number; color: string; size: string };
type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  add: (product: Product, color?: string, size?: string, quantity?: number) => void;
  quantity: (key: string, delta: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
};
const demoCart: CartItem[] = [
  { key:'good-vibes-ivory-l', product:{id:'demo-good',slug:'good-vibes-oversized-t-shirt',name:'Good Vibes Oversized T-Shirt',category:'men',price:499,rating:4.8,reviews:120,colors:['#f1eee7','#111','#d7282f','#245f9c','#198e92','#e4c330'],sizes:['S','M','L','XL','XXL'],image:'/images/product-good-vibes-tshirt.svg'}, quantity:1,color:'Off White',size:'L' },
  { key:'abstract-black-m', product:{id:'men-2',slug:'abstract-print-t-shirt',name:'Abstract Print T-Shirt',category:'men',price:549,rating:4.7,reviews:96,colors:['#b8d9ed','#132b4a','#111'],sizes:['S','M','L','XL','XXL'],image:'/images/product-abstract-print-tshirt.svg'}, quantity:1,color:'Black',size:'M' },
  { key:'dino-yellow-56', product:{id:'kids-1',slug:'dino-kids-t-shirt',name:'Dino Kids T-Shirt',category:'kids',price:399,rating:4.8,reviews:70,colors:['#edc52d','#3e91c1','#239d9b'],sizes:['2-3 Years','4-5 Years','5-6 Years','7-8 Years'],image:'/images/product-dino-kids-tshirt.svg'}, quantity:1,color:'Yellow',size:'5-6 Years' },
];

export const useStore = create<StoreState>()(persist((set) => ({
  cart: demoCart,
  wishlist: [],
  add: (product, color = 'Off White', size = product.sizes[1] ?? 'M', quantity = 1) =>
    set(state => {
      const key = `${product.slug}-${color}-${size}`;
      const found = state.cart.find(item => item.key === key);
      return { cart: found
        ? state.cart.map(item => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
        : [...state.cart, { key, product, quantity, color, size }] };
    }),
  quantity: (key, delta) => set(state => ({ cart: state.cart.map(item => item.key === key ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item) })),
  remove: key => set(state => ({ cart: state.cart.filter(item => item.key !== key) })),
  clear: () => set({ cart: [] }),
  toggleWish: id => set(state => ({ wishlist: state.wishlist.includes(id) ? state.wishlist.filter(item => item !== id) : [...state.wishlist, id] })),
}), { name: 'jexhome-store', partialize: state => ({ cart: state.cart, wishlist: state.wishlist }) }));

export const store = {
  getState: useStore.getState,
  add: (product: Product, color?: string, size?: string, quantity?: number) => useStore.getState().add(product,color,size,quantity),
  quantity: (key: string, delta: number) => useStore.getState().quantity(key,delta),
  remove: (key: string) => useStore.getState().remove(key),
  clear: () => useStore.getState().clear(),
  toggleWish: (id: string) => useStore.getState().toggleWish(id),
};
