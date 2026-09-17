import type { Metadata } from "next";
import Portal from "@/app/components/Portal";

export const metadata: Metadata = {
  title: "Property Advertisements | OROELU GODWIN AGIDI & CO",
  description: "Browse property adverts available for sale, rent, and lease through OGA Solicitors.",
  alternates: { canonical: "/properties" },
  openGraph: {
    title: "Property Advertisements | OROELU GODWIN AGIDI & CO",
    description: "Browse property adverts available for sale, rent, and lease through OGA Solicitors.",
  },
};

export default function PropertiesPage() {
  return <Portal />;
}