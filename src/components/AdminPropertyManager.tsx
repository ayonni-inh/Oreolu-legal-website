'use client';


import { useEffect, useMemo, useState } from 'react';



type Property = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  property_type: string;
  listing_type: string;
  price: number | null;
  currency: string;
  location: string | null;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string | null;
  land_size: number | null;
  furnished: boolean;
  featured: boolean;
  status: string;
  cover_image_url: string | null;
  gallery_images: string[];
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type PropertyForm = {
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: string;
  currency: string;
  location: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  areaUnit: string;
  landSize: string;
  furnished: boolean;
  featured: boolean;
  status: string;
  coverImageUrl: string;
  galleryImages: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  published: boolean;
};

const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Duplex',
  'Land',
  'Office',
  'Shop',
  'Warehouse',
  'Commercial',
  'Other',
];

const LISTING_TYPES = ['For Sale', 'For Rent', 'For Lease'];

const STATUSES = [
  'Available',
  'Reserved',
  'Sold',
  'Rented',
  'Leased',
  'Off Market',
];

const emptyForm: PropertyForm = {
  title: '',
  slug: '',
  description: '',
  propertyType: 'House',
  listingType: 'For Sale',
  price: '',
  currency: 'NGN',
  location: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  areaUnit: 'sqm',
  landSize: '',
  furnished: false,
  featured: false,
  status: 'Available',
  coverImageUrl: '',
  galleryImages: [],
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  published: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminPropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(editingId);

  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      ),
    [properties]
  );

  async function loadProperties() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/properties');

      if (!response.ok) {
        throw new Error('Failed to load properties');
      }

      const data = await response.json();
      setProperties(
  Array.isArray(data)
    ? data
    : Array.isArray(data.properties)
      ? data.properties
      : []
);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load properties'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  function updateField<K extends keyof PropertyForm>(
    field: K,
    value: PropertyForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setCoverPreview(null);
    setGalleryPreviews([]);
    setError('');
  }

  function startEditing(property: Property) {
    setEditingId(property.id);

    setForm({
      title: property.title || '',
      slug: property.slug || '',
      description: property.description || '',
      propertyType: property.property_type || 'House',
      listingType: property.listing_type || 'For Sale',
      price:
        property.price !== null && property.price !== undefined
          ? String(property.price)
          : '',
      currency: property.currency || 'NGN',
      location: property.location || '',
      address: property.address || '',
      bedrooms:
        property.bedrooms !== null && property.bedrooms !== undefined
          ? String(property.bedrooms)
          : '',
      bathrooms:
        property.bathrooms !== null && property.bathrooms !== undefined
          ? String(property.bathrooms)
          : '',
      area:
        property.area !== null && property.area !== undefined
          ? String(property.area)
          : '',
      areaUnit: property.area_unit || 'sqm',
      landSize:
        property.land_size !== null && property.land_size !== undefined
          ? String(property.land_size)
          : '',
      furnished: Boolean(property.furnished),
      featured: Boolean(property.featured),
      status: property.status || 'Available',
      coverImageUrl: property.cover_image_url || '',
      galleryImages: Array.isArray(property.gallery_images)
        ? property.gallery_images
        : [],
      contactName: property.contact_name || '',
      contactPhone: property.contact_phone || '',
      contactEmail: property.contact_email || '',
      published: Boolean(property.published),
    });

    setCoverPreview(property.cover_image_url || null);
    setGalleryPreviews(
      Array.isArray(property.gallery_images) ? property.gallery_images : []
    );

    setSuccess('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        editingId || current.slug
          ? current.slug
          : slugify(value),
    }));
  }

    async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/properties/images', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      console.error('Property image upload response:', {
        status: response.status,
        data,
      });

      throw new Error(
        data.error || `Image upload failed (${response.status})`
      );
    }

    return data.url as string;
  }


