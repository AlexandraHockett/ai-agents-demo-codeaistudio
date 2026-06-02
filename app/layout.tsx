import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Agents Demo · Code AI Studio',
  description:
    'Production-grade AI agents: generate social content, get strategic advice, research any topic, and write SEO articles — all powered by Claude.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased min-h-screen">{children}</body>
    </html>
  );
}
