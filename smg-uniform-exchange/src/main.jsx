import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const STARTER_LISTINGS = [
  {
    id: 'demo-1',
    title: 'Girls Summer Dress',
    category: 'Dresses',
    size: '10',
    condition: 'Very good',
    price: 28,
    suburb: 'Subiaco',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
    status: 'approved',
  },
  {
    id: 'demo-2',
    title: 'Polo Shirt Bundle x3',
    category: 'Shirts',
    size: '8',
    condition: 'Good',
    price: 22,
    suburb: 'Claremont',
    image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1200&auto=format&fit=crop',
    status: 'approved',
  },
  {
    id: 'demo-3',
    title: 'School Jumper',
    category: 'Jumpers',
    size: '12',
    condition: 'Excellent',
    price: 35,
    suburb: 'Mount Lawley',
    image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1200&auto=format&fit=crop',
    status: 'approved',
  },
];

const CATEGORY_OPTIONS = ['Dresses', 'Shirts', 'Jumpers', 'Sportswear', 'Accessories', 'Bundles', 'Other'];
const ALL_CATEGORIES = ['All categories', ...CATEGORY_OPTIONS];

function filterListings(listings, query, category) {
  const cleanQuery = query.trim().toLowerCase();

  return listings.filter((item) => {
    const searchable = [item.title, item.category, item.size, item.condition, item.suburb, 'St Maria Goretti Catholic School', 'SMG']
      .join(' ')
      .toLowerCase();

    const matchesQuery = cleanQuery === '' || searchable.includes(cleanQuery);
    const matchesCategory = category === 'All categories' || item.category === category;

    return matchesQuery && matchesCategory;
  });
}

function tests() {
  console.assert(filterListings(STARTER_LISTINGS, 'jumper', 'All categories').length === 1, 'Search finds jumper');
  console.assert(filterListings(STARTER_LISTINGS, '', 'Shirts').length === 1, 'Category filter finds shirts');
  console.assert(filterListings(STARTER_LISTINGS, 'SMG', 'All categories').length === STARTER_LISTINGS.length, 'SMG finds all demo items');
  console.assert(filterListings(STARTER_LISTINGS, 'no-match', 'All categories').length === 0, 'Unknown search finds none');
}
tests();

const blankForm = {
  title: '',
  category: 'Dresses',
  size: '',
  condition: '',
  price: '',
  suburb: '',
  seller_name: '',
  seller_email: '',
  seller_phone: '',
  notes: '',
  imageFile: null,
};

function LogoMark() {
  return (
    <div className="logo-wrap">
      <div className="logo-mark" aria-hidden="true">
        <div className="logo-shape logo-blue-dark" />
        <div className="logo-shape logo-magenta" />
        <div className="logo-shape logo-blue" />
        <div className="logo-cross-v" />
        <div className="logo-cross-h" />
      </div>
      <div>
        <p className="brand-title">St Maria Goretti's</p>
        <p className="brand-subtitle">Catholic School</p>
        <p className="brand-small">Uniform Exchange</p>
      </div>
    </div>
  );
}