async function handleCoverUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    setUploading(true);
    setError('');

    // Show the image immediately while uploading
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);

    // Upload to Supabase Storage
    const url = await uploadImage(file);

    // Persist the uploaded URL in the form state
    setForm((current) => ({
      ...current,
      coverImageUrl: url,
    }));

    // Replace temporary preview with permanent Supabase URL
    setCoverPreview(url);

    // Clean up the temporary object URL
    URL.revokeObjectURL(preview);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Cover image upload failed'
    );

    setCoverPreview(form.coverImageUrl || null);
  } finally {
    setUploading(false);
    event.target.value = '';
  }
}

async function handleGalleryUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = Array.from(event.target.files || []);

  if (!files.length) return;

  try {
    setUploading(true);
    setError('');

    const previews = files.map((file) => URL.createObjectURL(file));

    setGalleryPreviews((current) => [...current, ...previews]);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const url = await uploadImage(file);
      uploadedUrls.push(url);
    }

    setForm((current) => ({
      ...current,
      galleryImages: [...current.galleryImages, ...uploadedUrls],
    }));

    setGalleryPreviews((current) => {
      const existingCount = current.length - previews.length;

      return [
        ...current.slice(0, existingCount),
        ...uploadedUrls,
      ];
    });
  } catch (err) {
    setError(
      err instanceof Error ? err.message : 'Gallery upload failed'
    );
  } finally {
    setUploading(false);
    event.target.value = '';
  }
}

