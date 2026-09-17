'use client';

import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

const propertyTypes = ['House', 'Apartment', 'Duplex', 'Land', 'Office', 'Shop', 'Warehouse', 'Commercial', 'Other'];
const listingTypes = ['For Sale', 'For Rent', 'For Lease'];
const statuses = ['Available', 'Reserved', 'Sold', 'Rented', 'Leased', 'Off Market'];

const emptyProperty = {
  title: '', slug: '', description: '', propertyType: 'House', listingType: 'For Sale',
  price: '', currency: 'NGN', location: '', address: '', bedrooms: '', bathrooms: '',
  area: '', areaUnit: 'sqm', landSize: '', furnished: false, featured: false,
  status: 'Available', coverImageUrl: '', galleryImages: '', contactName: '',
  contactPhone: '', contactEmail: '', published: false,
};

export default function AdminPropertyManager() {
  const [properties, setProperties] = useState<any[]>([]);
  const [form, setForm] = useState(emptyProperty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingFilter, setListingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter) params.set('propertyType', typeFilter);
      if (listingFilter) params.set('listingType', listingFilter);
      if (statusFilter) params.set('status', statusFilter);
      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load properties');
      setProperties(Array.isArray(data.properties) ? data.properties : []);
    } catch (error) {
      console.error(error);
      setNotice({ text: 'Unable to load property adverts.', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProperties(); }, [typeFilter, listingFilter, statusFilter]);

  const update = (field: string, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => { setEditingId(null); setForm(emptyProperty); };
  const edit = (property: any) => {
    setEditingId(property.id);
    setForm({
      ...emptyProperty,
      ...property,
      galleryImages: Array.isArray(property.galleryImages) ? property.galleryImages.join('\n') : '',
      published: Boolean(property.published),
      furnished: Boolean(property.furnished),
      featured: Boolean(property.featured),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (published: boolean) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        published,
        price: form.price || null,
        bedrooms: form.bedrooms || null,
        bathrooms: form.bathrooms || null,
        area: form.area || null,
        landSize: form.landSize || null,
        galleryImages: form.galleryImages.split('\n').map((item) => item.trim()).filter(Boolean),
      };
      const response = await fetch(editingId ? `/api/properties/${editingId}` : '/api/properties', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save property');
      setNotice({ text: published ? 'Property published successfully.' : 'Property draft saved.' });
      reset();
      await loadProperties();
    } catch (error) {
      console.error(error);
      setNotice({ text: error instanceof Error ? error.message : 'Unable to save property.', error: true });
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this property advert permanently?')) return;
    try {
      const response = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to delete property');
      setNotice({ text: 'Property advert deleted.' });
      await loadProperties();
    } catch (error) { console.error(error); setNotice({ text: 'Unable to delete property.', error: true }); }
  };

  const toggle = async (property: any, field: 'published' | 'featured') => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: !property[field] }) });
      if (!response.ok) throw new Error('Unable to update property');
      await loadProperties();
    } catch (error) { console.error(error); setNotice({ text: 'Unable to update property.', error: true }); }
  };

  const inputClass = 'mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gold';
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-8">
        <div><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center"><Building2 className="w-5 h-5" /></div><h3 className="font-serif text-2xl font-bold text-navy">Property Advertisements</h3></div><p className="text-sm text-gray-500">Manage sale, rental, and lease adverts from one secure workspace.</p></div>
        {notice && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${notice.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{notice.text}</div>}
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 mb-8">
        <div className="flex justify-between items-center mb-5"><h4 className="font-bold text-navy">{editingId ? 'Edit Property' : 'New Property Advert'}</h4>{editingId && <button onClick={reset} className="text-xs font-bold text-gray-500 flex items-center gap-1"><X className="w-3 h-3" /> Cancel edit</button>}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Title<input value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} placeholder="Three-bedroom family home" /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property type<select value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} className={inputClass}>{propertyTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Listing type<select value={form.listingType} onChange={(e) => update('listingType', e.target.value)} className={inputClass}>{listingTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price<input type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Currency<input value={form.currency} onChange={(e) => update('currency', e.target.value)} className={inputClass} /></label>
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Location<input value={form.location} onChange={(e) => update('location', e.target.value)} className={inputClass} placeholder="Lekki, Lagos" /></label>
          <label className="md:col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Address<input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} /></label>
          <label className="md:col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={5} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area<input type="number" min="0" value={form.area} onChange={(e) => update('area', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area unit<input value={form.areaUnit} onChange={(e) => update('areaUnit', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Land size<input type="number" min="0" value={form.landSize} onChange={(e) => update('landSize', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status<select value={form.status} onChange={(e) => update('status', e.target.value)} className={inputClass}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Cover image URL<input value={form.coverImageUrl} onChange={(e) => update('coverImageUrl', e.target.value)} className={inputClass} placeholder="https://..." /></label>
          <label className="md:col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gallery image URLs<textarea value={form.galleryImages} onChange={(e) => update('galleryImages', e.target.value)} rows={3} className={inputClass} placeholder="One URL per line" /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact name<input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact phone<input value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className={inputClass} /></label>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact email<input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className={inputClass} /></label>
        </div>
        <div className="flex flex-wrap gap-5 mt-5 text-sm font-semibold text-gray-600"><label className="flex items-center gap-2"><input type="checkbox" checked={form.furnished} onChange={(e) => update('furnished', e.target.checked)} /> Furnished</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Featured advert</label></div>
        <div className="flex flex-wrap justify-end gap-3 mt-6">{editingId && <button onClick={reset} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600">Cancel</button>}<button disabled={saving} onClick={() => save(false)} className="px-5 py-3 rounded-xl border border-navy text-sm font-bold text-navy disabled:opacity-50"><Plus className="w-4 h-4 inline mr-2" />Save Draft</button><button disabled={saving} onClick={() => save(true)} className="px-5 py-3 rounded-xl bg-navy text-white text-sm font-bold disabled:opacity-50"><CheckCircle2 className="w-4 h-4 inline mr-2" />{editingId ? 'Update & Publish' : 'Publish Property'}</button></div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-5"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadProperties()} placeholder="Search properties..." className="w-full rounded-xl border border-gray-200 px-10 py-3 text-sm outline-none focus:border-gold" /></div><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm"><option value="">All types</option>{propertyTypes.map((item) => <option key={item}>{item}</option>)}</select><select value={listingFilter} onChange={(e) => setListingFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm"><option value="">All listing types</option>{listingTypes.map((item) => <option key={item}>{item}</option>)}</select><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="border border-gray-100 rounded-2xl overflow-hidden"><div className="px-5 py-4 bg-gray-50 flex justify-between"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Property library</span><span className="text-xs text-gray-400">{properties.length} advert{properties.length === 1 ? '' : 's'}</span></div>{loading ? <div className="p-10 text-center text-sm text-gray-500">Loading property adverts...</div> : properties.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">No property adverts yet.</div> : <div className="divide-y divide-gray-100">{properties.map((property) => <div key={property.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4"><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h5 className="font-bold text-navy truncate">{property.title}</h5><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${property.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{property.published ? 'Published' : 'Draft'}</span>{property.featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gold/10 text-gold">Featured</span>}</div><p className="text-xs text-gray-500 mt-1">{property.propertyType} · {property.listingType} · {property.location} · {property.status}</p></div><div className="flex items-center gap-2"><button onClick={() => toggle(property, 'published')} className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600">{property.published ? 'Unpublish' : 'Publish'}</button><button onClick={() => toggle(property, 'featured')} className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600">{property.featured ? 'Unfeature' : 'Feature'}</button><button onClick={() => edit(property)} className="p-2 rounded-lg text-navy hover:bg-navy/5"><Pencil className="w-4 h-4" /></button><button onClick={() => remove(property.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>}</div>
    </div>
  );
}