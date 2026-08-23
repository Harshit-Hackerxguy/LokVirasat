import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Map,
  MapPin,
  Compass,
  Info,
  User,
  Users,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lok-Virasat — Cultural Heritage Mapping",
  description:
    "Discover, map, and preserve India's cultural heritage sites. Interactive 3D map, condition reporting, and oral history recording.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <div className="layout-container">

          <header className="header">
            <div className="header-content">

              <Link
                href="/"
                className="logo-container"
              >
                <MapPin size={28} />
                <span>Lok-Virasat</span>
              </Link>

              <nav className="nav-links">

                {/* Home */}
                <Link
                  href="/"
                  className="nav-link"
                >
                  <Compass size={20} />
                  <span>Home</span>
                </Link>

                {/* Map */}
                <Link
                  href="/map"
                  className="nav-link"
                >
                  <Map size={20} />
                  <span>Map</span>
                </Link>

                {/* About */}
                <Link
                  href="/about"
                  className="nav-link"
                >
                  <Info size={20} />
                  <span>About</span>
                </Link>

                {/* Contributor */}
                <Link
                  href="/contributor"
                  className="nav-link"
                >
                  <Users size={20} />
                  <span>Contributor</span>
                </Link>

                {/* Verification / Moderator */}
                <Link
                  href="/verification"
                  className="nav-link"
                >
                  <ShieldCheck size={20} />
                  <span>Verification</span>
                </Link>

                {/* Login */}
                <Link
                  href="/login"
                  className="nav-link bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <User size={18} />
                  <span>Login / Sign Up</span>
                </Link>

              </nav>
            </div>
          </header>

          <main className="main-content">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}