function removeGalleryImage(index: number) {
  setForm((current) => ({
    ...current,
    galleryImages: current.galleryImages.filter(
      (_, imageIndex) => imageIndex !== index
    ),
  }));

  setGalleryPreviews((current) =>
    current.filter((_, imageIndex) => imageIndex !== index)
  );
}


  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: form.price,
        currency: form.currency,
        location: form.location,
        address: form.address,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area: form.area,
        areaUnit: form.areaUnit,
        landSize: form.landSize,
        furnished: form.furnished,
        featured: form.featured,
        status: form.status,
        coverImageUrl: form.coverImageUrl,
        galleryImages: form.galleryImages,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        published: form.published,
      };

      const response = await fetch(
        editingId
          ? `/api/properties/${editingId}`
          : '/api/properties',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save property');
      }

      setSuccess(
        editingId
          ? 'Property updated successfully.'
          : 'Property created successfully.'
      );

      resetForm();
      await loadProperties();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save property'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this property?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete property');
      }

      setSuccess('Property deleted successfully.');
      await loadProperties();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete property'
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          Property Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add and manage property listings, images, pricing and
          publication status.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Property' : 'Add Property'}
            </h3>

            <p className="text-sm text-gray-500">
              Fill in the property information below.
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">
              Property Title *
            </span>

            <input
              required
              value={form.title}
              onChange={(event) =>
                handleTitleChange(event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="4 Bedroom Luxury Duplex"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Slug *
            </span>

            <input
              required
              value={form.slug}
              onChange={(event) =>
                updateField('slug', slugify(event.target.value))
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="4-bedroom-luxury-duplex"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Property Type
            </span>

            <select
              value={form.propertyType}
              onChange={(event) =>
                updateField('propertyType', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Listing Type
            </span>

            <select
              value={form.listingType}
              onChange={(event) =>
                updateField('listingType', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {LISTING_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Price
            </span>

            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                updateField('price', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="150000000"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Currency
            </span>

            <select
              value={form.currency}
              onChange={(event) =>
                updateField('currency', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Location
            </span>

            <input
              value={form.location}
              onChange={(event) =>
                updateField('location', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Lekki Phase 1, Lagos"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Address
            </span>

            <input
              value={form.address}
              onChange={(event) =>
                updateField('address', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Full property address"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Bedrooms
            </span>

            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(event) =>
                updateField('bedrooms', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Bathrooms
            </span>

            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(event) =>
                updateField('bathrooms', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Area
            </span>

            <input
              type="number"
              min="0"
              value={form.area}
              onChange={(event) =>
                updateField('area', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
              placeholder="350"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Area Unit
            </span>

            <select
              value={form.areaUnit}
              onChange={(event) =>
                updateField('areaUnit', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="sqm">sqm</option>
              <option value="sqft">sqft</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Land Size
            </span>

            <input
              type="number"
              min="0"
              value={form.landSize}
              onChange={(event) =>
                updateField('landSize', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Status
            </span>

            <select
              value={form.status}
              onChange={(event) =>
                updateField('status', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">
            Description
          </span>

          <textarea

            rows={5}
            value={form.description}
            onChange={(event) =>
              updateField('description', event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Describe the property..."
          />
        </label>

        <div className="space-y-3">
  <div>
    <h3 className="text-sm font-semibold text-gray-900">
      Cover Image
    </h3>
    <p className="text-sm text-gray-500">
      Upload the main image for this listing.
    </p>
  </div>

  <div className="space-y-3">
    {coverPreview ? (
      <div className="relative overflow-hidden rounded-lg border">
        <img
          src={coverPreview}
          alt="Cover preview"
          className="h-56 w-full object-cover"
        />

        <label className="absolute bottom-3 right-3 cursor-pointer rounded-md bg-black/75 px-3 py-2 text-sm font-medium text-white hover:bg-black">
          {uploading ? 'Uploading...' : 'Change image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={uploading}
          />
        </label>
      </div>
    ) : (
      <label className="flex min-h-56 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:bg-gray-50">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleCoverUpload}
          disabled={uploading}
        />

        <span className="text-sm text-gray-600">
          {uploading
            ? 'Uploading...'
            : 'Click to choose cover image'}
        </span>
      </label>
    )}
  </div>
</div>

<div className="space-y-3">
  <div>
    <h4 className="font-medium">Gallery Images</h4>
    <p className="text-xs text-gray-500">
      Upload multiple property images.
    </p>
  </div>

  <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-6 text-center">
    <input
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp,image/gif"
      className="hidden"
      onChange={handleGalleryUpload}
      disabled={uploading}
    />

    <span className="text-sm text-gray-600">
      {uploading
        ? 'Uploading...'
        : 'Click to choose gallery images'}
    </span>
  </label>

  {galleryPreviews.length > 0 && (
    <div className="grid grid-cols-2 gap-3">
      {galleryPreviews.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative overflow-hidden rounded-lg border"
        >
          <img
            src={image}
            alt={`Gallery ${index + 1}`}
            className="h-32 w-full object-cover"
          />

          <button
            type="button"
            onClick={() => removeGalleryImage(index)}
            className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">
              Contact Name
            </span>

            <input
              value={form.contactName}
              onChange={(event) =>
                updateField('contactName', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Contact Phone
            </span>

            <input
              value={form.contactPhone}
              onChange={(event) =>
                updateField('contactPhone', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">
              Contact Email
            </span>

            <input
              type="email"
              value={form.contactEmail}
              onChange={(event) =>
                updateField('contactEmail', event.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.furnished}
              onChange={(event) =>
                updateField('furnished', event.target.checked)
              }
            />
            <span className="text-sm">Furnished</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                updateField('featured', event.target.checked)
              }
            />
            <span className="text-sm">Featured</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) =>
                updateField('published', event.target.checked)
              }
            />
            <span className="text-sm">Published</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : isEditing
                ? 'Update Property'
                : 'Add Property'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border px-5 py-2.5 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            Existing Properties
          </h3>

          <p className="text-sm text-gray-500">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            Loading properties...
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
            No properties have been added yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedProperties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                {property.cover_image_url ? (
                  <img
                    src={property.cover_image_url}
                    alt={property.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-sm text-gray-500">
                    No image
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">
                        {property.title}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {property.location || 'Location not specified'}
                      </p>
                    </div>

                    {property.featured && (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {property.property_type}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {property.listing_type}
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {property.status}
                    </span>

                    {property.published && (
                      <span className="rounded-full bg-green-100 px-2 py-1">
                        Published
                      </span>
                    )}
                  </div>

                  {property.price !== null && (
                    <p className="font-semibold">
                      {property.currency}{' '}
                      {Number(property.price).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(property)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(property.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}





