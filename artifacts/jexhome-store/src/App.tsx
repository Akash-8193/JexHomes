import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams, useSearch } from 'wouter';
import {
  Heart, Search, UserRound, ShoppingBag, ShoppingCart, Menu, X,
  ShieldCheck, Sparkles, Truck, Globe2, ArrowRight, Upload, Type,
  Shapes, Palette, Box, Trash2, Plus, Minus, Play, PackageCheck,
  RotateCcw, Leaf, SlidersHorizontal, ChevronRight, Instagram,
  Facebook, Youtube, CheckCircle2, Star, CreditCard, Smartphone, Check,
  Eye, Repeat2, ListFilter, Headphones, CalendarDays
} from 'lucide-react';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { products as baseProducts, type Product } from './data/products';
import type { BlogPost } from './data/content';
import { useCatalog } from './lib/catalog';
import AdminPage from './pages/Admin';
import { store, useStore, type CartItem } from './lib/store';

const currency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const categoryLinks = [
  ['Men', 'men'],
  ['Women', 'women'],
  ['Kids', 'kids'],
  ['Hoodies', 'hoodies'],
  ['Cushions & Pillow', 'cushions-pillow']
] as const;

const getColorName = (color: string) => ({
  '#f1eee7': 'Off White',
  '#111': 'Black',
  '#d7282f': 'Red',
  '#245f9c': 'Blue',
  '#198e92': 'Teal',
  '#e4c330': 'Yellow',
  '#ef897f': 'Salmon',
  '#cc2871': 'Magenta',
  '#fff': 'White',
  '#f7f6f2': 'White',
  '#1f2f5c': 'Navy Blue',
  '#a9abad': 'Grey',
  '#8e1b26': 'Maroon',
  '#e3226f': 'Hot Pink',
  '#c98b95': 'Blush Mauve',
  '#e9a99a': 'Dusty Peach',
  '#e9b824': 'Mustard',
}[color] || color);

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Enter your full name'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(5, 'Enter your street address'),
  apartment: z.string().optional(),
  state: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit pincode')
});
type CheckoutFields = z.infer<typeof checkoutSchema>;

// Shared Toast Notification State
let globalToastHandler: ((msg: string) => void) | null = null;
const notify = (msg: string) => {
  if (globalToastHandler) globalToastHandler(msg);
};

