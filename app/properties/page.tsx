import type { Metadata } from 'next';
import Portal from '@/app/components/Portal';

export const metadata: Metadata = {
  title: 'Property Advertisements | OROELU GODWIN AGIDI & CO',
  description:
    'Browse property advertisements available for sale, rent, and lease through OROELU GODWIN AGIDI & CO.',
  alternates: {
    canonical: '/properties',
  },
};

export default function PropertiesPage() {
  return <Portal />;
}
