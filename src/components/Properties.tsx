'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Home,
  Loader2,
  MapPin,
  Ruler,
  Search,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number | null;
  currency: string;
  location: string;
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  areaUnit?: string;
  landSize?: number | null;
  furnished: boolean;
  featured: boolean;
  status: string;
  coverImageUrl?: string | null;
  galleryImages?: string[];
};

function formatPrice(property: Property) {
  if (property.price === null || property.price === undefined) {
    return 'Price on enquiry';
  }

  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: property.currency || 'NGN',
      maximumFractionDigits: 0,
    }).format(Number(property.price));
  } catch {
    return `${property.currency || 'NGN'} ${Number(property.price).toLocaleString()}`;
  }
}

export default function Properties() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (propertyType) {
        params.set('propertyType', propertyType);
      }

      if (listingType) {
        params.set('listingType', listingType);
      }

      const response = await fetch(
        `/api/properties?${params.toString()}`,
        { cache: 'no-store' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load properties');
      }

      const rawProperties = Array.isArray(data)
        ? data
        : Array.isArray(data.properties)
          ? data.properties
          : [];

      const normalized: Property[] = rawProperties.map((item: any) => ({
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
      }));

      setProperties(normalized);
    } catch (err) {
      console.error('Properties load error:', err);
      setError('Unable to load property adverts right now.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [propertyType, listingType]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadProperties();
  };

  return (
    <section className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="max-w-3xl mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-3">
            Property Advertisements
          </p>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy dark:text-white">
            Find Your Next Property
          </h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
            Browse property advertisements available for sale, rent and lease
            through OROELU GODWIN AGIDI &amp; CO.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            <div className="relative md:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search location or property..."
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 outline-none"
            >
              <option value="">All property types</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Flat">Flat</option>
              <option value="Duplex">Duplex</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
              <option value="Office">Office</option>
            </select>

            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 outline-none"
            >
              <option value="">Sale / Rent / Lease</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
              <option value="For Lease">For Lease</option>
            </select>

          </div>

          <button
            type="submit"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-navy text-white px-6 py-3 font-semibold hover:opacity-90 transition"
          >
            Search Properties
            <Search size={17} />
          </button>
        </form>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4" size={30} />
            <p>Loading properties...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-600 mb-4">{error}</p>

            <button
              onClick={loadProperties}
              className="rounded-lg bg-navy text-white px-5 py-2"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl">
            <Home className="mx-auto mb-4 text-gray-400" size={40} />

            <h2 className="text-2xl font-serif font-semibold text-navy dark:text-white">
              No properties found
            </h2>

            <p className="mt-2 text-gray-500">
              Check back soon for new property advertisements.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500">
                {properties.length}{' '}
                {properties.length === 1 ? 'property' : 'properties'} available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-800">

                    {property.coverImageUrl ? (
                      <img
                        src={property.coverImageUrl}
                        alt={property.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2
                          size={50}
                          className="text-gray-300 dark:text-slate-600"
                        />
                      </div>
                    )}

                    {property.featured && (
                      <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">
                        <Star size={12} fill="currentColor" />
                        Featured
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 rounded-lg bg-navy/90 text-white px-3 py-1.5 text-xs font-semibold">
                      {property.listingType}
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-gold font-semibold mb-1">
                      {property.propertyType}
                    </p>

                    <h2 className="text-xl font-serif font-bold text-navy dark:text-white line-clamp-2">
                      {property.title}
                    </h2>

                    {property.location && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <MapPin size={15} />
                        <span className="line-clamp-1">
                          {property.location}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 text-xl font-bold text-navy dark:text-white">
                      {formatPrice(property)}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                      {property.bedrooms !== null &&
                        property.bedrooms !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <BedDouble size={16} />
                            {property.bedrooms} bed
                          </span>
                        )}

                      {property.bathrooms !== null &&
                        property.bathrooms !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <Bath size={16} />
                            {property.bathrooms} bath
                          </span>
                        )}

                      {property.area !== null &&
                        property.area !== undefined && (
                          <span className="flex items-center gap-1.5">
                            <Ruler size={16} />
                            {property.area} {property.areaUnit || 'sqm'}
                          </span>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/properties/${property.slug}`)
                      }
                      className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-navy dark:border-gold text-navy dark:text-gold px-4 py-3 font-semibold hover:bg-navy hover:text-white dark:hover:bg-gold dark:hover:text-navy transition"
                    >
                      View Property
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
