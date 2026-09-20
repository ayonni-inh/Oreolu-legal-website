'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BedDouble, Building2, CheckCircle2, Home, Loader2, MapPin, Ruler, Search, ShowerHead, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Property = {
  id: string; slug: string; title: string; description: string; propertyType: string; listingType: string;
  price: number | null; currency: string; location: string; address?: string | null; bedrooms?: number | null;
  bathrooms?: number | null; area?: number | null; areaUnit?: string; landSize?: number | null;
  furnished: boolean; featured: boolean; status: string; coverImageUrl?: string | null; galleryImages?: string[];
  contactName?: string | null; contactPhone?: string | null; contactEmail?: string | null;
};

function money(property: Property) {
  if (property.price === null || property.price === undefined) return 'Price on enquiry';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: property.currency || 'NGN', maximumFractionDigits: 0 }).format(Number(property.price));
}

export default function Properties({ slug, onEnquire }: { slug?: string; onEnquire?: (property: Property) => void }) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ propertyType: '', listingType: '', bedrooms: '', minPrice: '', maxPrice: '' });

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filters.propertyType) params.set('propertyType', filters.propertyType);
      if (filters.listingType) params.set('listingType', filters.listingType);
    const response = await fetch(`/api/properties?${params}`);
const data = await response.json();

if (!response.ok) throw new Error();

const rawProperties = Array.isArray(data)
  ? data
  : Array.isArray(data.properties)
    ? data.properties
    : [];

