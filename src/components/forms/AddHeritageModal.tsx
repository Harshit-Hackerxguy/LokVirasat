'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Image as ImageIcon, X, Loader2, UploadCloud } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import { heritageSchema, HeritageFormValues } from '@/utils/validations/heritage';
import { HeritageCategory } from '@/types';

export default function AddHeritageModal() {
  const isModalOpen = useMapStore(state => state.isModalOpen);
  const setModalOpen = useMapStore(state => state.setModalOpen);
  const setPinningMode = useMapStore(state => state.setPinningMode);
  const draftLocation = useMapStore(state => state.selectedDraftLocation);
  
  const [isLocating, setIsLocating] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<HeritageFormValues>({
    resolver: zodResolver(heritageSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
    }
  });

  useEffect(() => {
    if (draftLocation) {
      setValue('coordinates', draftLocation, { shouldValidate: true });
    }
  }, [draftLocation, setValue]);

  // Clean up previews
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleUseLiveLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setValue('coordinates', coords, { shouldValidate: true });
          useMapStore.getState().setDraftLocation(coords);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please check permissions or use map pinning.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  const handlePickOnMap = () => {
    setModalOpen(false);
    setPinningMode(true);
  };

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [imageFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const combined = [...imageFiles, ...newFiles].slice(0, 5); // max 5
    setImageFiles(combined);
    setValue('images', combined, { shouldValidate: true });
    
    // Generate previews
    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...newUrls].slice(0, 5));
  };

  const removeImage = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
    setValue('images', updatedFiles, { shouldValidate: true });
    
    const updatedUrls = [...previewUrls];
    URL.revokeObjectURL(updatedUrls[index]);
    updatedUrls.splice(index, 1);
    setPreviewUrls(updatedUrls);
  };

  const onSubmit = async (data: HeritageFormValues) => {
    console.log("Form Submitted: ", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setModalOpen(false);
    useMapStore.getState().setDraftLocation(null);
    alert("Heritage site contributed successfully!");
  };

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-800">Contribute Heritage Site</h2>
            <button 
              type="button"
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Location Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Site Location *</label>
                
                {draftLocation ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg text-green-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Location Selected</p>
                        <p className="text-sm text-green-600">
                          {draftLocation[1].toFixed(5)}, {draftLocation[0].toFixed(5)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePickOnMap}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
                    >
                      Re-pick on map
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handleUseLiveLocation}
                      disabled={isLocating}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      {isLocating ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                      ) : (
                        <Navigation className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                      )}
                      <span className="font-medium text-gray-700 group-hover:text-blue-700">Use Live Location</span>
                      <span className="text-xs text-gray-400 mt-1">Requires GPS permission</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePickOnMap}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <MapPin className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                      <span className="font-medium text-gray-700 group-hover:text-blue-700">Pick on Map</span>
                      <span className="text-xs text-gray-400 mt-1">Interactive map pinning</span>
                    </button>
                  </div>
                )}
                {errors.coordinates && (
                  <p className="text-red-500 text-sm mt-1">{errors.coordinates.message}</p>
                )}
              </div>

              {/* Site Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Site Name *</label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Ancient Banyan Tree"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select a category</option>
                    {Object.values(HeritageCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description / History *</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Describe the historical or cultural significance..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photos (Up to 5)</label>
                <div 
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                  />
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Drag & drop images or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images?.message as string}</p>}
                
                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting || !draftLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Contribution'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
