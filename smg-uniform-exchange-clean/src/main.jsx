import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const demoProducts = [
  { id: 'demo-1', title: 'Girls Summer Dress', category: 'Dresses', size: '10', condition: 'Very good', price: 28, suburb: 'Subiaco', description: 'Excellent condition summer uniform.', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop' },
  { id: 'demo-2', title: 'Polo Shirt Bundle x3', category: 'Shirts', size: '8', condition: 'Good', price: 22, suburb: 'Claremont', description: 'Three polos, good everyday condition.', image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1200&auto=format&fit=crop' },
  { id: 'demo-3', title: 'School Jumper', category: 'Jumpers', size: '12', condition: 'Excellent', price: 35, suburb: 'Mount Lawley', description: 'Warm winter jumper.', image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1200&auto=format&fit=crop' }
];

const baseCategories = ['Dresses', 'Shirts', 'Jumpers', 'Sportswear', 'Accessories', 'Bundles'];

function LogoMark() {
  return (
    <div className="logo-wrap">
      <div className="logo-mark" aria-hidden="true">
        <div className="petal petal-left" />
        <div className="petal petal-main" />
        <div className="petal petal-right" />
        <div className="cross cross-v" />
        <div className="cross cross-h" />
      </div>
      <div>
        <div className="brand-title">St Maria Goretti's</div>
        <div className="brand-subtitle">Catholic School</div>
        <div className="brand-small">Uniform Exchange</div>
      </div>
    </div>
  );
}

function Button({ children, secondary, ...props }) {
  return <button className={secondary ? 'button secondary' : 'button'} {...props}>{children}</button>;
}

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ title: '', category: 'Dresses', size: '', condition: '', price: '', suburb: '', description: '', seller_name: '', seller_email: '' });

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    if (!supabase) {
      setListings(demoProducts);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setMessage('Could not load live listings. Showing demo listings for now.');
      setListings(demoProducts);
    } else {
      setListings(data && data.length ? data : demoProducts);
    }
    setLoading(false);
  }

  const categories = useMemo(() => ['All categories', ...Array.from(new Set([...baseCategories, ...listings.map((item) => item.category).filter(Boolean)]))], [listings]);

  const filtered = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return listings.filter((item) => {
      const text = [item.title, item.category, item.size, item.condition, item.suburb, item.description, 'SMG', 'St Maria Goretti Catholic School'].join(' ').toLowerCase();
      const matchesQuery = cleanQuery === '' || text.includes(cleanQuery);
      const matchesCategory = category === 'All categories' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [listings, query, category]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!form.title.trim() || !form.size.trim() || !form.price.trim() || !form.seller_email.trim()) {
      setMessage('Please add item name, size, price and seller email.');
      return;
    }

    const newListing = {
      title: form.title.trim(),
      category: form.category,
      size: form.size.trim(),
      condition: form.condition.trim() || 'Good',
      price: Number(form.price) || 0,
      suburb: form.suburb.trim(),
      description: form.description.trim(),
      seller_name: form.seller_name.trim(),
      seller_email: form.seller_email.trim(),
      image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=1200&auto=format&fit=crop',
      approved: false
    };

    if (!supabase) {
      setMessage('Demo mode: listing captured locally. Add Supabase keys in Vercel to save real submissions.');
      setListings((current) => [{ ...newListing, id: Date.now(), approved: true }, ...current]);
    } else {
      const { error } = await supabase.from('listings').insert(newListing);
      if (error) {
        console.error(error);
        setMessage('There was a problem submitting the listing. Please check Supabase settings.');
        return;
      }
      setMessage('Listing submitted. It will appear after admin approval.');
    }

    setForm({ title: '', category: 'Dresses', size: '', condition: '', price: '', suburb: '', description: '', seller_name: '', seller_email: '' });
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header-inner">
          <LogoMark />
          <nav className="nav">
            <a href="#shop">Shop</a>
            <a href="#sell">Sell</a>
            <a href="#how">How it works</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div>
            <div className="pill">One school community only</div>
            <h1>St Maria Goretti second-hand uniform marketplace.</h1>
            <p>A simple parent-to-parent exchange for St Maria Goretti uniforms, sports gear, hats and accessories.</p>
            <div className="hero-actions">
              <a className="button link-button" href="#shop">Browse uniforms</a>
              <a className="button secondary link-button" href="#sell">List an item</a>
            </div>
          </div>
          <Card className="feature-card">
            <div className="feature-top">
              <span>Featured SMG listing</span>
              <h2>Complete Year 5 Bundle</h2>
              <p>Dress, jumper, sports shirt, shorts and school hat.</p>
            </div>
            <div className="feature-grid">
              <div>Save money</div>
              <div>Reuse gear</div>
              <div>Local pickup</div>
            </div>
          </Card>
        </section>

        <section id="shop" className="container section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h2>Available uniforms</h2>
            </div>
            <div className="filters">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search size, suburb, item..." />
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {loading ? <p>Loading listings...</p> : null}
          {message ? <div className="notice">{message}</div> : null}
          <div className="grid">
            {filtered.map((product) => (
              <Card key={product.id} className="product-card">
                <img src={product.image_url || demoProducts[0].image_url} alt={product.title} />
                <div className="product-body">
                  <div className="product-head">
                    <div>
                      <h3>{product.title}</h3>
                      <p>St Maria Goretti Catholic School</p>
                    </div>
                    <strong>${product.price}</strong>
                  </div>
                  <div className="chips">
                    <span>Size {product.size}</span>
                    <span>{product.condition || 'Good'}</span>
                    <span>Pickup: {product.suburb || 'TBC'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="sell" className="sell-section">
          <div className="container sell-grid">
            <div>
              <p className="eyebrow">Sell</p>
              <h2>List a uniform in minutes</h2>
              <p>Parents can submit the item name, size, condition, price and pickup suburb. Listings are saved as pending until approved.</p>
            </div>
            <form onSubmit={handleSubmit} className="listing-form">
              <input name="title" value={form.title} onChange={handleFormChange} placeholder="Item name" />
              <select name="category" value={form.category} onChange={handleFormChange}>
                {baseCategories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <div className="form-row">
                <input name="size" value={form.size} onChange={handleFormChange} placeholder="Size" />
                <input name="price" value={form.price} onChange={handleFormChange} type="number" placeholder="Price" />
                <input name="suburb" value={form.suburb} onChange={handleFormChange} placeholder="Suburb" />
              </div>
              <input name="condition" value={form.condition} onChange={handleFormChange} placeholder="Condition, e.g. Very good" />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Notes" />
              <div className="form-row two">
                <input name="seller_name" value={form.seller_name} onChange={handleFormChange} placeholder="Your name" />
                <input name="seller_email" value={form.seller_email} onChange={handleFormChange} placeholder="Your email" type="email" />
              </div>
              <Button type="submit">Submit listing for approval</Button>
            </form>
          </div>
        </section>

        <section id="how" className="container section how-grid">
          <Card><b>1. Browse SMG uniforms</b><p>Find items by category, size and pickup suburb.</p></Card>
          <Card><b>2. Parents submit listings</b><p>Items go into the database as pending.</p></Card>
          <Card><b>3. Admin approval</b><p>Approved listings appear on the public website.</p></Card>
        </section>
      </main>

      <footer className="footer">2026 St Maria Goretti Uniform Exchange. Built for the school community.</footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