let result: Property[] = rawProperties.map((item: any) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  description: item.description || '',
  propertyType: item.property_type || 'House',
  listingType: item.listing_type || 'For Sale',
  price: item.price,
  currency: item.currency || 'NGN',
  location: item.location || '',
  address: item.address || null,
  bedrooms: item.bedrooms,
  bathrooms: item.bathrooms,
  area: item.area,
  areaUnit: item.area_unit || 'sqm',
  landSize: item.land_size,
  furnished: Boolean(item.furnished),
  featured: Boolean(item.featured),
  status: item.status || 'Available',
  coverImageUrl: item.cover_image_url || null,
  galleryImages: Array.isArray(item.gallery_images)
    ? item.gallery_images
    : [],
  contactName: item.contact_name || null,
  contactPhone: item.contact_phone || null,
  contactEmail: item.contact_email || null,
}));
      if (filters.bedrooms) result = result.filter((item: Property) => Number(item.bedrooms || 0) >= Number(filters.bedrooms));
      if (filters.minPrice) result = result.filter((item: Property) => Number(item.price || 0) >= Number(filters.minPrice));
      if (filters.maxPrice) result = result.filter((item: Property) => Number(item.price || 0) <= Number(filters.maxPrice));
      setProperties(result);
    } catch { setError('Unable to load property adverts right now.'); } finally { setLoading(false); }
  };

  const loadProperty = async (propertySlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${encodeURIComponent(propertySlug)}`);
      const data = await response.json();
      if (!response.ok) throw new Error();
      setProperty(data);
    } catch { setError('This property is unavailable or is no longer published.'); } finally { setLoading(false); }
  };

  useEffect(() => { if (slug) loadProperty(slug); else loadDirectory(); }, [slug, filters.propertyType, filters.listingType, filters.bedrooms, filters.minPrice, filters.maxPrice]);

  if (slug) {
    return <div className="min-h-screen bg-gray-50 pt-28 pb-16"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><button onClick={() => router.push('/properties')} className="flex items-center gap-2 text-sm font-bold text-navy hover:text-gold mb-8"><ArrowLeft className="w-4 h-4" /> Back to Properties</button>{loading ? <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div> : error ? <div className="bg-red-50 rounded-2xl p-6 text-center text-red-700">{error}</div> : property && <article className="bg-white rounded-3xl shadow-sm overflow-hidden"><div className="grid lg:grid-cols-2 gap-0">{property.coverImageUrl ? <img src={property.coverImageUrl} alt={property.title} className="w-full h-80 lg:h-full min-h-[420px] object-cover" /> : <div className="min-h-[420px] bg-navy/5 flex items-center justify-center"><Building2 className="w-20 h-20 text-gold/50" /></div>}<div className="p-7 md:p-10"><div className="flex flex-wrap gap-2 mb-5"><span className="rounded-full bg-gold/10 text-gold px-3 py-1 text-xs font-bold uppercase">{property.listingType}</span><span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold uppercase">{property.status}</span>{property.featured && <span className="rounded-full bg-navy text-white px-3 py-1 text-xs font-bold uppercase flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}</div><h1 className="text-4xl font-serif font-bold text-navy mb-3">{property.title}</h1><p className="flex items-center gap-2 text-gray-500 mb-6"><MapPin className="w-4 h-4 text-gold" />{property.location}</p><p className="text-2xl font-bold text-navy mb-8">{money(property)}</p><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">{property.bedrooms !== null && property.bedrooms !== undefined && <div className="rounded-xl bg-gray-50 p-3"><BedDouble className="w-4 h-4 text-gold mb-2" /><p className="text-xs text-gray-500">Bedrooms</p><p className="font-bold text-navy">{property.bedrooms}</p></div>}{property.bathrooms !== null && property.bathrooms !== undefined && <div className="rounded-xl bg-gray-50 p-3"><ShowerHead className="w-4 h-4 text-gold mb-2" /><p className="text-xs text-gray-500">Bathrooms</p><p className="font-bold text-navy">{property.bathrooms}</p></div>}{property.area !== null && property.area !== undefined && <div className="rounded-xl bg-gray-50 p-3"><Ruler className="w-4 h-4 text-gold mb-2" /><p className="text-xs text-gray-500">Area</p><p className="font-bold text-navy">{property.area} {property.areaUnit}</p></div>}<div className="rounded-xl bg-gray-50 p-3"><Home className="w-4 h-4 text-gold mb-2" /><p className="text-xs text-gray-500">Type</p><p className="font-bold text-navy">{property.propertyType}</p></div></div><p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">{property.description}</p>{property.furnished && <p className="flex items-center gap-2 text-sm text-emerald-700 font-semibold mb-5"><CheckCircle2 className="w-4 h-4" /> Furnished property</p>}<button onClick={() => onEnquire?.(property)} className="w-full rounded-xl bg-navy text-white px-5 py-4 font-bold hover:bg-navy-light transition-colors">Enquire About This Property</button>{(property.contactPhone || property.contactEmail) && <div className="mt-6 text-sm text-gray-500"><p className="font-bold text-navy mb-1">{property.contactName || 'Property enquiries'}</p>{property.contactPhone && <p>{property.contactPhone}</p>}{property.contactEmail && <p>{property.contactEmail}</p>}</div>}</div></div>{(property.galleryImages || []).length > 0 && <div className="p-6 md:p-8 border-t border-gray-100"><h2 className="font-serif text-xl font-bold text-navy mb-4">Gallery</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{property.galleryImages?.map((image) => <img key={image} src={image} alt="" className="h-32 w-full rounded-xl object-cover" referrerPolicy="no-referrer" />)}</div></div>}</article>}</div></div>;
  }

  return <div className="min-h-screen bg-gray-50 pt-28 pb-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="mb-10"><p className="text-xs font-bold uppercase tracking-[0.25em] text-gold mb-3">OGA property desk</p><h1 className="text-4xl font-serif font-bold text-navy mb-3">Property Advertisements</h1><p className="text-lg text-gray-600 max-w-2xl">Browse verified properties available for sale, rent, and lease.</p></div><div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3"><div className="relative lg:col-span-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadDirectory()} placeholder="Search location or title" className="w-full rounded-xl border border-gray-200 px-10 py-3 text-sm outline-none focus:border-gold" /></div><select value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-3 text-sm"><option value="">All property types</option>{['House', 'Apartment', 'Duplex', 'Land', 'Office', 'Shop', 'Commercial'].map((item) => <option key={item}>{item}</option>)}</select><select value={filters.listingType} onChange={(e) => setFilters({ ...filters, listingType: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-3 text-sm"><option value="">Sale / Rent / Lease</option>{['For Sale', 'For Rent', 'For Lease'].map((item) => <option key={item}>{item}</option>)}</select><input type="number" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })} placeholder="Min bedrooms" className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gold" /><button onClick={loadDirectory} className="rounded-xl bg-navy text-white px-4 py-3 text-sm font-bold">Search</button></div>{loading ? <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div> : error ? <div className="bg-red-50 text-red-700 rounded-2xl p-6 text-center">{error}</div> : properties.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center text-gray-500">No published properties match these filters.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">{properties.map((item) => <article key={item.id} onClick={() => router.push(`/properties/${item.slug}`)} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">{item.coverImageUrl ? <img src={item.coverImageUrl} alt={item.title} className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" /> : <div className="h-52 bg-navy/5 flex items-center justify-center"><Building2 className="w-14 h-14 text-gold/50" /></div>}<div className="p-6"><div className="flex justify-between items-start gap-3 mb-3"><div><span className="text-xs font-bold text-gold uppercase tracking-wider">{item.listingType}</span><h2 className="text-xl font-serif font-bold text-navy mt-1">{item.title}</h2></div>{item.featured && <Star className="w-5 h-5 text-gold fill-gold shrink-0" />}</div><p className="flex items-center gap-1 text-sm text-gray-500 mb-4"><MapPin className="w-4 h-4" />{item.location}</p><p className="text-lg font-bold text-navy mb-5">{money(item)}</p><div className="flex flex-wrap gap-3 text-xs text-gray-500">{item.propertyType && <span>{item.propertyType}</span>}{item.bedrooms !== null && item.bedrooms !== undefined && <span>{item.bedrooms} beds</span>}{item.bathrooms !== null && item.bathrooms !== undefined && <span>{item.bathrooms} baths</span>}{item.area && <span>{item.area} {item.areaUnit}</span>}</div><div className="flex items-center gap-1 text-sm font-bold text-gold mt-6">View property <ArrowRight className="w-4 h-4" /></div></div></article>)}</div>}</div></div>;
}
