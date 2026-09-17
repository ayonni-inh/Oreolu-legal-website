import type { Metadata } from "next";
import Portal from "@/app/components/Portal";

export const metadata: Metadata = {
  title: "Blog & Legal News | OROELU GODWIN AGIDI & CO",
  description: "Original legal insights and updates from OROELU GODWIN AGIDI & CO.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog & Legal News | OROELU GODWIN AGIDI & CO",
    description: "Original legal insights and updates from OROELU GODWIN AGIDI & CO.",
    type: "website",
  },
};

export default function BlogPage() {
  return <Portal />;
}