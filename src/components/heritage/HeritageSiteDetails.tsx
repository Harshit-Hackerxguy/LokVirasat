'use client';

import { useState } from 'react';
import {
  X,
  MapPin,
  Download,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Calendar,
} from 'lucide-react';

import { HeritageSite } from '@/types';

interface HeritageSiteDetailsProps {
  site: HeritageSite | null;
  onClose: () => void;
  onReportCondition?: () => void;
}

export default function HeritageSiteDetails({
  site,
  onClose,
  onReportCondition,
}: HeritageSiteDetailsProps) {
  const [imgIndex, setImgIndex] = useState(0);

  if (!site) return null;

  const images = site.images ?? [];
  const hasImages = images.length > 0;

  const prevImage = () =>
    setImgIndex((i) =>
      i === 0 ? images.length - 1 : i - 1
    );

  const nextImage = () =>
    setImgIndex((i) =>
      i === images.length - 1 ? 0 : i + 1
    );

  const verificationLabel =
    site.verificationStatus
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  const verificationColor: Record<string, string> = {
    Reported: 'bg-yellow-100 text-yellow-700',
    'Community Verified': 'bg-blue-100 text-blue-700',
    'Authority Verified': 'bg-green-100 text-green-700',
  };

  const categoryColor: Record<string, string> = {
    Monument: 'bg-orange-100 text-orange-700',
    'Sacred Grove': 'bg-green-100 text-green-700',
    'Folklore Site': 'bg-purple-100 text-purple-700',
    'Ancient Ruins': 'bg-yellow-100 text-yellow-700',
    'Traditional Craft Hub': 'bg-pink-100 text-pink-700',
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ── Image Gallery ── */}
        <div className="relative h-64 bg-gray-100 overflow-hidden rounded-t-2xl">
          {hasImages ? (
            <>
              <img
                src={images[imgIndex]}
                alt={`${site.name} – photo ${imgIndex + 1}`}
                className="h-full w-full object-cover transition-opacity duration-300"
              />

              {/* Navigation arrows (only if >1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          i === imgIndex
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Counter badge */}
                  <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white font-medium">
                    {imgIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400 gap-2">
              <ImageOff className="h-10 w-10" />
              <span className="text-sm">No images uploaded yet</span>
            </div>
          )}
        </div>

        {/* ── Thumbnail strip (if multiple images) ── */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-gray-50 border-b border-gray-200">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === imgIndex
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Main Content ── */}
        <div className="p-6">

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                categoryColor[site.category] ??
                'bg-gray-100 text-gray-700'
              }`}
            >
              {site.category}
            </span>

            {verificationLabel && (
              <span
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  verificationColor[verificationLabel] ??
                  'bg-gray-100 text-gray-700'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {verificationLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {site.name}
          </h2>

          {/* Coordinates + last updated */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {site.coordinates[1].toFixed(5)},{' '}
              {site.coordinates[0].toFixed(5)}
            </span>

            {site.lastUpdated && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                Last updated: {site.lastUpdated}
              </span>
            )}
          </div>

          {/* About */}
          <section className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              About this Heritage Site
            </h3>

            <p className="mt-2 leading-7 text-gray-600">
              {site.description}
            </p>
          </section>

          {/* Images count info */}
          {hasImages && (
            <section className="mt-5 rounded-xl bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900">
                📷 Photos ({images.length})
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Use the gallery above to browse all uploaded
                photographs of this heritage site.
              </p>
            </section>
          )}

          {/* Local Stories */}
          <section className="mt-6 rounded-xl bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Local Stories
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Community-recorded folklore and oral histories
              will appear here.
            </p>

            <button className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Record a Local Story
            </button>
          </section>

          {/* Visitor information */}
          <section className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Visitor Experience
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore the site's history, community stories
              and visitor information through LokVirasat.
            </p>
          </section>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
              onClick={() => {
                alert(
                  'Offline download will be connected to the offline trail system.'
                );
              }}
            >
              <Download className="h-5 w-5" />
              Download Offline
            </button>

            <button
              onClick={onReportCondition}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-5 w-5" />
              Report Condition
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}