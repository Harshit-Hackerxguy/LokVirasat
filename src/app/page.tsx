'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import { MapPin, Mountain, Landmark, BookOpen, Palette, ArrowRight, Compass, Shield, Mic } from 'lucide-react';

import { HERITAGE_SITES } from '@/data/heritageSites';
import { HeritageCategory } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: HeritageCategory }) {
  switch (category) {
    case HeritageCategory.Monument:
      return <Landmark size={18} />;

    case HeritageCategory.SacredGrove:
      return <Mountain size={18} />;

    case HeritageCategory.FolkloreSite:
      return <BookOpen size={18} />;

    case HeritageCategory.AncientRuins:
      return <Landmark size={18} />;

    case HeritageCategory.TraditionalCraftHub:
      return <Palette size={18} />;

    default:
      return <MapPin size={18} />;
  }
}

// ─── Animated Section Wrapper ───────────────────────────────────────────────

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

// ─── Features Data ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Compass size={28} />,
    title: 'Interactive 3D Map',
    description:
      'Explore heritage sites on a cinematic dark map with fly-to animations, pitch, and bearing controls.',
  },
  {
    icon: <Shield size={28} />,
    title: 'Condition Reporting',
    description:
      'Report damage, cleanliness issues, or infrastructure problems with geotagged photo verification.',
  },
  {
    icon: <Mic size={28} />,
    title: 'Oral Histories',
    description:
      'Record and preserve oral stories and traditions associated with each heritage site.',
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="home-page">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        className="hero-section"
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
      >
        {/* Animated gradient orbs (pure CSS, no WebGL) */}
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-badge-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <MapPin size={14} />
            <span>Cultural Heritage Platform</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Discover India&apos;s
            <br />
            <span className="hero-title-accent">Living Heritage</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Map, preserve, and celebrate the rich cultural tapestry of India —
            from ancient monuments to living traditions passed down through
            generations.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link href="/map" className="btn-hero-primary">
              <Compass size={20} />
              <span>Explore the Map</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="hero-scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="scroll-line-animated" />
            <span>Scroll to discover</span>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="features-section">
        <div className="section-header">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">Built for Heritage Preservation</h2>
          <p className="section-subtitle">
            A comprehensive toolkit designed to document, monitor, and celebrate
            India&apos;s cultural heritage sites.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════
          HERITAGE SHOWCASE SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="showcase-section">
        <div className="section-header">
          <span className="section-label">Heritage Sites</span>
          <h2 className="section-title">Stories Carved in Stone</h2>
          <p className="section-subtitle">
            Explore iconic sites across India — each one a chapter in the
            country&apos;s living history.
          </p>
        </div>

        <div className="showcase-grid">
          {HERITAGE_SITES.map((site, i) => (
            <motion.div
              key={site.id}
              className="showcase-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: i * 0.12,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="showcase-card-number">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="showcase-card-content">
                <div className="showcase-card-category">
                  <CategoryIcon category={site.category} />
                  <span>{site.category}</span>
                </div>
                <h3 className="showcase-card-title">{site.name}</h3>
                <p className="showcase-card-description">{site.description}</p>
                <div className="showcase-card-coords">
                  <MapPin size={14} />
                  <span>
                    {site.coordinates[1].toFixed(4)}°N,{' '}
                    {site.coordinates[0].toFixed(4)}°E
                  </span>
                </div>
                <Link href="/map" className="showcase-card-link">
                  View on Map <ArrowRight size={14} />
                </Link>
              </div>
              {/* Decorative accent */}
              <div className="showcase-card-accent" />
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <AnimatedSection className="cta-section">
        <div className="cta-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="cta-content">
          <h2 className="cta-title">Every Site Tells a Story</h2>
          <p className="cta-subtitle">
            Help us preserve India&apos;s cultural heritage. Report conditions,
            share discoveries, and keep these stories alive for generations to
            come.
          </p>
          <Link href="/map" className="btn-hero-primary">
            <Compass size={20} />
            <span>Start Exploring</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
