'use client';

import { useState } from 'react';
import {
  X,
  MapPin,
  Camera,
  Mic,
  CheckCircle,
  Upload,
} from 'lucide-react';

import { HeritageCategory, HeritageLead } from '@/types';

interface HeritageLeadModalProps {
  lead: HeritageLead | null;
  onClose: () => void;
  onSubmit: (lead: HeritageLead) => void;
}

export default function HeritageLeadModal({
  lead,
  onClose,
  onSubmit,
}: HeritageLeadModalProps) {
  const [siteName, setSiteName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<HeritageCategory | ''>('');
  const [history, setHistory] = useState('');
  const [locationVerified, setLocationVerified] =
    useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!lead) return null;

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    setPhotos(
      Array.from(event.target.files)
    );
  };

  const handleSubmit = () => {
    if (!siteName.trim()) {
      alert('Please enter the heritage site name.');
      return;
    }

    if (!category) {
      alert('Please select a heritage category.');
      return;
    }

    if (!description.trim()) {
      alert('Please provide a description.');
      return;
    }

    if (!locationVerified) {
      alert('Please verify the site location.');
      return;
    }

    setSubmitted(true);

    // Prototype submission
    onSubmit({
      ...lead,
      name: siteName,
      category,
      description,
      status: 'documented',
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-4">

      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Document Heritage Site
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Help turn this community-reported lead
              into a documented heritage site.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6">

          {/* Lead information */}
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {lead.name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {lead.villageOrArea}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Reported by {lead.submittedBy}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {lead.description}
            </p>
          </div>

          {/* Site name */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Heritage Site Name
            </label>

            <input
              type="text"
              value={siteName}
              onChange={(e) =>
                setSiteName(e.target.value)
              }
              placeholder={lead.name}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Heritage Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as HeritageCategory
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select category
              </option>

              <option value={HeritageCategory.Monument}>
                Monument
              </option>

              <option value={HeritageCategory.SacredGrove}>
                Sacred Grove
              </option>

              <option value={HeritageCategory.FolkloreSite}>
                Folklore Site
              </option>

              <option value={HeritageCategory.AncientRuins}>
                Ancient Ruins
              </option>

              <option value={HeritageCategory.TraditionalCraftHub}>
                Traditional Craft Hub
              </option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Site Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe the site's appearance, significance, architecture, traditions, or other useful information."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Historical information */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Historical / Cultural Information
            </label>

            <textarea
              value={history}
              onChange={(e) =>
                setHistory(e.target.value)
              }
              placeholder="Add information collected from local residents, historians, community members, or available records."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Photos */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Site Photographs
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50">

              <Camera className="h-8 w-8 text-gray-400" />

              <span className="mt-2 text-sm font-semibold text-gray-700">
                Upload photographs
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Add photographs of the site,
                structure, surroundings, or artifacts.
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {photos.length} photograph
                {photos.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* GPS */}
          <div className="mb-5 rounded-xl border border-gray-200 p-4">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Location Verification
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Confirm that you are physically near
                  the heritage site while documenting it.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setLocationVerified(true)
                  }
                  className={`mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${
                    locationVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {locationVerified ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Location Verified
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Verify My Location
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Oral story */}
          <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50 p-4">

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                <Mic className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Local Story / Oral History
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Record folklore, stories, traditions,
                  or historical accounts shared by local
                  community members.
                </p>

                <button
                  type="button"
                  className="mt-3 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100"
                  onClick={() => {
                    alert(
                      'StoryRecorder will be connected here next.'
                    );
                  }}
                >
                  Record Local Story
                </button>
              </div>
            </div>

          </div>

          {/* Submission result */}
          {submitted && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-700">

              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Documentation submitted
                </p>

                <p className="mt-1 text-sm">
                  The contribution is now ready for
                  verification and moderation.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {submitted
              ? 'Submitted'
              : 'Submit for Verification'}
          </button>

        </div>

      </div>
    </div>
  );
}