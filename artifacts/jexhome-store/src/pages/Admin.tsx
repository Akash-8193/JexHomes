import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'wouter';
import {
  LayoutDashboard, Package, ShoppingCart, Star, Award, Sparkles, Tag, FileText, Settings,
  LogOut, Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Search, Upload, ExternalLink,
  Eye, EyeOff, ImageIcon, Lock, Menu,
} from 'lucide-react';
import type { Product } from '../data/products';
import type { BestSellerCategory, BlogPost, HomeOffer, NewArrival } from '../data/content';
import { orderStatuses, slugify, useCatalog, type Order, type OrderStatus } from '../lib/catalog';
import './admin.css';

type Notify = (msg: string) => void;

// Client-side gate only: it keeps casual visitors out of the panel, it is not real security.
const ADMIN_PASSWORD = 'jexhome@admin';
const SESSION_KEY = 'jexhome-admin';

const currency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const categoryOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'cushions-pillow', label: 'Cushions & Pillow' },
];
const categoryLabel = (slug: string) => categoryOptions.find(c => c.value === slug)?.label ?? slug;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const todayLabel = () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Downscale uploads so a few photos don't exhaust localStorage.
async function fileToDataUrl(file: File, max = 1000): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- Generic form fields ---------- */

type Draft = Record<string, unknown>;
type Field = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'image' | 'images' | 'list' | 'lines' | 'paragraphs' | 'colors';
  options?: { value: string; label: string }[];
  wide?: boolean;
  required?: boolean;
  hint?: string;
  placeholder?: string;
};

const listFormat = { list: ', ', lines: '\n', paragraphs: '\n\n' } as const;
const listSplit = { list: /,/, lines: /\n/, paragraphs: /\n\s*\n/ } as const;

function TextListInput({ value, onChange, kind, placeholder }: {
  value: unknown; onChange: (v: string[]) => void; kind: 'list' | 'lines' | 'paragraphs'; placeholder?: string;
}) {
  // Keep the raw text locally so separators the user is still typing aren't stripped.
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(listFormat[kind]) : ''));
  const update = (t: string) => {
    setText(t);
    onChange(t.split(listSplit[kind]).map(v => v.trim()).filter(Boolean));
  };
  return kind === 'list'
    ? <input value={text} placeholder={placeholder} onChange={e => update(e.target.value)} />
    : <textarea rows={kind === 'paragraphs' ? 9 : 5} value={text} placeholder={placeholder} onChange={e => update(e.target.value)} />;
}

function UploadButton({ onFiles, multiple = false, notify }: { onFiles: (urls: string[]) => void; multiple?: boolean; notify: Notify }) {
  return (
    <label className="adm-btn adm-btn-light">
      <Upload size={15} /> Upload
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={async e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          try {
            onFiles(await Promise.all(files.map(f => fileToDataUrl(f))));
          } catch {
            notify('Could not read that image file');
          }
        }}
      />
    </label>
  );
}

