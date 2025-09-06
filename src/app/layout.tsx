import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenant Screening App",
  description: "Modern tenant screening application for property managers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-primary-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Tenant Screening App</h1>
          </div>
        </header>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2025 Tenant Screening App. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