function App() {
  const [listings, setListings] = useState(STARTER_LISTINGS);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    async function loadListings() {
      if (!supabase) {
        setMessage('Demo mode: add Supabase keys in Vercel to make listings save permanently.');
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setMessage('Could not load live listings. Showing demo listings for now.');
      } else {
        setListings(data.length ? data : STARTER_LISTINGS);
      }
      setLoading(false);
    }

    loadListings();
  }, []);

  const filteredListings = useMemo(() => filterListings(listings, query, category), [listings, query, category]);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  function updateForm(event) {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }));
  }

  function addToCart(item) {
    setCart((current) => (current.some((cartItem) => cartItem.id === item.id) ? current : [...current, item]));
  }

  async function uploadImage(file) {
    if (!supabase || !file) return '';

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
    const filePath = `${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from('listing-photos').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from('listing-photos').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function submitListing(event) {
    event.preventDefault();
    setMessage('');

    if (!form.title.trim() || !form.size.trim() || !form.price.trim() || !form.suburb.trim() || !form.seller_email.trim()) {
      setMessage('Please complete item name, size, price, suburb and email.');
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadImage(form.imageFile);

      const newListing = {
        title: form.title.trim(),
        category: form.category,
        size: form.size.trim(),
        condition: form.condition.trim() || 'Good',
        price: Number(form.price) || 0,
        suburb: form.suburb.trim(),
        seller_name: form.seller_name.trim(),
        seller_email: form.seller_email.trim(),
        seller_phone: form.seller_phone.trim(),
        notes: form.notes.trim(),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1200&auto=format&fit=crop',
        status: supabase ? 'pending' : 'approved',
      };

      if (supabase) {
        const { error } = await supabase.from('listings').insert(newListing);
        if (error) throw error;
        setMessage('Listing submitted. It will appear after admin approval.');
      } else {
        const localListing = { ...newListing, id: Date.now().toString(), status: 'approved' };
        setListings((current) => [localListing, ...current]);
        setMessage('Demo listing added. Connect Supabase so public submissions save permanently.');
      }

      setForm(blankForm);
      event.target.reset();
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong submitting the listing. Check Supabase setup and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <LogoMark />
          <nav className="nav">
            <a href="#shop">Shop</a>
            <a href="#sell">Sell</a>
            <a href="#how">How it works</a>
          </nav>
          <button className="btn btn-primary">Cart {cart.length ? `- $${cartTotal}` : ''}</button>
        </div>
      </header>

      <section className="hero container">
        <div>
          <div className="pill">One school community only</div>
          <h1>St Maria Goretti second-hand uniform marketplace.</h1>
          <p className="lead">Parents can add uniform listings. Other families can browse what is available, search by size/category, and contact the seller.</p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-large" href="#shop">Browse uniforms</a>
            <a className="btn btn-outline btn-large" href="#sell">List an item</a>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-top">
            <p>Featured SMG listing</p>
            <h2>Complete Year 5 Bundle</h2>
            <span>Dress, jumper, sports shirt, shorts and school hat.</span>
          </div>
          <div className="feature-grid">
            <div>Save money</div>
            <div>Reuse gear</div>
            <div>Local pickup</div>
          </div>
        </div>
      </section>

      <main id="shop" className="container section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h2>Available uniforms</h2>
            {loading ? <p className="muted">Loading listings...</p> : null}
          </div>
          <div className="filters">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search size, suburb, item..." />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {ALL_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="grid listings-grid">
          {filteredListings.map((item) => (
            <article key={item.id} className="card listing-card">
              <div className="image-wrap">
                <img src={item.image_url} alt={item.title} />
                <button className="save-btn">Save</button>
              </div>
              <div className="card-body">
                <div className="listing-title-row">
                  <div>
                    <h3>{item.title}</h3>
                    <p>St Maria Goretti Catholic School</p>
                  </div>
                  <strong>${item.price}</strong>
                </div>
                <div className="listing-meta">
                  <span>Size {item.size}</span>
                  <span>{item.condition}</span>
                  <span>Pickup: {item.suburb}</span>
                </div>
                <div className="listing-actions">
                  <a className="btn btn-outline" href={`mailto:${item.seller_email || ''}?subject=SMG uniform enquiry: ${encodeURIComponent(item.title)}`}>Ask</a>
                  <button className="btn btn-primary" onClick={() => addToCart(item)}>Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <section id="sell" className="sell-section">
        <div className="container sell-grid">
          <div>
            <p className="eyebrow">Sell</p>
            <h2>Parents can add their own listings</h2>
            <p className="lead-small">Items are submitted as pending when Supabase is connected. Admin can approve them before they appear publicly.</p>
          </div>

          <form className="submit-form" onSubmit={submitListing}>
            <input name="title" value={form.title} onChange={updateForm} placeholder="Item name" />
            <select name="category" value={form.category} onChange={updateForm}>
              {CATEGORY_OPTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="form-row">
              <input name="size" value={form.size} onChange={updateForm} placeholder="Size" />
              <input name="price" value={form.price} onChange={updateForm} type="number" min="0" step="1" placeholder="Price" />
              <input name="suburb" value={form.suburb} onChange={updateForm} placeholder="Suburb" />
            </div>
            <div className="form-row">
              <input name="seller_name" value={form.seller_name} onChange={updateForm} placeholder="Seller name" />
              <input name="seller_email" value={form.seller_email} onChange={updateForm} type="email" placeholder="Seller email" />
              <input name="seller_phone" value={form.seller_phone} onChange={updateForm} placeholder="Phone optional" />
            </div>
            <input name="imageFile" onChange={updateForm} type="file" accept="image/*" />
            <textarea name="condition" value={form.condition} onChange={updateForm} placeholder="Condition, e.g. very good, small mark on collar" />
            <textarea name="notes" value={form.notes} onChange={updateForm} placeholder="Extra notes optional" />
            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit listing'}</button>
            {message ? <p className="message">{message}</p> : null}
          </form>
        </div>
      </section>

      <section id="how" className="container section">
        <div className="info-grid">
          <div className="card info-card"><b>1</b><h3>Parent submits</h3><p>Families add item details, contact info and a photo.</p></div>
          <div className="card info-card"><b>2</b><h3>Admin approves</h3><p>Listings can be checked before going public.</p></div>
          <div className="card info-card"><b>3</b><h3>Families browse</h3><p>Approved items appear on the website for other parents.</p></div>
        </div>
      </section>

      <footer className="footer">2026 St Maria Goretti Uniform Exchange. Built for the school community.</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
