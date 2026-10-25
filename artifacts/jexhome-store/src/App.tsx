import { useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  Heart, Search, UserRound, ShoppingBag, ShoppingCart, Menu, X,
  ShieldCheck, Sparkles, Truck, Globe2, ArrowRight, Upload, Type,
  Shapes, Palette, Box, Trash2, Plus, Minus, Play, PackageCheck,
  RotateCcw, Leaf, SlidersHorizontal, ChevronRight, Instagram,
  Facebook, Youtube, CheckCircle2, Star, CreditCard, Smartphone, Check
} from 'lucide-react';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { categoryMeta, featuredProducts, products, type Product } from './data/products';
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
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          data-testid="button-toggle-menu"
        >
          {open ? <X size={19} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="brand" data-testid="link-home-logo">
          <img src="/logo.png" alt="JexHome" />
        </Link>
        <nav className={`navlinks ${open ? 'open' : ''}`}>
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
    </header>
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
  const [filter, setFilter] = useState('All');
  const [, navigate] = useLocation();

  const shown = useMemo(() => {
    if (filter === 'All') return featuredProducts;
    if (filter === 'Custom Print') return [products[0]];
    if (filter === 'T-Shirts') return products.filter(p => ['men', 'women'].includes(p.category) && p.listingVisible !== false).slice(0, 4);
    if (filter === 'Kids') return products.filter(p => p.category === 'kids' && p.listingVisible !== false).slice(0, 4);
    if (filter === 'Hoodies') return products.filter(p => p.category === 'hoodies' && p.listingVisible !== false).slice(0, 4);
    if (filter === 'Cushions') return products.filter(p => p.category === 'cushions-pillow' && p.listingVisible !== false).slice(0, 4);
    return featuredProducts;
  }, [filter]);

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
            <img src="/images/hero-model.png" alt="Young man wearing good things custom apparel" />
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

      <section className="container home-products">
        <div className="section-heading">
          <h2 className="serif">Featured Products</h2>
          <div className="tabs">
            {['All', 'T-Shirts', 'Hoodies', 'Kids', 'Cushions', 'Custom Print'].map(tab => (
              <button
                onClick={() => setFilter(tab)}
                className={`tab ${filter === tab ? 'active' : ''}`}
                key={tab}
                data-testid={`button-feature-${tab.toLowerCase().replaceAll(' ', '-')}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link href="/shop/men" className="view-all" data-testid="link-view-all">
            View All →
          </Link>
        </div>
        <div className="product-grid">
          {shown.map(p => (
            <ProductCard product={p} key={p.id} />
          ))}
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
          <img src="/images/custom-shirt.png" alt="Good Vibes custom T-shirt" />
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
    </>
  );
}

function Footer({ onOpenInfo }: { onOpenInfo: (topic: string) => void }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link href="/" className="brand footer-logo">
            <img src="/logo.png" alt="JexHome" />
          </Link>
          <p style={{ fontSize: 10, color: '#777', maxWidth: 210, lineHeight: 1.6 }}>
            Wear your story. Make your space yours. Premium custom apparel & home decor.
          </p>
          <div style={{ display: 'flex', gap: 12, color: '#6b6b6b' }}>
            <button
              onClick={() => notify('Follow JexHome on Instagram @jexhome_official')}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              aria-label="Instagram"
            >
              <Instagram size={15} />
            </button>
            <button
              onClick={() => notify('Visit our Facebook community @jexhome')}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              aria-label="Facebook"
            >
              <Facebook size={15} />
            </button>
            <button
              onClick={() => notify('Watch design tutorials on our YouTube channel')}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              aria-label="YouTube"
            >
              <Youtube size={15} />
            </button>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <div className="foot-links">
            <Link href="/shop/men">Men</Link>
            <Link href="/shop/women">Women</Link>
            <Link href="/shop/kids">Kids</Link>
            <Link href="/shop/hoodies">Hoodies</Link>
            <Link href="/shop/cushions-pillow">Cushions & Pillow</Link>
            <Link href="/custom-print">Custom Print</Link>
          </div>
        </div>

        <div>
          <h4>Help</h4>
          <div className="foot-links">
            <button
              onClick={() => onOpenInfo('Contact Us')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              Contact Us
            </button>
            <button
              onClick={() => onOpenInfo('Shipping & Returns')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              Shipping & Returns
            </button>
            <button
              onClick={() => onOpenInfo('FAQs')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              FAQs
            </button>
          </div>
        </div>

        <div>
          <h4>Company</h4>
          <div className="foot-links">
            <button
              onClick={() => onOpenInfo('Our Story')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              Our Story
            </button>
            <button
              onClick={() => onOpenInfo('Privacy Policy')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenInfo('Terms & Conditions')}
              style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, cursor: 'pointer', color: 'inherit' }}
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
      <div className="container" style={{ fontSize: 9, color: '#888', marginTop: 29 }}>
        © JexHome — Custom Apparel & Home Decor. All rights reserved.
      </div>
    </footer>
  );
}

function Listing() {
  const { category = 'men' } = useParams();
  const meta = categoryMeta[category] ?? categoryMeta.men;
  const [sort, setSort] = useState('Popular');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [selectedCat, setSelectedCat] = useState('T-Shirts');
  const [fabric, setFabric] = useState<string[]>([]);
  const [mobileFilter, setMobileFilter] = useState(false);

  const resetFilters = () => {
    setSize('');
    setColor('');
    setSelectedCat('');
    setMaxPrice(2000);
    setFabric([]);
    notify('Filters reset to default');
  };

  const hasActiveFilters = Boolean(size || color || selectedCat || maxPrice < 2000 || fabric.length > 0);

  const items = useMemo(() => {
    let result = products.filter(p =>
      p.category === category &&
      p.listingVisible !== false &&
      p.price <= maxPrice &&
      (!size || p.sizes.includes(size)) &&
      (!color || p.colors.includes(color)) &&
      (!selectedCat || selectedCat === 'T-Shirts' || (selectedCat === 'Hoodies' && p.category === 'hoodies') || (selectedCat === 'Oversized' && p.name.toLowerCase().includes('oversized')) || (selectedCat === 'Polo T-Shirts' && p.name.toLowerCase().includes('polo'))) &&
      fabric.every(f => f === 'Cotton' || (f === 'Cotton Blend' && p.price < 550) || (f === 'Premium' && p.rating >= 4.8) || (f === 'Oversized Fit' && p.name.toLowerCase().includes('oversized')))
    );
    if (sort === 'Popular') result.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === 'Price Low to High') result.sort((a, b) => a.price - b.price);
    if (sort === 'Price High to Low') result.sort((a, b) => b.price - a.price);
    if (sort === 'Rating') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'Newest') result.reverse();
    return result;
  }, [category, sort, maxPrice, size, color, selectedCat, fabric]);

  const colors = ['#111', '#fff', '#d7282f', '#245f9c', '#198e92', '#e4c330'];

  return (
    <>
      <Breadcrumb items={['Home', meta.title.split(' ')[0], category === 'men' ? 'T-Shirts' : meta.title]} />
      <main className="container listing">
        <button
          className="mobile-filter"
          onClick={() => setMobileFilter(!mobileFilter)}
          data-testid="button-show-filters"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        {mobileFilter && (
          <button
            className="filter-backdrop"
            aria-label="Close filters"
            onClick={() => setMobileFilter(false)}
            data-testid="button-close-filters"
          />
        )}

        <aside className={`filters ${mobileFilter ? 'show' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Filters</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                style={{ border: 0, background: 'none', color: '#d7282f', fontSize: 10, cursor: 'pointer' }}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            {[['T-Shirts', '24'], ['Hoodies', '12'], ['Oversized', '8'], ['Polo T-Shirts', '6']].map(([name, count]) => (
              <label className="check-row" key={name}>
                <input
                  type="checkbox"
                  checked={selectedCat === name}
                  onChange={() => setSelectedCat(selectedCat === name ? '' : name)}
                  data-testid={`filter-category-${name.toLowerCase().replaceAll(' ', '-')}`}
                />
                {name} ({count})
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Size</h4>
            <div className="size-row">
              {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                <button
                  className={`size-btn ${size === s ? 'on' : ''}`}
                  onClick={() => setSize(size === s ? '' : s)}
                  key={s}
                  data-testid={`filter-size-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Color</h4>
            <div className="color-row">
              {colors.map(c => (
                <button
                  key={c}
                  className={`color-filter ${color === c ? 'on' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(color === c ? '' : c)}
                  aria-label={`Filter ${getColorName(c)}`}
                  data-testid={`filter-color-${c.replace('#', '')}`}
                />
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price</h4>
            <input
              className="range"
              type="range"
              min="0"
              max="2000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              data-testid="input-price-range"
            />
            <div className="range-labels">
              <span>₹0</span>
              <span>{currency(maxPrice)}</span>
            </div>
          </div>

          <div className="filter-group">
            <h4>Fabric</h4>
            {['Cotton', 'Cotton Blend', 'Premium', 'Oversized Fit'].map(x => (
              <label className="check-row" key={x}>
                <input
                  type="checkbox"
                  checked={fabric.includes(x)}
                  onChange={() =>
                    setFabric(fabric.includes(x) ? fabric.filter(item => item !== x) : [...fabric, x])
                  }
                  data-testid={`filter-fabric-${x.toLowerCase().replaceAll(' ', '-')}`}
                />
                {x}
              </label>
            ))}
          </div>
        </aside>

        <section>
          <div className="list-head">
            <div>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            <label className="sort">
              Sort By{' '}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                data-testid="select-sort"
              >
                {['Popular', 'Price Low to High', 'Price High to Low', 'Newest', 'Rating'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="product-grid listing-grid">
            {items.length ? (
              items.map(p => <ProductCard product={p} key={p.id} />)
            ) : (
              <div className="empty">
                No products match these filters.
                <br />
                <button
                  className="pill pill-dark"
                  style={{ marginTop: 14 }}
                  onClick={resetFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
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
  return <ProductDetailView key={slug} slug={slug} />;
}

function ProductDetailView({ slug }: { slug: string }) {
  const product = products.find(p => p.slug === slug) || products[0];
  const [color, setColor] = useState(slug === 'good-vibes-oversized-t-shirt' ? '#f1eee7' : product.colors[0]);
  const [size, setSize] = useState(slug === 'good-vibes-oversized-t-shirt' ? 'L' : product.sizes[1]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('Description');
  const [thumb, setThumb] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

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
        '/images/hero-model.png',
        '/images/prod-minimal-tee.jpg',
        product.image
      ];
    }
    return [
      product.image,
      '/images/prod-good-vibes-detail.png',
      '/images/hero-model.png',
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
    if (!reviewName || !reviewText) {
      notify('Please fill in your name and review');
      return;
    }
    notify('Thank you! Your review has been submitted for approval.');
    setReviewOpen(false);
    setReviewName('');
    setReviewText('');
  };

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
                    <img src={v.gallery?.[v.gallery.length - 1] ?? v.image} alt={v.name} />
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span className="stars" style={{ fontSize: 16 }}>★★★★★</span> &nbsp;
                  <strong style={{ fontSize: 14 }}>{product.rating} out of 5</strong>
                  <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>Based on {product.reviews} verified buyer ratings</div>
                </div>
                <button
                  className="pill pill-dark"
                  style={{ padding: '8px 14px', fontSize: 11 }}
                  onClick={() => setReviewOpen(true)}
                >
                  Write a Review
                </button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ background: '#fcfbf9', border: '1px solid #eee', padding: 14, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <strong>Rohan Sharma — Verified Buyer</strong>
                    <span className="stars">★★★★★</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#555' }}>
                    The print quality blew my mind! Fabric is heavy, feels super premium like Zara or H&M streetwear. Fitting is 10/10.
                  </p>
                </div>
                <div style={{ background: '#fcfbf9', border: '1px solid #eee', padding: 14, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <strong>Pooja Verma — Verified Buyer</strong>
                    <span className="stars">★★★★★</span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: '#555' }}>
                    Received within 3 days in Mumbai. The Good Vibes tee looks even better in person than photos.
                  </p>
                </div>
              </div>

              {reviewOpen && (
                <div style={{ marginTop: 20, background: '#f8f6f2', padding: 16, borderRadius: 10, border: '1px solid #eee' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 13 }}>Share your feedback</h4>
                  <form onSubmit={handleReviewSubmit} className="review-form">
                    <input
                      placeholder="Your Full Name"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      Rating:
                      <select
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        style={{ border: '1px solid #ddd', borderRadius: 4, padding: 4 }}
                      >
                        <option value={5}>★★★★★ (5 Stars)</option>
                        <option value={4}>★★★★☆ (4 Stars)</option>
                        <option value={3}>★★★☆☆ (3 Stars)</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Write your review here..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="pill pill-dark" style={{ padding: '8px 16px', fontSize: 10 }}>
                        Submit Review
                      </button>
                      <button
                        type="button"
                        className="pill pill-outline"
                        style={{ padding: '8px 16px', fontSize: 10 }}
                        onClick={() => setReviewOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
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

  const custom = products[0];
  const customPrice = productType === 'Hoodie' ? 999 : productType === 'Cushion Cover' ? 449 : 499;
  const customImage =
    productType === 'Hoodie'
      ? '/images/prod-oversized-hoodie.jpg'
      : productType === 'Cushion Cover'
      ? '/images/prod-cushion-botanical.png'
      : '/images/custom-shirt.png';

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
      <Breadcrumb items={['Home', 'Custom Print']} />
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

  globalToastHandler = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2500);
  };

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
        <Route path="/shop/:category" component={Listing} />
        <Route path="/product/:slug" component={ProductDetail} />
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

      {toast && (
        <div role="status" className="toast" data-testid="status-toast">
          {toast}
        </div>
      )}
    </>
  );
}

export default App;
