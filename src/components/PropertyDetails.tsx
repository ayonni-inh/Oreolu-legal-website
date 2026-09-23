'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Property = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  property_type?: string | null;
  listing_type?: string | null;
  price?: number | null;
  currency?: string | null;
  location?: string | null;
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  area_unit?: string | null;
  land_size?: number | null;
  furnished?: boolean | null;
  featured?: boolean | null;
  status?: string | null;
  cover_image_url?: string | null;
  gallery_images?: string[] | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  published?: boolean | null;
};

type PropertyDetailsProps = {
  id: string;
};

export default function PropertyDetails({ id }: PropertyDetailsProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/properties/${id}`, {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Property not found');
        }

        setProperty(data);

        const firstImage =
          data?.cover_image_url ||
          (Array.isArray(data?.gallery_images)
            ? data.gallery_images[0]
            : null);

        setActiveImage(firstImage || null);
      } catch (err) {
        console.error('Property details error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load this property'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-[420px] rounded-2xl bg-gray-200" />
            <div className="h-10 w-2/3 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 text-5xl">🏠</div>

          <h1 className="text-3xl font-semibold text-gray-900">
            Property not found
          </h1>

          <p className="mt-3 max-w-xl text-gray-600">
            {error || 'This property may have been removed or is no longer available.'}
          </p>

          <Link
            href="/properties"
            className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Properties
          </Link>
        </div>
      </main>
    );
  }

  const gallery = Array.from(
    new Set(
      [
        property.cover_image_url,
        ...(Array.isArray(property.gallery_images)
          ? property.gallery_images
          : []),
      ].filter(Boolean)
    )
  ) as string[];

  const formatPrice = () => {
    if (property.price === null || property.price === undefined) {
      return 'Price on request';
    }

    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: property.currency || 'NGN',
        maximumFractionDigits: 0,
      }).format(property.price);
    } catch {
      return `${property.currency || 'NGN'} ${property.price.toLocaleString()}`;
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        {/* Back navigation */}
        <div className="mb-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
          >
            <span aria-hidden="true">←</span>
            Back to Properties
          </Link>
        </div>

        {/* Image gallery */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          {activeImage ? (
            <div className="relative h-[320px] w-full bg-gray-100 sm:h-[450px] lg:h-[560px]">
              <img
                src={activeImage}
                alt={property.title}
                className="h-full w-full object-cover"
              />

              {property.featured && (
                <div className="absolute left-5 top-5 rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                  Featured
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-gray-400 sm:h-[450px] lg:h-[560px]">
              <div className="text-center">
                <div className="mb-3 text-5xl">🏠</div>
                <p>No property images available</p>
              </div>
            </div>
          )}
        </section>

        {/* Gallery thumbnails */}
        {gallery.length > 1 && (
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                  activeImage === image
                    ? 'border-black'
                    : 'border-transparent'
                }`}
                aria-label={`View property image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main information */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {property.property_type && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                  {property.property_type}
                </span>
              )}

              {property.listing_type && (
                <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {property.listing_type}
                </span>
              )}

              {property.status && (
                <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {property.status}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {property.title}
            </h1>

            {property.location && (
              <p className="mt-4 flex items-center gap-2 text-gray-600">
                <span aria-hidden="true">📍</span>
                {property.location}
              </p>
            )}

            {property.address && (
              <p className="mt-1 text-sm text-gray-500">
                {property.address}
              </p>
            )}

            {/* Property facts */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {property.bedrooms !== null &&
                property.bedrooms !== undefined && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-2xl font-semibold">
                      {property.bedrooms}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Bedrooms</p>
                  </div>
                )}

              {property.bathrooms !== null &&
                property.bathrooms !== undefined && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-2xl font-semibold">
                      {property.bathrooms}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">Bathrooms</p>
                  </div>
                )}

              {property.area !== null && property.area !== undefined && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-2xl font-semibold">
                    {property.area.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {property.area_unit || 'sqm'}
                  </p>
                </div>
              )}

              {property.land_size !== null &&
                property.land_size !== undefined && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-2xl font-semibold">
                      {property.land_size.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Land size
                    </p>
                  </div>
                )}
            </div>

            {/* Description */}
            {property.description && (
              <section className="mt-12">
                <h2 className="text-2xl font-semibold">About this property</h2>

                <div className="mt-5 whitespace-pre-line leading-8 text-gray-600">
                  {property.description}
                </div>
              </section>
            )}

            {/* Additional details */}
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Property details</h2>

              <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {property.property_type && (
                  <div className="flex justify-between gap-6 py-4">
                    <span className="text-gray-500">Property type</span>
                    <span className="font-medium">
                      {property.property_type}
                    </span>
                  </div>
                )}

                {property.listing_type && (
                  <div className="flex justify-between gap-6 py-4">
                    <span className="text-gray-500">Listing type</span>
                    <span className="font-medium">
                      {property.listing_type}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-6 py-4">
                  <span className="text-gray-500">Furnished</span>
                  <span className="font-medium">
                    {property.furnished ? 'Yes' : 'No'}
                  </span>
                </div>

                {property.status && (
                  <div className="flex justify-between gap-6 py-4">
                    <span className="text-gray-500">Availability</span>
                    <span className="font-medium">
                      {property.status}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Contact / price card */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Asking price
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {formatPrice()}
              </p>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold">
                  Interested in this property?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Contact our office for availability, viewing arrangements,
                  documentation and further information.
                </p>

                <div className="mt-6 space-y-3">
  {property.contact_phone && (
    <a
      href={`tel:${property.contact_phone}`}
      className="block rounded-full bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
    >
      Call {property.contact_name || 'our office'}
    </a>
  )}

  {property.contact_phone && (
    <a
      href={`https://wa.me/${property.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hello, I am interested in "${property.title}". I would like to know more about this property.`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-full bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700"
    >
      WhatsApp Enquiry
    </a>
  )}

  {property.contact_email && (
    <a
      href={`mailto:${property.contact_email}?subject=${encodeURIComponent(
        `Property enquiry: ${property.title}`
      )}`}
      className="block rounded-full border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
    >
      Send an Email
    </a>
  )}
</div>

                {property.contact_name && (
                  <p className="mt-6 text-center text-xs text-gray-500">
                    Contact: {property.contact_name}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}