function ImageInput({ value, onChange, notify }: { value: string; onChange: (v: string) => void; notify: Notify }) {
  return (
    <div className="adm-image-input">
      {value ? <img src={value} alt="" /> : <span className="adm-image-empty"><ImageIcon size={22} /></span>}
      <div>
        <input value={value.startsWith('data:') ? 'Uploaded image' : value} readOnly={value.startsWith('data:')} placeholder="/images/photo.jpg or https://…" onChange={e => onChange(e.target.value)} />
        <div className="adm-row">
          <UploadButton notify={notify} onFiles={([url]) => url && onChange(url)} />
          {value && <button type="button" className="adm-btn adm-btn-light" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

function GalleryInput({ value, onChange, notify }: { value: string[]; onChange: (v: string[]) => void; notify: Notify }) {
  const [url, setUrl] = useState('');
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="adm-gallery">
      <div className="adm-gallery-grid">
        {value.map((src, i) => (
          <div className="adm-gallery-item" key={`${i}-${src.slice(-24)}`}>
            <img src={src} alt="" />
            <div>
              {i > 0 && <button type="button" onClick={() => move(i, -1)} aria-label="Move left">‹</button>}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><X size={12} /></button>
              {i < value.length - 1 && <button type="button" onClick={() => move(i, 1)} aria-label="Move right">›</button>}
            </div>
          </div>
        ))}
        {!value.length && <span className="adm-muted">No gallery images yet</span>}
      </div>
      <div className="adm-row">
        <input value={url} placeholder="Image URL" onChange={e => setUrl(e.target.value)} />
        <button
          type="button"
          className="adm-btn adm-btn-light"
          onClick={() => {
            if (url.trim()) onChange([...value, url.trim()]);
            setUrl('');
          }}
        >
          Add
        </button>
        <UploadButton multiple notify={notify} onFiles={urls => onChange([...value, ...urls])} />
      </div>
    </div>
  );
}

function ColorsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [pick, setPick] = useState('#111111');
  return (
    <div className="adm-row adm-colors">
      {value.map(c => (
        <button type="button" key={c} className="adm-swatch" style={{ background: c }} title={`Remove ${c}`} onClick={() => onChange(value.filter(v => v !== c))}>
          <X size={11} />
        </button>
      ))}
      <input type="color" value={pick} onChange={e => setPick(e.target.value)} aria-label="Pick colour" />
      <button type="button" className="adm-btn adm-btn-light" onClick={() => !value.includes(pick) && onChange([...value, pick])}>
        Add colour
      </button>
    </div>
  );
}

function FieldInput({ field, value, onChange, notify }: { field: Field; value: unknown; onChange: (v: unknown) => void; notify: Notify }) {
  switch (field.type) {
    case 'number':
      return (
        <input
          type="number"
          step="any"
          value={value === undefined || value === null ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      );
    case 'textarea':
      return <textarea rows={4} value={String(value ?? '')} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />;
    case 'select':
      return (
        <select value={String(value ?? '')} onChange={e => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'checkbox':
      return (
        <label className="adm-check">
          <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />
          {field.hint}
        </label>
      );
    case 'image':
      return <ImageInput value={String(value ?? '')} onChange={onChange} notify={notify} />;
    case 'images':
      return <GalleryInput value={(value as string[]) ?? []} onChange={onChange} notify={notify} />;
    case 'colors':
      return <ColorsInput value={(value as string[]) ?? []} onChange={onChange} />;
    case 'list':
    case 'lines':
    case 'paragraphs':
      return <TextListInput kind={field.type} value={value} onChange={onChange} placeholder={field.placeholder} />;
    default:
      return <input value={String(value ?? '')} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />;
  }
}

function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="adm-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="adm-modal">
        <header>
          <h3>{title}</h3>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}

function ItemForm({ title, fields, initial, onSave, onCancel, notify }: {
  title: string;
  fields: Field[];
  initial: Draft;
  onSave: (draft: Draft) => string | void; // a returned string is a validation error
  onCancel: () => void;
  notify: Notify;
}) {
  const [draft, setDraft] = useState<Draft>(initial);

  const submit = () => {
    const missing = fields.find(f => {
      if (!f.required) return false;
      const v = draft[f.key];
      return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    });
    if (missing) return notify(`${missing.label} is required`);
    const error = onSave(draft);
    if (error) notify(error);
  };

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-light" onClick={onCancel}>Cancel</button>
          <button type="button" className="adm-btn" onClick={submit} data-testid="button-admin-save">Save</button>
        </>
      }
    >
      <div className="adm-form">
        {fields.map(f => (
          <div className={`adm-field ${f.wide || ['images', 'paragraphs', 'lines', 'textarea', 'image'].includes(f.type ?? '') ? 'wide' : ''}`} key={f.key}>
            {f.type !== 'checkbox' && <label>{f.label}{f.required && <em>*</em>}</label>}
            {f.type === 'checkbox' && <label>{f.label}</label>}
            <FieldInput field={f} value={draft[f.key]} notify={notify} onChange={v => setDraft(d => ({ ...d, [f.key]: v }))} />
            {f.hint && f.type !== 'checkbox' && <small>{f.hint}</small>}
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ---------- Shared bits ---------- */

function SectionHead({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="adm-section-head">
      <div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function MoveButtons({ index, length, onMove }: { index: number; length: number; onMove: (from: number, to: number) => void }) {
  return (
    <>
      <button className="adm-icon-btn" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Move up"><ArrowUp size={16} /></button>
      <button className="adm-icon-btn" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} aria-label="Move down"><ArrowDown size={16} /></button>
    </>
  );
}

const moveItem = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`adm-status adm-status-${status.toLowerCase()}`}>{status}</span>;
}

/* ---------- Dashboard ---------- */

function Dashboard({ go }: { go: (s: SectionKey) => void }) {
  const { products, orders, featuredIds, blogPosts, newArrivals, bestSellers } = useCatalog();
  const live = orders.filter(o => o.status !== 'Cancelled');
  const revenue = live.reduce((a, o) => a + o.total, 0);
  const pending = orders.filter(o => o.status === 'Pending').length;
  const stats = [
    { label: 'Total Revenue', value: currency(revenue), sub: `${live.length} active orders`, icon: ShoppingCart },
    { label: 'Orders', value: orders.length, sub: `${pending} pending`, icon: Package },
    { label: 'Products', value: products.length, sub: `${products.filter(p => p.listingVisible !== false).length} visible in shop`, icon: Tag },
    { label: 'Blog Posts', value: blogPosts.length, sub: `${featuredIds.length} featured products`, icon: FileText },
  ];

  return (
    <>
      <SectionHead title="Dashboard" text="Overview of your JexHome store." />
      <div className="adm-stats">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div className="adm-card adm-stat" key={label}>
            <span className="adm-stat-icon"><Icon size={20} /></span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{sub}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-card">
          <div className="adm-card-head">
            <h3>Recent Orders</h3>
            <button className="adm-link" onClick={() => go('orders')}>View all</button>
          </div>
          {orders.length ? (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.slice(0, 6).map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong><br /><small>{formatDate(o.date)}</small></td>
                      <td>{o.customer.fullName}</td>
                      <td>{currency(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="adm-empty">No orders yet. Orders placed from checkout will show up here.</p>}
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h3>Homepage Content</h3></div>
          <ul className="adm-quick">
            {([
              ['featured', 'Featured Products', featuredIds.length],
              ['bestSellers', 'Best Seller Categories', bestSellers.length],
              ['newArrivals', 'New Arrivals', newArrivals.length],
              ['blog', 'Blog Posts', blogPosts.length],
            ] as [SectionKey, string, number][]).map(([key, label, count]) => (
              <li key={key}>
                <button onClick={() => go(key)}>
                  <span>{label}</span>
                  <b>{count}</b>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ---------- Products ---------- */

const productFields: Field[] = [
  { key: 'name', label: 'Product name', required: true, wide: true },
  { key: 'slug', label: 'URL slug', hint: 'Leave empty to generate from the name' },
  { key: 'category', label: 'Category', type: 'select', options: categoryOptions, required: true },
  { key: 'type', label: 'Product type', placeholder: 'T-Shirt, Polo T-Shirts, Hoodie, Cushion…' },
  { key: 'badge', label: 'Badge', placeholder: 'Pack of 2, Set of 2…' },
  { key: 'price', label: 'Selling price (₹)', type: 'number', required: true },
  { key: 'mrp', label: 'MRP (₹)', type: 'number', hint: 'Shown struck-through when higher than price' },
  { key: 'rating', label: 'Rating (0–5)', type: 'number' },
  { key: 'reviews', label: 'Review count', type: 'number' },
  { key: 'image', label: 'Main image', type: 'image', required: true },
  { key: 'gallery', label: 'Gallery images', type: 'images', hint: 'Extra photos shown on the product page' },
  { key: 'colors', label: 'Colours', type: 'colors', wide: true },
  { key: 'sizes', label: 'Sizes', type: 'list', required: true, placeholder: 'S, M, L, XL, XXL', wide: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'highlights', label: 'Highlights', type: 'lines', placeholder: 'One point per line' },
  { key: 'group', label: 'Variant group', hint: 'Products sharing a group show as colour variants of each other' },
  { key: 'listingVisible', label: 'Visibility', type: 'checkbox', hint: 'Show in shop listing & search' },
  { key: 'isNew', label: 'New', type: 'checkbox', hint: 'Mark as new arrival' },
  { key: 'featured', label: 'Featured', type: 'checkbox', hint: 'Show in homepage featured products' },
];

function Products({ notify }: { notify: Notify }) {
  const { products, featuredIds, saveProduct, deleteProduct, setFeatured } = useCatalog();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => (!cat || p.category === cat) && (!q || p.name.toLowerCase().includes(q) || p.slug.includes(q)));
  }, [products, query, cat]);

  const toggleFeatured = (id: string) =>
    setFeatured(featuredIds.includes(id) ? featuredIds.filter(f => f !== id) : [...featuredIds, id]);

  const initialDraft = (p: Product | 'new'): Draft => p === 'new'
    ? { category: 'men', type: 'T-Shirt', rating: 5, reviews: 0, sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [], gallery: [], highlights: [], listingVisible: true, isNew: true, featured: false }
    : { ...p, gallery: p.gallery ?? [], highlights: p.highlights ?? [], listingVisible: p.listingVisible !== false, featured: featuredIds.includes(p.id) };

  const save = (d: Draft): string | void => {
    const current = editing === 'new' ? null : editing;
    const name = String(d.name).trim();
    const slug = slugify(String(d.slug || '') || name);
    if (!slug) return 'Enter a valid name or slug';
    if (products.some(p => p.slug === slug && p.id !== current?.id)) return `Slug "${slug}" is already used by another product`;
    const price = Number(d.price);
    if (!(price > 0)) return 'Price must be greater than 0';
    const gallery = (d.gallery as string[]) ?? [];
    const highlights = (d.highlights as string[]) ?? [];
    const opt = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
    const product: Product = {
      id: current?.id ?? `p-${Date.now().toString(36)}`,
      slug,
      name,
      category: String(d.category),
      type: opt(d.type),
      price,
      mrp: d.mrp ? Number(d.mrp) : undefined,
      rating: Math.min(5, Math.max(0, Number(d.rating ?? 5))),
      reviews: Math.max(0, Math.round(Number(d.reviews ?? 0))),
      colors: (d.colors as string[])?.length ? (d.colors as string[]) : ['#111111'],
      sizes: d.sizes as string[],
      image: String(d.image),
      gallery: gallery.length ? gallery : undefined,
      description: opt(d.description),
      highlights: highlights.length ? highlights : undefined,
      group: opt(d.group),
      badge: opt(d.badge),
      isNew: Boolean(d.isNew) || undefined,
      listingVisible: d.listingVisible ? undefined : false,
    };
    saveProduct(product);
    const isFeatured = featuredIds.includes(product.id);
    if (d.featured && !isFeatured) setFeatured([...featuredIds, product.id]);
    if (!d.featured && isFeatured) setFeatured(featuredIds.filter(f => f !== product.id));
    notify(current ? 'Product updated' : 'Product added');
    setEditing(null);
  };

  return (
    <>
      <SectionHead
        title="Products"
        text={`${products.length} products in your catalogue`}
        action={<button className="adm-btn" onClick={() => setEditing('new')} data-testid="button-admin-add-product"><Plus size={16} /> Add Product</button>}
      />
      <div className="adm-toolbar">
        <div className="adm-search"><Search size={16} /><input placeholder="Search products…" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">All categories</option>
          {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Featured</th><th>Visible</th><th /></tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="adm-prod">
                    <img src={p.image} alt="" />
                    <div>
                      <strong>{p.name}</strong>
                      <small>/{p.slug}</small>
                    </div>
                  </div>
                </td>
                <td>{categoryLabel(p.category)}</td>
                <td>
                  {currency(p.price)}
                  {p.mrp && p.mrp > p.price && <><br /><s className="adm-muted">{currency(p.mrp)}</s></>}
                </td>
                <td>★ {p.rating} <small className="adm-muted">({p.reviews})</small></td>
                <td>
                  <button className={`adm-icon-btn ${featuredIds.includes(p.id) ? 'on' : ''}`} onClick={() => toggleFeatured(p.id)} aria-label="Toggle featured">
                    <Star size={17} fill={featuredIds.includes(p.id) ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td>
                  <button
                    className={`adm-icon-btn ${p.listingVisible !== false ? 'on-green' : ''}`}
                    onClick={() => saveProduct({ ...p, listingVisible: p.listingVisible === false ? undefined : false })}
                    aria-label="Toggle visibility"
                  >
                    {p.listingVisible !== false ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </td>
                <td>
                  <div className="adm-actions">
                    <Link href={`/product/${p.slug}`} className="adm-icon-btn" aria-label="View"><ExternalLink size={16} /></Link>
                    <button className="adm-icon-btn" onClick={() => setEditing(p)} aria-label="Edit"><Pencil size={16} /></button>
                    <button
                      className="adm-icon-btn danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"?`)) {
                          deleteProduct(p.id);
                          notify('Product deleted');
                        }
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="adm-empty">No products match.</p>}
      </div>

      {editing && (
        <ItemForm
          title={editing === 'new' ? 'Add Product' : `Edit — ${editing.name}`}
          fields={productFields}
          initial={initialDraft(editing)}
          onSave={save}
          onCancel={() => setEditing(null)}
          notify={notify}
        />
      )}
    </>
  );
}

/* ---------- Orders ---------- */

function Orders({ notify }: { notify: Notify }) {
  const { orders, setOrderStatus, deleteOrder } = useCatalog();
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [query, setQuery] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const viewing = orders.find(o => o.id === viewId);

  const list = orders.filter(o => {
    const q = query.trim().toLowerCase();
    return (!filter || o.status === filter) &&
      (!q || o.id.toLowerCase().includes(q) || o.customer.fullName.toLowerCase().includes(q) || o.customer.phone.includes(q));
  });

  const remove = (o: Order) => {
    if (!window.confirm(`Delete order ${o.id}?`)) return;
    deleteOrder(o.id);
    setViewId(null);
    notify('Order deleted');
  };

  return (
    <>
      <SectionHead title="Orders" text={`${orders.length} orders received`} />
      <div className="adm-toolbar">
        <div className="adm-search"><Search size={16} /><input placeholder="Search by order ID, name or phone…" value={query} onChange={e => setQuery(e.target.value)} /></div>
        <div className="adm-chips">
          {(['', ...orderStatuses] as (OrderStatus | '')[]).map(s => (
            <button key={s || 'all'} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
              {s || 'All'} <small>{s ? orders.filter(o => o.status === s).length : orders.length}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="adm-card adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong><br /><small className="adm-muted">{formatDate(o.date)}</small></td>
                <td>{o.customer.fullName}<br /><small className="adm-muted">{o.customer.phone}</small></td>
                <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td><strong>{currency(o.total)}</strong></td>
                <td>{o.payment}</td>
                <td>
                  <select className={`adm-status-select adm-status-${o.status.toLowerCase()}`} value={o.status} onChange={e => setOrderStatus(o.id, e.target.value as OrderStatus)}>
                    {orderStatuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn adm-btn-light adm-btn-sm" onClick={() => setViewId(o.id)}>View</button>
                    <button className="adm-icon-btn danger" onClick={() => remove(o)} aria-label="Delete order"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="adm-empty">{orders.length ? 'No orders match.' : 'No orders yet. Orders placed from checkout will show up here.'}</p>}
      </div>

      {viewing && (
        <Modal
          title={`Order ${viewing.id}`}
          onClose={() => setViewId(null)}
          footer={
            <>
              <button className="adm-btn adm-btn-light danger" onClick={() => remove(viewing)}><Trash2 size={15} /> Delete</button>
              <button className="adm-btn" onClick={() => setViewId(null)}>Done</button>
            </>
          }
        >
          <div className="adm-order-top">
            <div><small>Placed on</small><strong>{formatDate(viewing.date)}</strong></div>
            <div><small>Payment</small><strong>{viewing.payment}</strong></div>
            <div>
              <small>Status</small>
              <select className={`adm-status-select adm-status-${viewing.status.toLowerCase()}`} value={viewing.status} onChange={e => setOrderStatus(viewing.id, e.target.value as OrderStatus)}>
                {orderStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-order-grid">
            <div className="adm-card">
              <h4>Customer</h4>
              <p><strong>{viewing.customer.fullName}</strong><br />{viewing.customer.phone}<br />{viewing.customer.email}</p>
            </div>
            <div className="adm-card">
              <h4>Shipping Address</h4>
              <p>
                {viewing.customer.address}
                {viewing.customer.apartment && <>, {viewing.customer.apartment}</>}<br />
                {viewing.customer.city}, {viewing.customer.state} – {viewing.customer.pincode}
              </p>
            </div>
          </div>
          <h4 className="adm-sub">Items</h4>
          <div className="adm-order-items">
            {viewing.items.map((i, idx) => (
              <div key={idx}>
                <img src={i.image} alt="" />
                <div>
                  <strong>{i.name}</strong>
                  <small>Colour: {i.color} · Size: {i.size} · Qty: {i.quantity}</small>
                </div>
                <b>{currency(i.price * i.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="adm-order-total">
            <span>Subtotal <b>{currency(viewing.subtotal)}</b></span>
            <span>Total paid <b>{currency(viewing.total)}</b></span>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------- Featured products ---------- */

function Featured({ notify }: { notify: Notify }) {
  const { products, featuredIds, setFeatured } = useCatalog();
  const [pick, setPick] = useState('');
  const featured = featuredIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p));
  const available = products.filter(p => !featuredIds.includes(p.id));

  return (
    <>
      <SectionHead title="Featured Products" text="Shown in “Discover featured products” on the homepage, in this order." />
      <div className="adm-toolbar">
        <select value={pick} onChange={e => setPick(e.target.value)} className="adm-grow">
          <option value="">Choose a product to feature…</option>
          {categoryOptions.map(c => (
            <optgroup key={c.value} label={c.label}>
              {available.filter(p => p.category === c.value).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </optgroup>
          ))}
        </select>
        <button
          className="adm-btn"
          disabled={!pick}
          onClick={() => {
            setFeatured([...featuredIds, pick]);
            setPick('');
            notify('Added to featured products');
          }}
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="adm-list">
        {featured.map((p, i) => (
          <div className="adm-card adm-list-row" key={p.id}>
            <span className="adm-num">{i + 1}</span>
            <img src={p.image} alt="" />
            <div className="adm-grow">
              <strong>{p.name}</strong>
              <small>{categoryLabel(p.category)} · {currency(p.price)}</small>
            </div>
            <MoveButtons index={i} length={featured.length} onMove={(a, b) => setFeatured(moveItem(featured.map(f => f.id), a, b))} />
            <button className="adm-icon-btn danger" onClick={() => setFeatured(featuredIds.filter(f => f !== p.id))} aria-label="Remove"><X size={16} /></button>
          </div>
        ))}
        {!featured.length && <p className="adm-empty adm-card">No featured products. Add some above.</p>}
      </div>
    </>
  );
}

/* ---------- Generic list sections (best sellers, new arrivals, offers, blog) ---------- */

function ListSection<T extends object>({ title, text, items, setItems, fields, blank, toItem, describe, itemName, notify }: {
  title: string;
  text: string;
  items: T[];
  setItems: (list: T[]) => void;
  fields: Field[];
  blank: Draft;
  toItem?: (draft: Draft, index: number | null) => T | string; // a string is a validation error
  describe: (item: T) => { image: string; title: string; sub: string };
  itemName: string;
  notify: Notify;
}) {
  const [editing, setEditing] = useState<number | 'new' | null>(null);

  const save = (d: Draft): string | void => {
    const index = editing === 'new' ? null : editing;
    const item = toItem ? toItem(d, index) : (d as unknown as T);
    if (typeof item === 'string') return item;
    setItems(index === null ? [...items, item] : items.map((it, i) => (i === index ? item : it)));
    notify(index === null ? `${itemName} added` : `${itemName} updated`);
    setEditing(null);
  };

  return (
    <>
      <SectionHead
        title={title}
        text={text}
        action={<button className="adm-btn" onClick={() => setEditing('new')}><Plus size={16} /> Add {itemName}</button>}
      />
      <div className="adm-list">
        {items.map((item, i) => {
          const info = describe(item);
          return (
            <div className="adm-card adm-list-row" key={`${i}-${info.title}`}>
              <span className="adm-num">{i + 1}</span>
              <img src={info.image} alt="" />
              <div className="adm-grow">
                <strong>{info.title}</strong>
                <small>{info.sub}</small>
              </div>
              <MoveButtons index={i} length={items.length} onMove={(a, b) => setItems(moveItem(items, a, b))} />
              <button className="adm-icon-btn" onClick={() => setEditing(i)} aria-label="Edit"><Pencil size={16} /></button>
              <button
                className="adm-icon-btn danger"
                onClick={() => {
                  if (window.confirm(`Delete "${info.title}"?`)) {
                    setItems(items.filter((_, j) => j !== i));
                    notify(`${itemName} deleted`);
                  }
                }}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        {!items.length && <p className="adm-empty adm-card">Nothing here yet. Click “Add {itemName}”.</p>}
      </div>
      {editing !== null && (
        <ItemForm
          title={editing === 'new' ? `Add ${itemName}` : `Edit ${itemName}`}
          fields={fields}
          initial={editing === 'new' ? blank : ({ ...items[editing] } as Draft)}
          onSave={save}
          onCancel={() => setEditing(null)}
          notify={notify}
        />
      )}
    </>
  );
}

function BestSellers({ notify }: { notify: Notify }) {
  const { bestSellers, setBestSellers, products } = useCatalog();
  return (
    <ListSection<BestSellerCategory>
      title="Best Seller Categories"
      text="Circles shown under “Shop by Style Categories” on the homepage."
      itemName="Category"
      items={bestSellers}
      setItems={setBestSellers}
      notify={notify}
      blank={{ slug: 'men', flat: false }}
      fields={[
        { key: 'name', label: 'Display name', required: true },
        { key: 'slug', label: 'Links to category', type: 'select', options: categoryOptions, required: true },
        { key: 'image', label: 'Image', type: 'image', required: true },
        { key: 'flat', label: 'Image style', type: 'checkbox', hint: 'Flat-lay product photo (fit inside circle on light background)' },
      ]}
      toItem={d => ({ name: String(d.name), slug: String(d.slug), image: String(d.image), flat: Boolean(d.flat) || undefined })}
      describe={b => ({
        image: b.image, title: b.name,
        sub: `${categoryLabel(b.slug)} · ${products.filter(p => p.category === b.slug && p.listingVisible !== false).length} products`,
      })}
    />
  );
}

function NewArrivals({ notify }: { notify: Notify }) {
  const { newArrivals, setNewArrivals, products } = useCatalog();
  const productOptions = products.map(p => ({ value: p.slug, label: p.name }));
  return (
    <ListSection<NewArrival>
      title="New Arrivals"
      text="Cards shown under “Fresh Styles just Landed” on the homepage."
      itemName="New Arrival"
      items={newArrivals}
      setItems={setNewArrivals}
      notify={notify}
      blank={{ position: 'center center' }}
      fields={[
        { key: 'title', label: 'Card title', required: true, wide: true },
        { key: 'slug', label: 'Product', type: 'select', options: productOptions, required: true, hint: 'The card opens this product’s category' },
        { key: 'position', label: 'Image focus', placeholder: 'center 30%', hint: 'CSS position, e.g. “center 30%” or “60% center”' },
        { key: 'image', label: 'Image', type: 'image', required: true },
      ]}
      toItem={d => {
        const product = products.find(p => p.slug === d.slug);
        if (!product) return 'Choose a product';
        return { title: String(d.title), slug: product.slug, category: product.category, image: String(d.image), position: String(d.position || 'center center') };
      }}
      describe={n => ({ image: n.image, title: n.title, sub: `${products.find(p => p.slug === n.slug)?.name ?? n.slug} · ${categoryLabel(n.category)}` })}
    />
  );
}

function Offers({ notify }: { notify: Notify }) {
  const { offers, setOffers } = useCatalog();
  return (
    <ListSection<HomeOffer>
      title="Offers"
      text="Offer banners shown on the homepage."
      itemName="Offer"
      items={offers}
      setItems={setOffers}
      notify={notify}
      blank={{ position: 'center center', href: '/shop' }}
      fields={[
        { key: 'tag', label: 'Tag', required: true, placeholder: '30% Off' },
        { key: 'title', label: 'Title', required: true },
        { key: 'text', label: 'Short text', required: true, wide: true },
        { key: 'href', label: 'Button link', required: true, placeholder: '/product/slug or /shop/men' },
        { key: 'position', label: 'Image focus', placeholder: 'center 25%' },
        { key: 'image', label: 'Image', type: 'image', required: true },
      ]}
      toItem={d => ({
        tag: String(d.tag), title: String(d.title), text: String(d.text), image: String(d.image),
        position: String(d.position || 'center center'), href: String(d.href),
      })}
      describe={o => ({ image: o.image, title: o.title, sub: `${o.tag} · ${o.href}` })}
    />
  );
}

function Blog({ notify }: { notify: Notify }) {
  const { blogPosts, setBlogPosts } = useCatalog();
  return (
    <ListSection<BlogPost>
      title="Blog Posts"
      text="Posts shown in “Latest Blogs” on the homepage and at /blog/…"
      itemName="Post"
      items={blogPosts}
      setItems={setBlogPosts}
      notify={notify}
      blank={{ date: todayLabel(), position: 'center center', shopHref: '/shop', shopLabel: 'Shop Now', body: [] }}
      fields={[
        { key: 'title', label: 'Title', required: true, wide: true },
        { key: 'slug', label: 'URL slug', hint: 'Leave empty to generate from the title' },
        { key: 'date', label: 'Date', required: true },
        { key: 'image', label: 'Cover image', type: 'image', required: true },
        { key: 'position', label: 'Image focus', placeholder: 'center 30%' },
        { key: 'body', label: 'Content', type: 'paragraphs', required: true, hint: 'Leave an empty line between paragraphs' },
        { key: 'shopLabel', label: 'Button text', placeholder: 'Shop Zip Polos' },
        { key: 'shopHref', label: 'Button link', placeholder: '/shop/men' },
      ]}
      toItem={(d, index) => {
        const slug = slugify(String(d.slug || '') || String(d.title));
        if (!slug) return 'Enter a valid title or slug';
        if (blogPosts.some((p, i) => p.slug === slug && i !== index)) return `Slug "${slug}" is already used by another post`;
        return {
          slug, title: String(d.title), date: String(d.date), image: String(d.image),
          position: String(d.position || 'center center'), body: d.body as string[],
          shopHref: String(d.shopHref || '/shop'), shopLabel: String(d.shopLabel || 'Shop Now'),
        };
      }}
      describe={p => ({ image: p.image, title: p.title, sub: `${p.date} · /blog/${p.slug}` })}
    />
  );
}

/* ---------- Settings ---------- */

function SettingsPanel({ notify, onLogout }: { notify: Notify; onLogout: () => void }) {
  const resetContent = useCatalog(s => s.resetContent);
  const orders = useCatalog(s => s.orders);
  let usedKb = 0;
  try {
    usedKb = Math.round((localStorage.getItem('jexhome-catalog')?.length ?? 0) / 1024);
  } catch {
    // storage unavailable
  }

  return (
    <>
      <SectionHead title="Settings" />
      <div className="adm-settings">
        <div className="adm-card">
          <h3>Storage</h3>
          <p>Store data is saved in this browser. Used: <b>{usedKb} KB</b> of about 5,000 KB. Uploaded photos take the most space — prefer image URLs for large catalogues.</p>
        </div>
        <div className="adm-card">
          <h3>Reset store content</h3>
          <p>Restore products, featured items, best sellers, new arrivals, offers and blog posts to the original JexHome content. Orders ({orders.length}) are kept.</p>
          <button
            className="adm-btn adm-btn-light danger"
            onClick={() => {
              if (window.confirm('Reset all store content to defaults? Your edits will be lost.')) {
                resetContent();
                notify('Store content reset to defaults');
              }
            }}
          >
            Reset content
          </button>
        </div>
        <div className="adm-card">
          <h3>Session</h3>
          <p>Log out of the admin panel on this device.</p>
          <button className="adm-btn adm-btn-light" onClick={onLogout}><LogOut size={15} /> Log out</button>
        </div>
      </div>
    </>
  );
}

/* ---------- Shell ---------- */

type SectionKey = 'dashboard' | 'products' | 'orders' | 'featured' | 'bestSellers' | 'newArrivals' | 'offers' | 'blog' | 'settings';

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="adm-login">
      <form
        className="adm-card"
        onSubmit={e => {
          e.preventDefault();
          if (password === ADMIN_PASSWORD) onLogin();
          else setError('Incorrect password');
        }}
      >
        <img src="/logo.png" alt="JexHome" />
        <h1>Admin Login</h1>
        <p>Sign in to manage your store.</p>
        <label>
          Password
          <div className="adm-search">
            <Lock size={16} />
            <input type="password" autoFocus value={password} onChange={e => { setPassword(e.target.value); setError(''); }} data-testid="input-admin-password" />
          </div>
        </label>
        {error && <span className="adm-error">{error}</span>}
        <button className="adm-btn" type="submit" data-testid="button-admin-login">Log in</button>
        <Link href="/" className="adm-link">← Back to store</Link>
      </form>
    </div>
  );
}

export default function AdminPage({ notify }: { notify: Notify }) {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [section, setSection] = useState<SectionKey>('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const { products, orders, featuredIds, bestSellers, newArrivals, offers, blogPosts } = useCatalog();

  const login = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // session-only login still works for this tab
    }
    setAuthed(true);
  };
  const logout = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // nothing to clear
    }
    setAuthed(false);
  };

  if (!authed) return <Login onLogin={login} />;

  const pending = orders.filter(o => o.status === 'Pending').length;
  const nav: [SectionKey, string, typeof Package, number?][] = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['products', 'Products', Package, products.length],
    ['orders', 'Orders', ShoppingCart, pending || undefined],
    ['featured', 'Featured Products', Star, featuredIds.length],
    ['bestSellers', 'Best Sellers', Award, bestSellers.length],
    ['newArrivals', 'New Arrivals', Sparkles, newArrivals.length],
    ['offers', 'Offers', Tag, offers.length],
    ['blog', 'Blog', FileText, blogPosts.length],
    ['settings', 'Settings', Settings],
  ];
  const go = (s: SectionKey) => {
    setSection(s);
    setNavOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="adm">
      <aside className={`adm-side ${navOpen ? 'open' : ''}`}>
        <div className="adm-brand">
          <img src="/logo.png" alt="JexHome" />
          <span>Admin</span>
        </div>
        <nav>
          {nav.map(([key, label, Icon, count]) => (
            <button key={key} className={section === key ? 'active' : ''} onClick={() => go(key)} data-testid={`button-admin-nav-${key}`}>
              <Icon size={18} />
              <span>{label}</span>
              {count !== undefined && <b className={key === 'orders' ? 'alert' : ''}>{count}</b>}
            </button>
          ))}
        </nav>
        <button className="adm-logout" onClick={logout}><LogOut size={18} /> Log out</button>
      </aside>
      {navOpen && <div className="adm-side-backdrop" onClick={() => setNavOpen(false)} />}

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-icon-btn adm-menu" onClick={() => setNavOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="adm-top-title">{nav.find(n => n[0] === section)?.[1]}</span>
          <Link href="/" className="adm-btn adm-btn-light"><ExternalLink size={15} /> View Store</Link>
        </header>
        <main className="adm-content">
          {section === 'dashboard' && <Dashboard go={go} />}
          {section === 'products' && <Products notify={notify} />}
          {section === 'orders' && <Orders notify={notify} />}
          {section === 'featured' && <Featured notify={notify} />}
          {section === 'bestSellers' && <BestSellers notify={notify} />}
          {section === 'newArrivals' && <NewArrivals notify={notify} />}
          {section === 'offers' && <Offers notify={notify} />}
          {section === 'blog' && <Blog notify={notify} />}
          {section === 'settings' && <SettingsPanel notify={notify} onLogout={logout} />}
        </main>
      </div>
    </div>
  );
}
