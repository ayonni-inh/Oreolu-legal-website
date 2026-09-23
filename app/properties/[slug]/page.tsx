import type { Metadata } from 'next';
import PropertyDetails from '@/src/components/PropertyDetails';

type PropertyPageProps = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Property Details | OROELU GODWIN AGIDI & CO`,
    description:
      'View property details, images, pricing and contact information.',
    alternates: {
      canonical: `/properties/${slug}`,
    },
  };
}

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { slug } = await params;

  return <PropertyDetails id={slug} />;
}