function addProduct(product: Product, color = 'Off White', size?: string, quantity = 1) {
  store.add(product, getColorName(color), size ?? product.sizes[1] ?? 'M', quantity);
  notify(`Added ${product.name} to cart`);
}

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();
  const products = useCatalog(s => s.products);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(p => p.listingVisible !== false && (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.type && p.type.toLowerCase().includes(q))
    )).slice(0, 6);
  }, [query]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close search"><X size={16} /></button>
        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Search Products</h3>
        <p style={{ margin: 0, fontSize: 11, color: '#777' }}>Find custom tees, hoodies, kidswear, cushions & more</p>
        
        <div className="search-input-box">
          <Search size={18} color="#888" />
          <input
            autoFocus
            type="search"
            placeholder="Type to search (e.g. Good Vibes, Hoodie, Kids, Dino)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && <button onClick={() => setQuery('')} style={{ border: 0, background: 'none', cursor: 'pointer' }}><X size={14} /></button>}
        </div>

        <div className="search-tags">
          <span style={{ fontSize: 10, color: '#888', alignSelf: 'center' }}>Popular:</span>
          {['Good Vibes', 'Oversized Hoodie', 'Dino Kids', 'Abstract Print', 'Cushions'].map(tag => (
            <button key={tag} className="search-tag" onClick={() => setQuery(tag)}>{tag}</button>
          ))}
        </div>

        {query && (
          <div className="search-results-list">
            {results.length > 0 ? results.map(p => (
              <div
                key={p.id}
                className="search-result-item"
                onClick={() => {
                  onClose();
                  navigate(`/product/${p.slug}`);
                }}
              >
                <img src={p.image} alt={p.name} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#777' }}>{p.category.toUpperCase()} · ★ {p.rating}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#d7282f' }}>{currency(p.price)}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: '#777' }}>
                No products found for "{query}". Try another keyword.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useStore();
  const [, navigate] = useLocation();

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close account"><X size={16} /></button>
        <div className="account-profile-header">
          <div className="account-avatar">AK</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Akash Kumar</h3>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#777' }}>akash@example.com · +91 95993 42525</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#f8f6f2', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#d7282f' }}>{state.cart.length}</span>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Items in Cart</div>
          </div>
          <div style={{ background: '#f8f6f2', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{state.wishlist.length}</span>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Wishlist Saved</div>
          </div>
        </div>

        <h4 style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>Recent Order</h4>
        <div className="account-order-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>Order #JH-9821</strong>
            <span style={{ fontSize: 9, background: '#eaf7ee', color: '#28a745', padding: '3px 8px', borderRadius: 12, fontWeight: 600 }}>In Transit</span>
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>Good Vibes Oversized T-Shirt (Off White / L)</div>
          <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>Expected delivery: Within 2 days via BlueDart Express</div>
        </div>

        <h4 style={{ margin: '16px 0 8px', fontSize: 12, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>Default Address</h4>
        <div style={{ fontSize: 11, color: '#555', background: '#faf9f7', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
          <strong>Akash Kumar</strong><br />
          123, Sector 15, Near Metro Station<br />
          Delhi, 110015 — India
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            className="pill pill-dark"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              onClose();
              navigate('/cart');
            }}
          >
            View Cart
          </button>
          <button
            className="pill pill-outline"
            style={{ flex: 1, justifyContent: 'center', borderColor: '#ddd' }}
            onClick={() => {
              notify('Profile preferences updated.');
              onClose();
            }}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoModal({ info, onClose }: { info: { title: string; content: string } | null; onClose: () => void }) {
  if (!info) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={16} /></button>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700 }}>{info.title}</h3>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{info.content}</div>
        <button
          className="pill pill-dark"
          style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
          onClick={onClose}
        >
          Got It
        </button>
      </div>
    </div>
  );
}

function OrderSuccessModal({ order, onClose }: { order: { id: string; total: number; count: number } | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-window order-success-card" onClick={e => e.stopPropagation()}>
        <div className="order-success-icon">
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700 }}>Order Placed Successfully!</h2>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#666' }}>Thank you for shopping with JexHome.</p>

        <div style={{ background: '#f8f6f2', padding: 14, borderRadius: 10, margin: '14px 0', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span>Order Reference:</span>
            <strong>{order.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span>Items Ordered:</span>
            <strong>{order.count} pieces</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span>Total Paid:</span>
            <strong style={{ color: '#d7282f' }}>{currency(order.total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>Estimated Delivery:</span>
            <strong>3-4 Business Days</strong>
          </div>
        </div>

        <p style={{ fontSize: 10, color: '#888', margin: '10px 0 20px' }}>
          Confirmation and live tracking updates have been sent to your email & SMS.
        </p>

        <button
          className="pill pill-dark"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onClose}
        >
          Continue Shopping →
        </button>
      </div>
    </div>
  );
}

function Navbar({ onOpenSearch, onOpenAccount }: { onOpenSearch: () => void; onOpenAccount: () => void }) {
  const [open, setOpen] = useState(false);
  const state = useStore();

  return (
    <header className="topbar">
      <div className="container nav-inner">
        <button
          className="mobile-toggle"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          data-testid="button-toggle-menu"
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="brand" data-testid="link-home-logo">
          <img src="/logo.png" alt="JexHome" />
        </Link>
        <nav className="navlinks">
          {categoryLinks.map(([name, path]) => (
            <Link
              key={path}
              href={`/shop/${path}`}
              onClick={() => setOpen(false)}
              data-testid={`link-nav-${path}`}
            >
              {name}
            </Link>
          ))}
          <Link
            href="/custom-print"
            onClick={() => setOpen(false)}
            data-testid="link-nav-custom-print"
          >
            Custom Print
          </Link>
        </nav>
        <div className="nav-actions">
          <button
            className="icon-btn"
            aria-label="Search"
            data-testid="button-search"
            onClick={onOpenSearch}
            title="Search products"
          >
            <Search size={17} />
          </button>
          <button
            className="icon-btn"
            aria-label="Account"
            data-testid="button-account"
            onClick={onOpenAccount}
            title="My Account"
          >
            <UserRound size={17} />
          </button>
          <Link
            href="/wishlist"
            className="icon-btn"
            aria-label="Wishlist"
            data-testid="link-wishlist"
            title="My Wishlist"
          >
            <Heart size={17} />
            {state.wishlist.length > 0 && (
              <span className="count" style={{ background: '#111' }} data-testid="text-wishlist-count">
                {state.wishlist.length}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="icon-btn"
            aria-label="Cart"
            data-testid="link-cart"
            title="My Cart"
          >
            <ShoppingBag size={18} />
            {state.cart.length > 0 && (
              <span className="count" data-testid="text-cart-count">
                {state.cart.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} onOpenAccount={onOpenAccount} />
    </header>
  );
}

function MobileDrawer({ open, onClose, onOpenAccount }: { open: boolean; onClose: () => void; onOpenAccount: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const account = () => {
    onClose();
    onOpenAccount();
  };

  return (
    <div className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button className="drawer-backdrop" aria-label="Close menu" tabIndex={-1} onClick={onClose} />
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="drawer-head">
          <Link href="/" onClick={onClose} className="drawer-logo"><img src="/logo.png" alt="JexHome" /></Link>
          <button aria-label="Close menu" onClick={onClose} data-testid="button-close-menu"><X size={22} /></button>
        </div>

        <nav className="drawer-main">
          <Link href="/" onClick={onClose}>Home</Link>
          {categoryLinks.map(([name, path]) => (
            <Link key={path} href={`/shop/${path}`} onClick={onClose} data-testid={`link-drawer-${path}`}>{name}</Link>
          ))}
          <Link href="/custom-print" onClick={onClose}>Custom Print</Link>
        </nav>

        <div className="drawer-group">
          <span className="drawer-label">Collections</span>
          <Link href="/shop/men" onClick={onClose}>Zip Polo T-Shirts</Link>
          <Link href="/product/zip-polo-t-shirt-pack-of-3" onClick={onClose}>Polo Value Packs</Link>
          <Link href="/shop/cushions-pillow" onClick={onClose}>Cushion Covers</Link>
          <Link href="/shop" onClick={onClose} className="hot">New Arrivals 🔥</Link>
        </div>

        <div className="drawer-group">
          <span className="drawer-label">Account &amp; More</span>
          <button onClick={account}>My Account / Login</button>
          <Link href="/wishlist" onClick={onClose}>Wishlist</Link>
          <button onClick={account}>Track Order</button>
          <button onClick={account}>Help &amp; Support</button>
        </div>

        <div className="drawer-foot">JexHome Style • Everyday Edit</div>
      </aside>
    </div>
  );
}

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div className="container crumb" data-testid="breadcrumb">
      {items.map((item, i) => (
        <span key={`${item}-${i}`}>
          {i > 0 && <span>&gt;</span>}
          {i === 0 && item === 'Home' ? <Link href="/">{item}</Link> : item}
        </span>
      ))}
    </div>
  );
}

function ColorDots({
  colors,
  selected,
  onSelect,
  big = false
}: {
  colors: string[];
  selected?: string;
  onSelect?: (color: string) => void;
  big?: boolean;
}) {
  return (
    <div className={`swatches ${big ? 'big-swatches' : ''}`}>
      {colors.map((color, i) => (
        <button
          key={`${color}-${i}`}
          className={`swatch ${selected === color ? 'active' : ''}`}
          style={{ background: color }}
          onClick={onSelect ? () => onSelect(color) : undefined}
          aria-label={getColorName(color)}
          data-testid={`button-color-${color.replace('#', '')}-${i}`}
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const state = useStore();
  const wished = state.wishlist.includes(product.id);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '#111');

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    store.toggleWish(product.id);
    notify(wished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product, selectedColor);
  };

  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className={`product-visual ${product.gallery ? 'photo' : ''}`}>
        <Link href={`/product/${product.slug}`} data-testid={`link-product-image-${product.id}`}>
          <img src={product.image} alt={`${product.name} product image`} loading="lazy" />
        </Link>
        {(product.badge || product.isNew) && <span className="card-badge">{product.badge ?? 'New'}</span>}
        <button
          className={`heart ${wished ? 'selected' : ''}`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWish}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-meta">
        <div className="product-meta-header">
          <Link className="product-title" href={`/product/${product.slug}`} data-testid={`link-product-${product.id}`}>
            {product.name}
          </Link>
          <button
            className="quick-cart"
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
            onClick={handleQuickAdd}
            data-testid={`button-quick-cart-${product.id}`}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
        <div className="price-line" data-testid={`text-price-${product.id}`}>
          {currency(product.price)}
          {product.mrp && <del className="card-mrp">{currency(product.mrp)}</del>}
        </div>
        <div className="rating">
          <span className="stars">★★★★★</span> &nbsp;{product.rating.toFixed(1)} ({product.reviews})
        </div>
        <div className="swatches">
          {product.colors.map((c, i) => (
            <button
              key={`${c}-${i}`}
              className={`swatch ${selectedColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={e => {
                e.preventDefault();
                setSelectedColor(c);
              }}
              aria-label={getColorName(c)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

function Features({ trust = false }: { trust?: boolean }) {
  const list: [typeof ShieldCheck, string, string][] = trust
    ? [
        [ShieldCheck, 'Secure Payment', '100% Safe & Secure'],
        [Truck, 'Free Shipping', 'On orders above ₹499'],
        [RotateCcw, 'Easy Returns', '7 Days Return']
      ]
    : [
        [ShieldCheck, 'Premium', 'Quality Fabric'],
        [Sparkles, 'Custom', 'Printing'],
        [Truck, 'Fast & Secure', 'Delivery'],
        [Globe2, 'Designed', 'for Everyone']
      ];
  return (
    <div className={trust ? 'trust-row' : 'features'}>
      {list.map(([Icon, top, bottom]) => (
        <div className="feature" key={top}>
          <Icon />
          <span>
            <b>{top}</b>
            <br />
            {bottom}
          </span>
        </div>
      ))}
    </div>
  );
}

const categories = [
  { name: 'Men', sub: 'T-Shirts & Hoodies', href: '/shop/men', color: '#dcebf4', image: '/images/cat-men.jpg' },
  { name: 'Women', sub: 'Trendy & Comfortable', href: '/shop/women', color: '#f5e3e3', image: '/images/cat-women.jpg' },
  { name: 'Kids', sub: 'Cute & Fun Styles', href: '/shop/kids', color: '#f8edcf', image: '/images/cat-kids.jpg' },
  { name: 'Cushions & Pillow', sub: 'Decorate Your Space', href: '/shop/cushions-pillow', color: '#e9e6df', image: '/images/cat-cushions.jpg' },
];

const designTools = [
  [Upload, 'Upload'],
  [Type, 'Text'],
  [Shapes, 'Graphics'],
  [Palette, 'Colors'],
  [Box, 'Preview (3D)']
] as const;

function Home() {
  const [, navigate] = useLocation();
  const { products, featuredIds, bestSellers, newArrivals, offers, blogPosts } = useCatalog();
  const featuredProducts = featuredIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p));

  return (
    <>
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">CUSTOM APPAREL &amp; HOME DECOR</div>
            <h1 className="serif">
              Style<br />
              Your <span>Story</span>
            </h1>
            <p>Premium T-shirts, Hoodies, Kidswear, Cushions and more — with custom printing made just for you.</p>
            <div className="hero-ctas">
              <Link href="/shop/men" className="pill pill-dark" data-testid="link-shop-collection">
                Shop Collection <ArrowRight size={14} />
              </Link>
              <Link href="/custom-print" className="pill pill-outline" data-testid="link-customize-own">
                Customize Your Own
              </Link>
            </div>
            <Features />
          </div>
          <div className="hero-image">
            <img src="/images/hero-model.webp" alt="Young man wearing good things custom apparel" />
            <span className="handwritten">Wear Your Story</span>
          </div>
        </div>
      </section>

      <section className="container categories">
        {categories.map(cat => (
          <Link
            key={cat.name}
            className="category-card"
            href={cat.href}
            style={{ background: cat.color }}
            data-testid={`link-category-${cat.name.toLowerCase().replaceAll(' ', '-')}`}
          >
            <h3>{cat.name}</h3>
            <p>{cat.sub}</p>
            <img src={cat.image} alt={cat.name} />
            <span className="round-arrow">
              <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </section>

      <section className="best-seller container" aria-labelledby="best-seller-title">
        <span className="best-seller-pill">BEST SELLER</span>
        <h2 id="best-seller-title">Shop by Style Categories</h2>
        <div className="best-seller-row">
          {bestSellers.map(cat => {
            const count = products.filter(p => p.category === cat.slug && p.listingVisible !== false).length;
            return (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className="best-seller-item"
                data-testid={`link-best-seller-${cat.slug}`}
              >
                <span className={`best-seller-circle ${cat.flat ? 'flat' : ''}`}>
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                </span>
                <h3>{cat.name}</h3>
                <p>{count} {count === 1 ? 'Product' : 'Products'}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="new-arrivals container" aria-labelledby="new-arrivals-title">
        <span className="best-seller-pill">NEW ARRIVALS</span>
        <h2 id="new-arrivals-title">Fresh Styles just Landed</h2>
        <div className="na-grid">
          {newArrivals.map(item => (
            <Link
              key={item.slug}
              href={`/shop?category=${item.category}`}
              className="na-card"
              data-testid={`link-new-arrival-${item.slug}`}
            >
              <img src={item.image} alt={item.title} loading="lazy" style={{ objectPosition: item.position }} />
              <div className="na-body">
                <h3>{item.title}</h3>
                <span className="na-link">
                  Read More
                  <span className="na-arrow"><ArrowRight size={14} /></span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="offers" aria-label="Offers">
        <div className="offer-row">
          {offers.map(o => (
            <article className="offer-card" key={o.title}>
              <Link href={o.href} className="offer-img" tabIndex={-1} aria-hidden="true">
                <img src={o.image} alt="" loading="lazy" style={{ objectPosition: o.position }} />
              </Link>
              <div className="offer-copy">
                <span className="offer-tag">{o.tag}</span>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                <Link href={o.href} className="offer-btn" data-testid={`link-offer-${o.href.split('/').pop()}`}>
                  Get Offer
                  <span><ArrowRight size={20} /></span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="goals container" aria-labelledby="goals-title">
        <span className="best-seller-pill">FASHION BY GOAL</span>
        <h2 id="goals-title">Style choices for every goal</h2>
        <p className="goals-lead">
          Discover JexHome pieces made for every part of your day—office, weekends, travel or a cosy home makeover, find styles that fit every moment.
        </p>
        <div className="goals-row">
          {[
            { Icon: Box, title: 'Free Shipping', text: 'Enjoy fast and reliable free shipping on orders above ₹499.' },
            { Icon: CreditCard, title: 'Secure Payments', text: 'Your payments are fully encrypted for a safe, smooth checkout.' },
            { Icon: Truck, title: 'Easy Returns', text: '7-day easy returns and quick size exchanges with doorstep pickup.' },
            { Icon: Headphones, title: '24/7 Support', text: 'Our friendly support team is here to help you anytime.' }
          ].map(({ Icon, title, text }) => (
            <div className="goal" key={title}>
              <span className="goal-icon"><Icon size={34} strokeWidth={1.5} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-featured container" aria-labelledby="featured-title">
        <span className="best-seller-pill">FEATURED PRODUCTS</span>
        <h2 id="featured-title">Discover featured products</h2>
        <div className="home-featured-grid">
          {featuredProducts.map(p => <ShopCard product={p} key={p.id} />)}
        </div>
      </section>

      <section className="container custom-banner">
        <div className="banner-copy">
          <h2 className="serif">
            Create<br />
            Your Own<br />
            T-Shirt
          </h2>
          <p>Turn your ideas into wearable art with our easy custom designer.</p>
          <Link
            href="/custom-print"
            className="pill"
            style={{ background: '#d7282f', borderColor: '#d7282f', color: '#fff', padding: '10px 17px' }}
            data-testid="link-start-designing"
          >
            Start Designing <ArrowRight size={14} />
          </Link>
        </div>
        <div className="banner-shirt">
          <img src="/images/custom-shirt.webp" alt="Good Vibes custom T-shirt" loading="lazy" />
          <span className="handwritten" style={{ left: '4%', top: '20%', color: '#d88a54' }}>
            Make it yours
          </span>
        </div>
        <div className="tool-list">
          {designTools.map(([Icon, label]) => (
            <div
              key={label}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/custom-print')}
              title={`Use ${label} tool in custom designer`}
            >
              <Icon />
              {label}
            </div>
          ))}
        </div>
      </section>

      <FaqSection />

      <section className="blogs container" aria-labelledby="blogs-title">
        <span className="best-seller-pill">LATEST BLOGS</span>
        <h2 id="blogs-title">Latest Trends in Fashion and Lifestyle</h2>
        <div className="blog-grid">
          {blogPosts.map(post => <BlogCard post={post} key={post.slug} />)}
        </div>
      </section>
    </>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-img" tabIndex={-1} aria-hidden="true">
        <img src={post.image} alt="" loading="lazy" style={{ objectPosition: post.position }} />
      </Link>
      <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
      <div className="blog-meta">
        <Link href={`/blog/${post.slug}`} className="blog-read" data-testid={`link-blog-${post.slug}`}>
          Read More <span><ArrowRight size={15} /></span>
        </Link>
        <span className="blog-date"><CalendarDays size={20} strokeWidth={1.6} /> {post.date}</span>
      </div>
    </article>
  );
}

function BlogPostPage() {
  const { slug = '' } = useParams();
  const blogPosts = useCatalog(s => s.blogPosts);
  const post = blogPosts.find(p => p.slug === slug) ?? blogPosts[0];
  useEffect(() => window.scrollTo(0, 0), [slug]);
  if (!post) return <NotFound />;

  return (
    <>
      <ShopBanner
        banner={{ title: 'JEXHOME JOURNAL', image: post.image, position: post.position }}
        crumbs={[['Home', '/'], ['Blog'], [post.title]]}
      />
      <main className="container blog-post">
        <span className="blog-date"><CalendarDays size={18} strokeWidth={1.6} /> {post.date}</span>
        <h2>{post.title}</h2>
        <img src={post.image} alt={post.title} style={{ objectPosition: post.position }} />
        {post.body.map(para => <p key={para.slice(0, 24)}>{para}</p>)}
        <Link href={post.shopHref} className="offer-btn blog-shop">
          {post.shopLabel}
          <span><ArrowRight size={20} /></span>
        </Link>

        <h3 className="blog-more-title">More from the journal</h3>
        <div className="blog-grid blog-grid-small">
          {blogPosts.filter(p => p.slug !== post.slug).map(p => <BlogCard post={p} key={p.slug} />)}
        </div>
      </main>
    </>
  );
}

const faqs = [
  {
    q: 'What types of products do you offer?',
    a: 'We offer premium T-shirts, oversized tees, polos, hoodies, kidswear, and home decor like cushion covers and pillows — plus custom printing on apparel made just for you.'
  },
  {
    q: 'Can I design and print my own T-shirt?',
    a: 'Yes! Use our Custom Print designer to upload your artwork, add text, shapes and colours, and preview your design in 3D before placing the order.'
  },
  {
    q: 'How do I choose the right size?',
    a: 'Every product page has a Size Guide with chest, length and shoulder measurements in inches. Our oversized styles have a relaxed fit, so pick your regular size for the intended look.'
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24–48 hours across India. Standard delivery arrives in 3–5 business days, and express delivery within 2 business days in major metros. Shipping is free on orders above ₹499.'
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'If the size doesn’t fit or you’re not 100% happy, raise a return or size exchange request within 7 days of delivery. We’ll arrange a free doorstep pickup.'
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept UPI (GPay, PhonePe, Paytm), Credit / Debit Cards (VISA, Mastercard) and Cash on Delivery with no extra COD charge. All payments are fully encrypted.'
  }
];

function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="faq container" aria-labelledby="faq-title">
      <div className="faq-intro">
        <span className="best-seller-pill">FAQ'S</span>
        <h2 id="faq-title">Everything you need to know today</h2>
        <p>We’ve gathered the most important information in one place so you can shop and customise with confidence and ease.</p>
        <div className="faq-perks">
          <span><Truck size={24} strokeWidth={1.5} /> Fast &amp; Secure Delivery</span>
          <span><ShieldCheck size={24} strokeWidth={1.5} /> 100% Secure Payment</span>
        </div>
      </div>

      <div className="faq-list">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div className={`faq-item ${isOpen ? 'open' : ''}`} key={f.q}>
              <button
                className="faq-q"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                data-testid={`button-faq-${i + 1}`}
              >
                {i + 1}. {f.q}
                <span className="faq-icon">{isOpen ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}</span>
              </button>
              {isOpen && <p className="faq-a">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Footer({ onOpenInfo }: { onOpenInfo: (topic: string) => void }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-perks">
          {[
            [PackageCheck, 'Premium Quality', '240 GSM combed cotton fabric'],
            [Truck, 'Fast Delivery', 'Free shipping above ₹499'],
            [ShieldCheck, 'Secure Payments', 'UPI, cards & cash on delivery'],
            [RotateCcw, 'Easy Returns', '7-day returns & size exchange'],
          ].map(([Icon, title, text]) => (
            <div className="footer-perk" key={title as string}>
              <Icon size={34} strokeWidth={1.4} />
              <div>
                <h4>{title as string}</h4>
                <p>{text as string}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-inner">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <img src="/logo.png" alt="JexHome" />
            </Link>
            <p>JexHome is a custom apparel &amp; home decor brand — wear your story and make your space yours.</p>
            <div className="footer-social">
              <button onClick={() => notify('Follow JexHome on Instagram @jexhome_official')} aria-label="Instagram">
                <Instagram size={16} />
              </button>
              <button onClick={() => notify('Visit our Facebook community @jexhome')} aria-label="Facebook">
                <Facebook size={16} />
              </button>
              <button onClick={() => notify('Watch design tutorials on our YouTube channel')} aria-label="YouTube">
                <Youtube size={16} />
              </button>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <div className="foot-links">
              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>
              <Link href="/custom-print">Custom Print</Link>
              <button onClick={() => onOpenInfo('Our Story')}>About Us</button>
              <button onClick={() => onOpenInfo('Contact Us')}>Contact Us</button>
            </div>
          </div>

          <div>
            <h4>Product Categories</h4>
            <div className="foot-links">
              <Link href="/shop/men">Men</Link>
              <Link href="/shop/women">Women</Link>
              <Link href="/shop/kids">Kids</Link>
              <Link href="/shop/hoodies">Hoodies</Link>
              <Link href="/shop/cushions-pillow">Cushions &amp; Pillow</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} JexHome — Custom Apparel &amp; Home Decor. All rights reserved.</span>
          <div>
            {['Shipping & Returns', 'FAQs', 'Privacy Policy', 'Terms & Conditions'].map(t => (
              <button key={t} onClick={() => onOpenInfo(t)}>{t}</button>
            ))}
            <Link href="/admin" data-testid="link-admin">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const shopCategories = [
  { slug: 'men', name: "Men's Polos" },
  { slug: 'women', name: "Women's Tees" },
  { slug: 'kids', name: 'Kids Wear' },
  { slug: 'hoodies', name: 'Hoodies' },
  { slug: 'cushions-pillow', name: 'Cushions & Pillow' },
];
const shopBanners: Record<string, { title: string; image: string; position: string }> = {
  all: { title: 'PREMIUM COLLECTION', image: '/images/polo-black-side.jpg', position: 'center 22%' },
  men: { title: "MEN'S ZIP POLOS", image: '/images/polo-pack3.jpg', position: 'center 28%' },
  women: { title: "WOMEN'S TEES", image: '/images/cat-women.jpg', position: 'center 30%' },
  kids: { title: 'KIDS WEAR', image: '/images/cat-kids.jpg', position: 'center 35%' },
  hoodies: { title: 'HOODIES', image: '/images/prod-oversized-hoodie.jpg', position: 'center 40%' },
  'cushions-pillow': { title: 'CUSHIONS & PILLOW', image: '/images/cushion-blush-stripe-set.jpg', position: 'center 55%' },
  'custom-print': { title: 'CUSTOM PRINT', image: '/images/custom-shirt.webp', position: 'center 40%' },
};

function ShopBanner({ banner, crumbs }: { banner: { title: string; image: string; position: string }; crumbs: [string, string?][] }) {
  return (
    <section className="shop-hero">
      <img src={banner.image} alt="" aria-hidden="true" style={{ objectPosition: banner.position }} />
      <div className="container shop-hero-inner">
        <h1>{banner.title}</h1>
        <nav className="shop-crumb">
          {crumbs.map(([label, href], i) => (
            <span key={label}>
              {i > 0 && <span className="sep">/</span>}
              {href ? <Link href={href}>{label}</Link> : label}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}

const SHOP_MAX_PRICE = 2000;
const SHOP_PAGE = 9;

function ShopStars({ rating }: { rating: number }) {
  return (
    <span className="shop-stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={15} fill={n <= Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

function ShopCard({ product }: { product: Product }) {
  const state = useStore();
  const [, navigate] = useLocation();
  const wished = state.wishlist.includes(product.id);
  const mrp = product.mrp ?? product.price + 200;

  return (
    <article className="shop-card" data-testid={`card-shop-${product.id}`}>
      <div className={`shop-card-visual ${product.gallery ? 'photo' : ''}`}>
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        {product.mrp && <span className="shop-sale">Sale!</span>}
        <div className="shop-actions">
          <button
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={wished ? 'on' : ''}
            onClick={() => {
              store.toggleWish(product.id);
              notify(wished ? 'Removed from wishlist' : 'Added to wishlist');
            }}
          >
            <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button aria-label="Quick view" onClick={() => navigate(`/product/${product.slug}`)}>
            <Eye size={17} />
          </button>
          <button aria-label="Add to cart" onClick={() => addProduct(product, product.colors[0])}>
            <ShoppingCart size={17} />
          </button>
          <button aria-label="Compare" onClick={() => notify(`${product.name} added to compare`)}>
            <Repeat2 size={17} />
          </button>
        </div>
      </div>
      <Link href={`/product/${product.slug}`} className="shop-card-title">{product.name}</Link>
      <div className="shop-card-rating">
        <ShopStars rating={product.rating} /> <span>({product.reviews})</span>
      </div>
      <div className="shop-card-price">
        <del>{currency(mrp)}</del>
        <span>–</span>
        <b>{currency(product.price)}</b>
      </div>
    </article>
  );
}

function CategoryShop() {
  const { category = '' } = useParams();
  return <Shop key={category} category={category} />;
}

function Shop({ category }: { category?: string }) {
  const search = useSearch();
  const [, navigate] = useLocation();
  const isCat = (slug: string | null | undefined): slug is string => !!slug && shopCategories.some(c => c.slug === slug);
  const fixed = isCat(category) ? category : undefined;
  const initialCat = fixed ?? new URLSearchParams(search).get('category');
  const [cats, setCats] = useState<string[]>(isCat(initialCat) ? [initialCat] : []);
  const [maxPrice, setMaxPrice] = useState(SHOP_MAX_PRICE);
  const [ratings, setRatings] = useState<number[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sort, setSort] = useState('default');
  const [perPage, setPerPage] = useState(SHOP_PAGE);
  const [visible, setVisible] = useState(SHOP_PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => window.scrollTo(0, 0), []);

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) => {
    set(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
    setVisible(perPage);
  };

  const all = useCatalog(s => s.products).filter(p => p.listingVisible !== false);
  const pool = fixed ? all.filter(p => p.category === fixed) : all;
  const banner = shopBanners[fixed ?? 'all'];
  const fixedName = shopCategories.find(c => c.slug === fixed)?.name;
  const items = useMemo(() => {
    const result = all.filter(p =>
      (!cats.length || cats.includes(p.category)) &&
      p.price <= maxPrice &&
      (!ratings.length || ratings.some(r => Math.round(p.rating) === r)) &&
      (!sizes.length || sizes.some(sz => p.sizes.includes(sz)))
    );
    if (sort === 'popularity') result.sort((a, b) => b.reviews - a.reviews);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'newest') result.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [cats, maxPrice, ratings, sizes, sort]);

  const shown = items.slice(0, visible);
  const sizeOptions = [...new Set(pool.flatMap(p => p.sizes))];

  const reset = () => {
    setCats(fixed ? [fixed] : []);
    setMaxPrice(SHOP_MAX_PRICE);
    setRatings([]);
    setSizes([]);
    setVisible(perPage);
  };

  return (
    <>
      <ShopBanner
        banner={banner}
        crumbs={fixedName ? [['Home', '/'], ['Shop', '/shop'], [fixedName]] : [['Home', '/'], ['Shop']]}
      />

      <main className="container shop-layout">
        <button className="shop-filter-toggle" onClick={() => setFiltersOpen(true)} data-testid="button-shop-filters">
          <ListFilter size={20} /> Filter By
        </button>
        {filtersOpen && <button className="shop-filter-backdrop" aria-label="Close filters" onClick={() => setFiltersOpen(false)} />}

        <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="shop-filter-head">
            <ListFilter size={20} /> Filter By
            <button className="shop-filter-close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="shop-filter-group">
            <h3>Price Range</h3>
            <input
              type="range"
              min={0}
              max={SHOP_MAX_PRICE}
              step={50}
              value={maxPrice}
              onChange={e => { setMaxPrice(Number(e.target.value)); setVisible(perPage); }}
              className="shop-range"
              data-testid="input-shop-price"
            />
            <div className="shop-range-row">
              <span>₹0 – {currency(maxPrice)}</span>
              <button onClick={reset} data-testid="button-shop-reset">RESET</button>
            </div>
          </div>

          <div className="shop-filter-group">
            <h3>Product Rating</h3>
            {[5, 4, 3, 2, 1].map(r => (
              <label className="shop-check" key={r}>
                <input type="checkbox" checked={ratings.includes(r)} onChange={() => toggle(ratings, r, setRatings)} />
                <span className="shop-stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={18} fill={n <= r ? 'currentColor' : 'none'} className={n <= r ? '' : 'off'} />
                  ))}
                </span>
              </label>
            ))}
          </div>

          <div className="shop-filter-group">
            <h3>Product Categories</h3>
            {shopCategories.map(c => (
              <label className="shop-check" key={c.slug}>
                <input
                  type="checkbox"
                  checked={cats.includes(c.slug)}
                  onChange={() => (fixed ? navigate(c.slug === fixed ? '/shop' : `/shop/${c.slug}`) : toggle(cats, c.slug, setCats))}
                  data-testid={`filter-shop-${c.slug}`}
                />
                {c.name}
                <span className="shop-count">({all.filter(p => p.category === c.slug).length})</span>
              </label>
            ))}
          </div>

          <div className="shop-filter-group">
            <h3>Size</h3>
            {sizeOptions.map(sz => (
              <label className="shop-check" key={sz}>
                <input type="checkbox" checked={sizes.includes(sz)} onChange={() => toggle(sizes, sz, setSizes)} />
                {sz}
              </label>
            ))}
          </div>
        </aside>

        <section className="shop-main">
          <div className="shop-toolbar">
            <p className="shop-results">
              {items.length
                ? `Showing 1–${shown.length} of ${items.length} results`
                : 'No products found'}
            </p>
            <div className="shop-toolbar-right">
              <div className="shop-per-page" aria-label="Products per page">
                {[9, 12, 18, 24].map((n, i) => (
                  <span key={n}>
                    {i > 0 && <i>/</i>}
                    <button
                      className={perPage === n ? 'on' : ''}
                      onClick={() => { setPerPage(n); setVisible(n); }}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)} className="shop-sort" data-testid="select-shop-sort">
                <option value="default">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="rating">Sort by average rating</option>
                <option value="newest">Sort by latest</option>
                <option value="price-asc">Sort by price: low to high</option>
                <option value="price-desc">Sort by price: high to low</option>
              </select>
            </div>
          </div>

          {items.length ? (
            <div className="shop-grid">
              {shown.map(p => <ShopCard product={p} key={p.id} />)}
            </div>
          ) : (
            <div className="shop-empty">
              No products match these filters.
              <button onClick={reset}>Reset Filters</button>
            </div>
          )}

          {visible < items.length && (
            <div className="shop-more">
              <button onClick={() => setVisible(v => v + perPage)} data-testid="button-shop-load-more">Load More</button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function QuantityStepper({
  quantity,
  onChange
}: {
  quantity: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="qty">
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(-1)}
        data-testid="button-quantity-minus"
      >
        <Minus size={12} />
      </button>
      <span data-testid="text-quantity">{quantity}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(1)}
        data-testid="button-quantity-plus"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

// Keyed by slug so switching colour variants resets gallery and selections.
function ProductDetail() {
  const { slug = '' } = useParams();
  const hasProducts = useCatalog(s => s.products.length > 0);
  if (!hasProducts) return <NotFound />;
  return <ProductDetailView key={slug} slug={slug} />;
}

function ProductDetailView({ slug }: { slug: string }) {
  const products = useCatalog(s => s.products);
  const product = products.find(p => p.slug === slug) || products[0];
  const [color, setColor] = useState(slug === 'good-vibes-oversized-t-shirt' ? '#f1eee7' : product.colors[0]);
  const [size, setSize] = useState(slug === 'good-vibes-oversized-t-shirt' ? 'L' : product.sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('Description');
  const [thumb, setThumb] = useState(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSave, setReviewSave] = useState(false);
  const [userReviews, setUserReviews] = useState<{ name: string; rating: number; date: string; text: string }[]>([]);

  const state = useStore();
  const wished = state.wishlist.includes(product.id);

  const variants = product.group ? products.filter(p => p.group === product.group) : [];
  const isCushion = product.category === 'cushions-pillow';
  const isPhoto = Boolean(product.gallery);
  const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 28;

  const gallery = useMemo(() => {
    if (product.gallery) return product.gallery;
    if (product.category === 'hoodies') {
      return [
        product.image,
        '/images/prod-oversized-hoodie.jpg',
        '/images/hero-model.webp',
        '/images/prod-minimal-tee.jpg',
        product.image
      ];
    }
    return [
      product.image,
      '/images/prod-good-vibes-detail.png',
      '/images/hero-model.webp',
      '/images/prod-good-vibes-model-front.png',
      '/images/prod-good-vibes-lifestyle.png'
    ];
  }, [product]);

  const handleRotate = () => {
    setThumb(prev => (prev >= gallery.length ? 1 : prev + 1));
    if (!isPhoto) notify('Rotated 360° view angle');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) {
      notify('Please select a rating');
      return;
    }
    if (!reviewText.trim() || !reviewName.trim() || !reviewEmail.trim()) {
      notify('Please fill in all required fields');
      return;
    }
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setUserReviews(prev => [{ name: reviewName.trim(), rating: reviewRating, date, text: reviewText.trim() }, ...prev]);
    notify('Thank you! Your review has been submitted.');
    setReviewRating(0);
    setReviewText('');
    if (!reviewSave) {
      setReviewName('');
      setReviewEmail('');
    }
  };

  const shownReviews = [
    ...userReviews,
    { name: 'Rohan Sharma', rating: 5, date: 'June 17, 2026', text: 'The print quality blew my mind! Fabric is heavy, feels super premium like Zara or H&M streetwear. Fitting is 10/10.' },
    { name: 'Pooja Verma', rating: 5, date: 'June 12, 2026', text: 'Received within 3 days in Mumbai. Looks even better in person than photos.' },
  ];
  // Split the catalogue rating into a plausible 5→1 star distribution.
  const fivePct = Math.round(Math.min(100, Math.max(0, (product.rating - 4) * 100)));
  const ratingBreakdown = [fivePct, Math.round((100 - fivePct) * 0.75), 0, 0, 0];
  ratingBreakdown[2] = 100 - ratingBreakdown[0] - ratingBreakdown[1];

  return (
    <>
      <Breadcrumb
        items={[
          'Home',
          product.category === 'cushions-pillow' ? 'Cushions & Pillow' : product.category[0].toUpperCase() + product.category.slice(1),
          isCushion ? 'Cushion Covers' : product.type ?? 'T-Shirts',
          product.name
        ]}
      />
      <main className="container">
        <section className={`detail ${isPhoto ? 'photo' : ''}`}>
          <div className="thumbs">
            {gallery.map((image, i) => (
              <button
                className={`thumb ${i + 1 === thumb ? 'active' : ''}`}
                key={image + i}
                onClick={() => setThumb(i + 1)}
                data-testid={`button-product-thumbnail-${i + 1}`}
              >
                <img src={image} alt={`${product.name} view ${i + 1}`} />
                {i === 4 && !isPhoto && <Play size={13} />}
              </button>
            ))}
          </div>

          <div className="detail-image">
            <img src={gallery[thumb - 1] ?? product.image} alt={product.name} />
            <button
              className={`heart ${wished ? 'selected' : ''}`}
              onClick={() => {
                store.toggleWish(product.id);
                notify(wished ? 'Removed from wishlist' : 'Added to wishlist');
              }}
              aria-label="Add to wishlist"
              data-testid="button-product-wishlist"
            >
              <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
            </button>
            <button
              className="rotate-hint"
              onClick={handleRotate}
              style={{
                border: '1px solid #ddd',
                background: '#fff',
                padding: '6px 12px',
                borderRadius: 20,
                cursor: 'pointer'
              }}
            >
              {isPhoto ? `${thumb} / ${gallery.length} · Next view` : <>360° &nbsp; Click to rotate angle</>}
            </button>
          </div>

          <div className="detail-info">
            <h1>{slug === 'good-vibes-oversized-t-shirt' ? 'Good Vibes Oversized T-Shirt' : product.name}</h1>
            <div className="detail-rating">
              <span className="stars">★★★★★</span> &nbsp;{product.rating.toFixed(1)} ({product.reviews} reviews)
            </div>
            <div className="detail-price">
              <strong>{currency(product.price)}</strong>
              <span className="old">{currency(product.mrp ?? product.price + 200)}</span>
              <span className="discount">{discount}% OFF</span>
            </div>
            <p className="detail-desc">
              {product.description ??
                'Premium cotton oversized t-shirt with bold print. Soft, breathable and perfect for everyday wear. Made with high-density combed yarn.'}
            </p>

            <div className="option-label">
              {product.badge?.startsWith('Pack') ? 'Colors in pack' : 'Color'}: <span>{
                product.badge?.startsWith('Pack') ? product.colors.map(getColorName).join(', ') : getColorName(color)
              }</span>
            </div>
            {variants.length > 1 ? (
              <div className="variant-row">
                {variants.map(v => (
                  <Link
                    key={v.id}
                    href={`/product/${v.slug}`}
                    className={`variant ${v.id === product.id ? 'active' : ''}`}
                    title={v.name}
                    data-testid={`link-variant-${v.id}`}
                  >
                    <img src={v.gallery?.[v.gallery.length - 1] ?? v.image} alt={v.name} loading="lazy" />
                  </Link>
                ))}
              </div>
            ) : (
              <ColorDots
                colors={product.gallery ? product.colors : ['#f1eee7', '#111', '#d7282f', '#245f9c', '#198e92', '#e4c330']}
                selected={color}
                onSelect={setColor}
                big
              />
            )}

            <div className="option-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Size:
              <button
                className="text-link"
                onClick={() => setTab('Size Guide')}
                data-testid="button-size-guide"
              >
                Size Guide
              </button>
            </div>
            <div className="size-selector">
              {product.sizes.map(s => (
                <button
                  className={`size-btn ${size === s ? 'on' : ''} ${s.length > 3 ? 'wide' : ''}`}
                  key={s}
                  onClick={() => setSize(s)}
                  data-testid={`button-size-${s.replaceAll(' ', '-')}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="purchase-row">
              <QuantityStepper
                quantity={quantity}
                onChange={d => setQuantity(Math.max(1, quantity + d))}
              />
              <button
                className="add-button"
                onClick={() => addProduct(product, color, size, quantity)}
                data-testid="button-add-to-cart"
              >
                Add to Cart
              </button>
            </div>
            <button
              className="wishlist-action"
              onClick={() => {
                store.toggleWish(product.id);
                notify(wished ? 'Removed from wishlist' : 'Added to wishlist');
              }}
              data-testid="button-add-to-wishlist"
            >
              <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
              {wished ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </section>

        <div className="feature-strip">
          {(isCushion && isPhoto
            ? [
                { Icon: Leaf, title: 'Soft Fabric', detail: 'Gentle on Skin' },
                { Icon: Sparkles, title: 'Hidden Zip', detail: 'Easy to Wash' },
                { Icon: PackageCheck, title: 'Durable Stitching', detail: 'Long Lasting Quality' },
                { Icon: RotateCcw, title: 'Easy Returns', detail: '7 Days Hassle-Free' }
              ]
            : product.type === 'Polo T-Shirts'
            ? [
                { Icon: Leaf, title: 'Premium Pique', detail: 'Soft Cotton Blend' },
                { Icon: Sparkles, title: 'Breathable', detail: 'All Day Comfort' },
                { Icon: PackageCheck, title: 'Gold-tone Zip', detail: 'Smart Metal Finish' },
                { Icon: RotateCcw, title: 'Easy Returns', detail: '7 Days Hassle-Free' }
              ]
            : [
                { Icon: Leaf, title: 'Premium Fabric', detail: '100% Combed Cotton' },
                { Icon: Sparkles, title: 'Breathable', detail: 'All Day Comfort' },
                { Icon: PackageCheck, title: 'DTG Printing', detail: 'Vibrant & Long Lasting' },
                { Icon: RotateCcw, title: 'Easy Returns', detail: '7 Days Hassle-Free' }
              ]
          ).map(({ Icon, title, detail }) => (
            <div className="feature" key={title}>
              <Icon />
              <span>
                <b>{title}</b>
                <br />
                {detail}
              </span>
            </div>
          ))}
        </div>

        <div className="tabs-detail">
          {['Description', 'Size Guide', `Reviews (${product.reviews})`, 'Shipping & Returns'].map(t => (
            <button
              className={tab.startsWith(t.split(' ')[0]) ? 'active' : ''}
              onClick={() => setTab(t)}
              key={t}
              data-testid={`button-product-tab-${t.toLowerCase().replaceAll(/[^a-z0-9]/g, '-')}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={`tab-content ${tab.startsWith('Description') ? 'tab-description' : ''}`} data-testid="content-product-tab">
          {tab.startsWith('Description') ? (
            <>
              {product.highlights ? (
                <div>
                  {product.description}
                  <ul style={{ marginTop: 12 }}>
                    {product.highlights.map(h => <li key={h}>{h}</li>)}
                  </ul>
                </div>
              ) : (
                <div>
                  Make a statement with our {product.name}. Crafted from premium high-grade cotton, this piece offers all-day comfort with bold and vibrant graphic print. Perfect for casual outings, streetwear looks or everyday wear.
                  <ul style={{ marginTop: 12 }}>
                    <li>100% Premium Combed Cotton (240 GSM)</li>
                    <li>Relaxed Streetwear Oversized Fit</li>
                    <li>Direct-to-Garment (DTG) Non-fade Printing</li>
                    <li>Pre-shrunk Fabric with Soft Bio-wash</li>
                    <li>Unisex Design for versatile everyday styling</li>
                  </ul>
                </div>
              )}
              <img
                src={product.gallery ? product.gallery[1] ?? product.gallery[0] : '/images/prod-good-vibes-lifestyle.png'}
                alt={product.gallery ? `${product.name} lifestyle view` : 'Lifestyle preview of model wearing graphic shirt'}
              />
            </>
          ) : tab === 'Size Guide' ? (
            <div>
              <p style={{ margin: '0 0 14px' }}>All measurements are in inches. True to standard Indian streetwear sizing:</p>
              <table className="size-table">
                <tbody>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Length (in)</th>
                    <th>Shoulder (in)</th>
                  </tr>
                  {[
                    ['S', '38', '27', '18'],
                    ['M', '40', '28', '19'],
                    ['L', '42', '29', '20'],
                    ['XL', '44', '30', '21'],
                    ['XXL', '46', '31', '22'],
                  ].map(([s, c, l, sh]) => (
                    <tr key={s}>
                      <td><strong>{s}</strong></td>
                      <td>{c} in</td>
                      <td>{l} in</td>
                      <td>{sh} in</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab.includes('Reviews') ? (
            <div className="reviews-wrap">
              <div className="reviews-left">
                <h3 className="reviews-heading">Average Rating</h3>
                <div className="reviews-avg">
                  <strong>{product.rating.toFixed(2)}</strong>
                  <span className="reviews-stars">★★★★★</span>
                  <span>{product.reviews} Reviews</span>
                </div>
                <div className="reviews-bars">
                  {ratingBreakdown.map((pct, i) => (
                    <div className="reviews-bar-row" key={i}>
                      <span>{5 - i} star</span>
                      <div className="reviews-bar"><i style={{ width: `${pct}%` }} /></div>
                      <span>{pct}%</span>
                    </div>
                  ))}
                </div>

                <h3 className="reviews-heading reviews-list-title">
                  {shownReviews.length} reviews for {product.name}
                </h3>
                <div className="reviews-list">
                  {shownReviews.map((r, i) => (
                    <div className="review-item" key={`${r.name}-${i}`}>
                      <div className="review-avatar">{r.name[0].toUpperCase()}</div>
                      <div>
                        <div className="reviews-stars">
                          {'★'.repeat(r.rating)}<span className="off">{'★'.repeat(5 - r.rating)}</span>
                        </div>
                        <div className="review-meta"><strong>{r.name}</strong> – {r.date}</div>
                        <p>“{r.text}”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3 className="reviews-heading">Add a review</h3>
                <p className="review-note">Your email address will not be published. Required fields are marked <em>*</em></p>
                <label>Your rating <em>*</em></label>
                <div className="review-star-input" onMouseLeave={() => setReviewHover(0)}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      className={(reviewHover || reviewRating) >= n ? 'on' : ''}
                      onMouseEnter={() => setReviewHover(n)}
                      onClick={() => setReviewRating(n)}
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                      {(reviewHover || reviewRating) >= n ? '★' : '☆'}
                    </button>
                  ))}
                </div>
                <label htmlFor="review-text">Your review <em>*</em></label>
                <textarea id="review-text" rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} />
                <label htmlFor="review-name">Name <em>*</em></label>
                <input id="review-name" value={reviewName} onChange={e => setReviewName(e.target.value)} />
                <label htmlFor="review-email">Email <em>*</em></label>
                <input id="review-email" type="email" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} />
                <label className="review-save">
                  <input type="checkbox" checked={reviewSave} onChange={e => setReviewSave(e.target.checked)} />
                  Save my name, email, and website in this browser for the next time I comment.
                </label>
                <button type="submit" className="review-submit">Submit</button>
              </form>
            </div>
          ) : (
            <div>
              <p>
                <strong>Shipping Information:</strong><br />
                We dispatch all orders within 24–48 hours across all serviceable pin codes in India. Standard delivery arrives in 3–5 business days. Express delivery arrives within 2 business days in major metros.
              </p>
              <p style={{ marginTop: 12 }}>
                <strong>7 Days Easy Returns &amp; Exchange:</strong><br />
                If the size doesn’t fit or you’re not 100% happy with the item, raise a return or size exchange request within 7 days of delivery. Free doorstep pickup will be arranged.
              </p>
            </div>
          )}
        </div>

        <section className="related-products">
          <div className="related-heading">
            <div>
              <span className="eyebrow">CURATED FOR YOU</span>
              <h2 className="serif">You may also like</h2>
            </div>
            <Link href={`/shop/${product.category}`} className="view-all">
              View collection <ArrowRight size={13} />
            </Link>
          </div>
          <div className="product-grid listing-grid">
            {products
              .filter(p => p.category === product.category && p.id !== product.id && p.listingVisible !== false)
              .slice(0, 4)
              .map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      </main>
    </>
  );
}

function Summary({
  items,
  checkout = false,
  discountAmount = 100,
  shippingAmount = 50
}: {
  items: CartItem[];
  checkout?: boolean;
  discountAmount?: number;
  shippingAmount?: number;
}) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = items.length ? discountAmount : 0;
  const shipping = items.length ? shippingAmount : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <aside className="summary" data-testid="card-order-summary">
      <h2>Order Summary</h2>
      {checkout &&
        items.map(i => (
          <div className="summary-item" key={i.key}>
            <img src={i.product.image} alt={i.product.name} />
            <span>
              {i.product.name}
              <br />
              <small style={{ color: '#888' }}>
                {i.color} / {i.size} × {i.quantity}
              </small>
            </span>
            <b>{currency(i.product.price * i.quantity)}</b>
          </div>
        ))}
      <div className="summary-line">
        <span>Subtotal</span>
        <strong>{currency(subtotal)}</strong>
      </div>
      <div className="summary-line">
        <span>Discount</span>
        <strong className={checkout ? 'red' : 'green'}>− {currency(discount)}</strong>
      </div>
      <div className="summary-line">
        <span>Shipping</span>
        <strong>{currency(shipping)}</strong>
      </div>
      <div className="summary-line summary-total">
        <span>Total</span>
        <strong>{currency(total)}</strong>
      </div>
      {!checkout && (
        <Link
          href="/checkout"
          className="red-button"
          style={{ display: 'block', textAlign: 'center', opacity: items.length === 0 ? 0.6 : 1 }}
          data-testid="link-proceed-checkout"
          onClick={e => {
            if (items.length === 0) {
              e.preventDefault();
              notify('Select at least one item to proceed.');
            }
          }}
        >
          Proceed to Checkout →
        </Link>
      )}
    </aside>
  );
}

function Cart() {
  const state = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [discount, setDiscount] = useState(100);
  const [selected, setSelected] = useState<string[]>(state.cart.map(i => i.key));

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg('Please enter a coupon code.');
      return;
    }
    if (code === 'JEX100') {
      setDiscount(100);
      setCouponMsg('Coupon JEX100 applied: ₹100 discount added!');
      notify('Coupon applied: ₹100 off');
    } else if (code === 'SAVE10' || code === 'FIRST50') {
      setDiscount(150);
      setCouponMsg(`Coupon ${code} applied: ₹150 discount added!`);
      notify(`Coupon ${code} applied`);
    } else if (code === 'FREESHIP') {
      setDiscount(50);
      setCouponMsg('Coupon FREESHIP applied: Free shipping activated!');
      notify('Free shipping coupon applied');
    } else {
      setCouponMsg('Coupon code not found. Try JEX100 or SAVE10.');
    }
  };

  const handleToggleAll = () => {
    if (selected.length === state.cart.length) {
      setSelected([]);
    } else {
      setSelected(state.cart.map(i => i.key));
    }
  };

  return (
    <>
      <Breadcrumb items={['Cart']} />
      <main className="container cart-layout">
        <section>
          <div className="cart-heading">
            <h1>
              Your Cart <span>({state.cart.reduce((n, i) => n + i.quantity, 0)} items)</span>
            </h1>
            <div style={{ display: 'flex', gap: 14 }}>
              {state.cart.length > 0 && (
                <button className="text-link" onClick={handleToggleAll}>
                  {selected.length === state.cart.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
              <button
                className="text-link"
                onClick={() => {
                  store.clear();
                  notify('Cart cleared');
                }}
                data-testid="button-clear-cart"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {state.cart.length ? (
            state.cart.map(item => (
              <CartRow
                item={item}
                key={item.key}
                checked={selected.includes(item.key)}
                onToggle={() =>
                  setSelected(selected.includes(item.key) ? selected.filter(k => k !== item.key) : [...selected, item.key])
                }
              />
            ))
          ) : (
            <div className="empty">
              Your cart is waiting for a little something.
              <br />
              <Link href="/shop/men" className="view-all" style={{ display: 'inline-block', marginTop: 14 }}>
                Continue Shopping →
              </Link>
            </div>
          )}

          <form className="coupon" onSubmit={applyCoupon}>
            <input
              placeholder="Apply Coupon Code (try JEX100)"
              aria-label="Apply Coupon Code"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              data-testid="input-coupon"
            />
            <button type="submit" data-testid="button-apply-coupon">
              Apply
            </button>
          </form>
          {couponMsg && (
            <div className="notice" style={{ color: couponMsg.includes('applied') ? '#28a745' : '#d7282f' }} data-testid="status-coupon">
              {couponMsg}
            </div>
          )}
          <Features trust />
        </section>

        <Summary
          items={state.cart.filter(i => selected.includes(i.key))}
          discountAmount={discount}
        />
      </main>
    </>
  );
}

function CartRow({
  item,
  checked,
  onToggle
}: {
  item: CartItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="cart-item" data-testid={`row-cart-${item.product.id}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={`Select ${item.product.name}`}
        data-testid={`checkbox-cart-${item.product.id}`}
      />
      <div className="cart-thumb">
        <img src={item.product.image} alt={item.product.name} />
      </div>
      <div className="cart-info">
        <h3>{item.product.name}</h3>
        <p>
          {item.color} / {item.size}
        </p>
        <QuantityStepper quantity={item.quantity} onChange={d => store.quantity(item.key, d)} />
      </div>
      <div className="cart-price">
        {item.product.slug === 'good-vibes-oversized-t-shirt' && (
          <>
            <del>₹699</del>
            <span className="discount">28% OFF</span>
            <br />
          </>
        )}
        {currency(item.product.price * item.quantity)}
      </div>
      <button
        className="trash"
        aria-label="Remove item"
        onClick={() => {
          store.remove(item.key);
          notify(`Removed ${item.product.name} from cart`);
        }}
        data-testid={`button-remove-${item.product.id}`}
      >
        <Trash2 size={14} />
      </button>
    </article>
  );
}

function Checkout({ onOrderPlaced }: { onOrderPlaced: (order: { id: string; total: number; count: number }) => void }) {
  const state = useStore();
  const [payment, setPayment] = useState('UPI');
  const [upiId, setUpiId] = useState('akash@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [step, setStep] = useState<'info' | 'payment'>('info');

  const checkoutForm = useForm<CheckoutFields>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: 'Akash Kumar',
      phone: '9599342525',
      email: 'akash@example.com',
      address: '123, Sector 15',
      apartment: 'Near Metro Station',
      state: 'New Delhi',
      city: 'Delhi',
      pincode: '110015'
    }
  });

  const subtotal = state.cart.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const total = Math.max(0, subtotal - 100 + 50);

  const handleContinueToPayment = checkoutForm.handleSubmit(() => {
    setStep('payment');
    notify('Address saved. Choose payment method to place order.');
  });

  const handleFinalOrder = () => {
    if (state.cart.length === 0) {
      notify('Your cart is empty.');
      return;
    }
    const orderId = `#JH-${Math.floor(100000 + Math.random() * 900000)}`;
    const totalCount = state.cart.reduce((n, i) => n + i.quantity, 0);
    useCatalog.getState().addOrder({
      id: orderId,
      date: new Date().toISOString(),
      status: 'Pending',
      payment,
      customer: checkoutForm.getValues(),
      items: state.cart.map(i => ({
        name: i.product.name, slug: i.product.slug, image: i.product.image,
        price: i.product.price, quantity: i.quantity, color: i.color, size: i.size,
      })),
      subtotal,
      total,
    });
    onOrderPlaced({ id: orderId, total, count: totalCount });
    store.clear();
  };

  return (
    <>
      <main className="container checkout">
        <section>
          <div className="steps">
            <Link href="/cart" style={{ color: '#888' }}>Cart</Link>
            <ChevronRight size={11} />
            <strong style={{ color: step === 'info' ? '#d7282f' : '#111' }}>1. Information</strong>
            <ChevronRight size={11} />
            <strong style={{ color: step === 'payment' ? '#d7282f' : '#888' }}>2. Payment</strong>
          </div>

          <h1>{step === 'info' ? '1. Shipping Address' : '2. Complete Payment'}</h1>

          <Form {...checkoutForm}>
            <form onSubmit={handleContinueToPayment} noValidate data-testid="form-checkout">
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="checkout-name">Full Name</label>
                  <input
                    id="checkout-name"
                    placeholder="Akash Kumar"
                    {...checkoutForm.register('fullName')}
                    data-testid="input-full-name"
                  />
                  {checkoutForm.formState.errors.fullName && (
                    <small className="field-error">{checkoutForm.formState.errors.fullName.message}</small>
                  )}
                </div>

                <div className="field half">
                  <label htmlFor="checkout-phone">Phone Number</label>
                  <input
                    id="checkout-phone"
                    placeholder="+91 95993 42525"
                    type="tel"
                    {...checkoutForm.register('phone')}
                    data-testid="input-phone-number"
                  />
                  {checkoutForm.formState.errors.phone && (
                    <small className="field-error">{checkoutForm.formState.errors.phone.message}</small>
                  )}
                </div>

                <div className="field half">
                  <label htmlFor="checkout-email">Email Address</label>
                  <input
                    id="checkout-email"
                    placeholder="akash@example.com"
                    type="email"
                    {...checkoutForm.register('email')}
                    data-testid="input-email-address"
                  />
                  {checkoutForm.formState.errors.email && (
                    <small className="field-error">{checkoutForm.formState.errors.email.message}</small>
                  )}
                </div>

                <div className="field full">
                  <label htmlFor="checkout-address">Address</label>
                  <input
                    id="checkout-address"
                    placeholder="123, Sector 15"
                    {...checkoutForm.register('address')}
                    data-testid="input-address"
                  />
                  {checkoutForm.formState.errors.address && (
                    <small className="field-error">{checkoutForm.formState.errors.address.message}</small>
                  )}
                </div>

                <div className="field full">
                  <label htmlFor="checkout-apartment">Apartment, suite, etc. (optional)</label>
                  <input
                    id="checkout-apartment"
                    placeholder="Near Metro Station"
                    {...checkoutForm.register('apartment')}
                    data-testid="input-apartment"
                  />
                </div>

                <div className="field">
                  <label htmlFor="checkout-state">State</label>
                  <select id="checkout-state" {...checkoutForm.register('state')} data-testid="select-state">
                    <option>New Delhi</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                    <option>Uttar Pradesh</option>
                    <option>Haryana</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="checkout-city">City</label>
                  <select id="checkout-city" {...checkoutForm.register('city')} data-testid="select-city">
                    <option>Delhi</option>
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Noida</option>
                    <option>Gurugram</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="checkout-pincode">Pincode</label>
                  <input
                    id="checkout-pincode"
                    placeholder="110015"
                    inputMode="numeric"
                    {...checkoutForm.register('pincode')}
                    data-testid="input-pincode"
                  />
                  {checkoutForm.formState.errors.pincode && (
                    <small className="field-error">{checkoutForm.formState.errors.pincode.message}</small>
                  )}
                </div>
              </div>

              <label className="address-check">
                <input type="checkbox" defaultChecked data-testid="checkbox-save-address" />
                Save this address for next time
              </label>

              {step === 'info' ? (
                <button className="red-button" style={{ width: '100%' }} type="submit" data-testid="button-continue-payment">
                  Continue to Payment →
                </button>
              ) : (
                <div style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    className="red-button"
                    style={{ width: '100%', fontSize: 13 }}
                    onClick={handleFinalOrder}
                    data-testid="button-place-order"
                  >
                    Place Order ({currency(total)}) →
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    style={{
                      border: 0,
                      background: 'none',
                      color: '#666',
                      fontSize: 11,
                      width: '100%',
                      marginTop: 10,
                      cursor: 'pointer'
                    }}
                  >
                    ← Edit Shipping Details
                  </button>
                </div>
              )}
            </form>
          </Form>
        </section>

        <section>
          <div className="summary">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Order Summary</h2>
              <Link href="/cart" className="text-link" data-testid="link-edit-cart">
                Edit
              </Link>
            </div>

            {state.cart.map(i => (
              <div className="summary-item" key={i.key}>
                <img src={i.product.image} alt={i.product.name} />
                <span>
                  {i.product.name}
                  <br />
                  <small style={{ color: '#888' }}>
                    {i.color} / {i.size} × {i.quantity}
                  </small>
                </span>
                <b>{currency(i.product.price * i.quantity)}</b>
              </div>
            ))}

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{currency(subtotal)}</strong>
            </div>
            <div className="summary-line">
              <span>Discount</span>
              <strong className="red">− ₹100</strong>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <strong>₹50</strong>
            </div>
            <div className="summary-line summary-total">
              <span>Total</span>
              <strong>{currency(total)}</strong>
            </div>

            <div className="payment-options">
              <h3>Payment Method</h3>
              {[
                ['UPI', 'GPay, PhonePe, Paytm etc.'],
                ['Credit / Debit Card', 'VISA · Mastercard'],
                ['Cash on Delivery (COD)', 'Cash on delivery']
              ].map(([name, desc]) => (
                <div key={name}>
                  <div className="payment-choice">
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === name}
                        onChange={() => setPayment(name)}
                        data-testid={`radio-payment-${name.toLowerCase().replaceAll(/[^a-z]+/g, '-').replace(/(^-|-$)/g, '')}`}
                      />
                      {name} <span style={{ color: '#777' }}>{desc}</span>
                    </label>
                    {name === 'Credit / Debit Card' && (
                      <b style={{ fontSize: 9, color: '#244a91' }}>VISA &nbsp;MC</b>
                    )}
                  </div>

                  {payment === name && name === 'UPI' && (
                    <div className="payment-details-box">
                      <label style={{ fontSize: 9, color: '#666', display: 'block' }}>Enter UPI ID / VPA</label>
                      <input
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="username@bank"
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {['GPay', 'PhonePe', 'Paytm'].map(app => (
                          <button
                            key={app}
                            type="button"
                            className="search-tag"
                            onClick={() => {
                              setUpiId(`akash@${app.toLowerCase()}`);
                              notify(`Selected ${app} UPI`);
                            }}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {payment === name && name === 'Credit / Debit Card' && (
                    <div className="payment-details-box">
                      <label style={{ fontSize: 9, color: '#666' }}>Card Number</label>
                      <input
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="16-digit card number"
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                        <div>
                          <label style={{ fontSize: 9, color: '#666' }}>Expiry</label>
                          <input
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 9, color: '#666' }}>CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            placeholder="CVV"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {payment === name && name === 'Cash on Delivery (COD)' && (
                    <div className="payment-details-box" style={{ fontSize: 10, color: '#555' }}>
                      Pay with cash or QR scanner at the time of delivery. No extra COD charge.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CustomPrint() {
  const [tool, setTool] = useState('Upload');
  const [text, setText] = useState('GOOD VIBES');
  const [graphic, setGraphic] = useState('SUNSHINE');
  const [printColor, setPrintColor] = useState('#d7282f');
  const [color, setColor] = useState('#f1eee7');
  const [size, setSize] = useState('M');
  const [productType, setProductType] = useState('T-Shirt');
  const [file, setFile] = useState('');
  const [is3D, setIs3D] = useState(false);

  const custom = baseProducts[0];
  const customPrice = productType === 'Hoodie' ? 999 : productType === 'Cushion Cover' ? 449 : 499;
  const customImage =
    productType === 'Hoodie'
      ? '/images/prod-oversized-hoodie.jpg'
      : productType === 'Cushion Cover'
      ? '/images/prod-cushion-botanical.webp'
      : '/images/custom-shirt.webp';

  const handleAddCustom = () => {
    const name = `Custom Print ${productType}`;
    addProduct(
      {
        ...custom,
        id: `custom-${productType.toLowerCase().replaceAll(' ', '-')}`,
        slug: `custom-print-${productType.toLowerCase().replaceAll(' ', '-')}`,
        name,
        price: customPrice,
        type: productType
      },
      color,
      size
    );
  };

  return (
    <>
      <ShopBanner banner={shopBanners['custom-print']} crumbs={[['Home', '/'], ['Custom Print']]} />
      <main className="container">
        <div className="section-heading">
          <h2 className="serif">Create Your Own T-Shirt</h2>
          <p style={{ fontSize: 11, color: '#777' }}>Make it yours, from the first detail.</p>
        </div>
        <section className="customizer">
          <aside className="panel tool-panel">
            <h2>Design Tools</h2>
            {designTools.map(([Icon, label]) => (
              <button
                className={`tool-button ${tool === label ? 'active' : ''}`}
                key={label}
                onClick={() => {
                  setTool(label);
                  if (label === 'Preview (3D)') setIs3D(!is3D);
                }}
                data-testid={`button-tool-${label.toLowerCase().replaceAll(/[^a-z]+/g, '-').replace(/(^-|-$)/g, '')}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </aside>

          <div
            className="canvas"
            style={{
              transform: is3D ? 'perspective(600px) rotateY(-18deg) rotateX(6deg)' : 'none',
              transition: 'transform 0.4s ease'
            }}
          >
            <img src={customImage} alt={`${productType} custom design preview`} />
            {file && <img className="upload-overlay" src={file} alt="Uploaded artwork preview" />}
            {tool === 'Text' && (
              <div className="design-overlay" style={{ color: printColor }}>
                {text}
              </div>
            )}
            {tool === 'Graphics' && (
              <div className="design-overlay" style={{ color: printColor }}>
                {graphic}
              </div>
            )}
            {tool === 'Upload' && (
              <label className="canvas-tools" style={{ cursor: 'pointer' }}>
                Choose artwork{' '}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const picked = e.target.files?.[0];
                    if (picked) {
                      setFile(URL.createObjectURL(picked));
                      notify('Artwork uploaded successfully to preview');
                    }
                  }}
                  data-testid="input-upload-design"
                />
              </label>
            )}
            {tool === 'Graphics' && (
              <div className="canvas-tools graphics-tools">
                {['SUNSHINE', 'GOOD VIBES', 'WILDFLOWER', 'SMILE'].map(option => (
                  <button
                    onClick={() => {
                      setGraphic(option);
                      notify(`Selected ${option} graphic`);
                    }}
                    key={option}
                    data-testid={`button-graphic-${option.toLowerCase().replaceAll(' ', '-')}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            {tool === 'Preview (3D)' && (
              <button
                className="canvas-tools"
                style={{ border: 0, cursor: 'pointer' }}
                onClick={() => setIs3D(!is3D)}
              >
                {is3D ? 'Reset View Angle' : '3D Perspective · Click to toggle'}
              </button>
            )}
          </div>

          <aside className="panel options-panel">
            <h2>Product Options</h2>
            <div className="field">
              <label>Product Type</label>
              <select
                value={productType}
                onChange={e => {
                  setProductType(e.target.value);
                  notify(`Selected ${e.target.value}`);
                }}
                data-testid="select-custom-product"
              >
                <option>T-Shirt</option>
                <option>Hoodie</option>
                <option>Cushion Cover</option>
              </select>
            </div>

            <div className="option-label">Color: {getColorName(color)}</div>
            <ColorDots
              colors={['#f1eee7', '#111', '#d7282f', '#245f9c', '#198e92', '#e4c330']}
              selected={color}
              onSelect={setColor}
              big
            />

            {productType !== 'Cushion Cover' && (
              <>
                <div className="option-label">Size:</div>
                <div className="size-selector">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button
                      className={`size-btn ${size === s ? 'on' : ''}`}
                      onClick={() => setSize(s)}
                      key={s}
                      data-testid={`button-custom-size-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {tool === 'Text' && (
              <div className="field" style={{ marginTop: 15 }}>
                <label>Your Text</label>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  data-testid="input-custom-text"
                />
              </div>
            )}

            {tool === 'Colors' && (
              <div className="option-label">
                Print color:{' '}
                <input
                  type="color"
                  value={printColor}
                  onChange={e => setPrintColor(e.target.value)}
                  aria-label="Print color"
                  data-testid="input-print-color"
                />
              </div>
            )}

            <div className="detail-price" style={{ marginTop: 22 }}>
              <strong>{currency(customPrice)}</strong>
            </div>

            <button
              className="red-button"
              style={{ width: '100%' }}
              onClick={handleAddCustom}
              data-testid="button-custom-add"
            >
              Add to Cart
            </button>
          </aside>
        </section>
      </main>
    </>
  );
}

function Wishlist() {
  const state = useStore();
  const products = useCatalog(s => s.products);
  const saved = products.filter(p => state.wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    saved.forEach(p => addProduct(p));
    notify('All wishlist items moved to cart');
  };

  return (
    <>
      <Breadcrumb items={['Wishlist']} />
      <main className="container" style={{ paddingBottom: 70 }}>
        <div className="section-heading">
          <h2>Your Wishlist</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#777' }}>{saved.length} items</span>
            {saved.length > 0 && (
              <button
                className="pill pill-dark"
                style={{ padding: '7px 14px', fontSize: 10 }}
                onClick={handleMoveAllToCart}
              >
                Add All to Cart
              </button>
            )}
          </div>
        </div>
        {saved.length ? (
          <div className="product-grid listing-grid">
            {saved.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <Heart size={24} style={{ margin: '0 auto 13px', color: '#d7282f' }} />
            <h3>Your wishlist is waiting</h3>
            <p>Save the pieces you love and find them here later.</p>
            <Link href="/shop/men" className="pill pill-dark" data-testid="link-wishlist-shop">
              Shop Collection <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

function NotFound() {
  return (
    <main className="container empty" style={{ margin: '60px auto' }}>
      <h1>Page not found</h1>
      <Link href="/" className="view-all">
        Return to JexHome →
      </Link>
    </main>
  );
}

const infoTexts: Record<string, string> = {
  'Contact Us': `Need assistance with an order, sizing or custom design?\n\nEmail: support@jexhome.com\nPhone: +91 95993 42525 (Mon–Sat, 10am–7pm)\nWhatsApp: +91 95993 42525\nAddress: JexHome Studio, Sector 15, New Delhi 110015, India`,
  'Shipping & Returns': `Free Shipping: Applicable on all prepaid orders above ₹499.\n\nDelivery Timelines:\n• Metros: 2–3 business days\n• Rest of India: 3–5 business days\n\nReturns & Exchange Policy:\n7 days easy exchange/returns for unworn items with tags intact. Raise a return request directly from your Account page.`,
  'FAQs': `1. What is the fabric quality of JexHome apparel?\nAll our tees and hoodies are made with 100% combed cotton, 240+ GSM heavyweight bio-washed fabric for superior soft feel and zero shrinkage.\n\n2. How long does the custom print last?\nWe use industrial DTG (Direct-to-Garment) printing with water-based eco-certified inks that bond into the fabric fibers, tested to endure 50+ wash cycles without cracking or peeling.\n\n3. Can I track my order?\nYes! Live tracking link is sent via SMS and email immediately upon dispatch.`,
  'Our Story': `Founded in New Delhi, JexHome is on a mission to bring personalized, art-driven aesthetics into everyday apparel and home living spaces.\n\nFrom high-contrast typography to hand-drawn botanical illustrations, every piece is tailored with obsessive care for detail, quality fabrics, and sustainable printing practices.\n\n"Wear your own story. Make your space yours."`,
  'Privacy Policy': `We respect your privacy. JexHome does not sell, trade, or rent personal identification info to third parties.\n\nAll transactions are secured via 256-bit SSL encryption through certified RBI-regulated payment gateways. Cookies are used only to preserve your shopping bag and user preferences.`,
  'Terms & Conditions': `By using the JexHome website, you agree to our standard terms of service. Products are subject to availability. Custom printed products cannot be returned unless received damaged or defective. All disputes are subject to New Delhi jurisdiction.`
};

function App() {
  const [toast, setToast] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);
  const [orderModal, setOrderModal] = useState<{ id: string; total: number; count: number } | null>(null);
  const [location] = useLocation();

  globalToastHandler = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    const onFull = () => notify('Storage is full — use smaller images or image URLs. Last change was not saved.');
    window.addEventListener('catalog-storage-full', onFull);
    return () => window.removeEventListener('catalog-storage-full', onFull);
  }, []);

  // Client-side navigation keeps the old scroll offset, so every new page would open mid-way or at the footer.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const toastEl = toast && (
    <div role="status" className="toast" data-testid="status-toast">
      {toast}
    </div>
  );

  if (location.startsWith('/admin')) {
    return (
      <>
        <AdminPage notify={notify} />
        {toastEl}
      </>
    );
  }

  const handleOpenInfo = (topic: string) => {
    setInfoModal({
      title: topic,
      content: infoTexts[topic] ?? `Information regarding ${topic}. Please reach out to support@jexhome.com for further questions.`
    });
  };

  return (
    <>
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop">{() => <Shop />}</Route>
        <Route path="/shop/:category" component={CategoryShop} />
        <Route path="/product/:slug" component={ProductDetail} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout">
          <Checkout onOrderPlaced={order => setOrderModal(order)} />
        </Route>
        <Route path="/custom-print" component={CustomPrint} />
        <Route path="/wishlist" component={Wishlist} />
        <Route component={NotFound} />
      </Switch>

      <Footer onOpenInfo={handleOpenInfo} />

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <InfoModal info={infoModal} onClose={() => setInfoModal(null)} />
      <OrderSuccessModal order={orderModal} onClose={() => setOrderModal(null)} />

      {toastEl}
    </>
  );
}

export default App;
