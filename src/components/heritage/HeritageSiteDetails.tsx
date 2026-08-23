'use client';

import {
  X,
  MapPin,
  Download,
  AlertTriangle,
  CheckCircle,
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
  if (!site) return null;

  const verificationLabel =
    site.verificationStatus
      ?.replace('-', ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Image / Header */}
        <div className="relative">
          <div className="h-52 bg-gray-200 flex items-center justify-center">
            {site.images &&
            site.images.length > 0 ? (
              <img
                src={site.images[0]}
                alt={site.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">
                  🏛️
                </div>
                <span>
                  Heritage Site
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6">

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
              {site.category}
            </span>

            {verificationLabel && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle className="h-4 w-4" />
                {verificationLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {site.name}
          </h2>

          {/* Coordinates */}
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />

            <span>
              {site.coordinates[1].toFixed(4)},
              {' '}
              {site.coordinates[0].toFixed(4)}
            </span>
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

          {/* Local Stories */}
          <section className="mt-6 rounded-xl bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">
              Local Stories
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Community-recorded folklore and
              oral histories will appear here.
            </p>

            <button className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Record a Local Story
            </button>
          </section>

          {/* Visitor information */}
          <section className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Visitor Experience
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Explore the site's history, community
              stories and visitor information through
              LokVirasat.
            </p>
          </section>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
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
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              <AlertTriangle className="h-5 w-5" />
              Report Condition
            </button>

          </div>

          {/* Last updated */}
          {site.lastUpdated && (
            <p className="mt-4 text-xs text-gray-400">
              Last updated: {site.lastUpdated}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}