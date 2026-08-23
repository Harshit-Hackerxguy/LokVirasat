'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Trash2, Send, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

// Bhashini exact language codes mapping
const LANGUAGES = [
  { code: 'hi', name: 'Hindi (hi)' },
  { code: 'bn', name: 'Bengali (bn)' },
  { code: 'ta', name: 'Tamil (ta)' },
  { code: 'te', name: 'Telugu (te)' },
  { code: 'mr', name: 'Marathi (mr)' },
  { code: 'gu', name: 'Gujarati (gu)' },
  { code: 'kn', name: 'Kannada (kn)' },
  { code: 'ml', name: 'Malayalam (ml)' },
  { code: 'pa', name: 'Punjabi (pa)' },
  { code: 'or', name: 'Odia (or)' },
  { code: 'as', name: 'Assamese (as)' },
  { code: 'en', name: 'English (en)' },
];

export default function StoryRecorder() {
  const { state, audioBlob, error, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [language, setLanguage] = useState('hi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  const handleSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);

      // Example endpoint for Next.js API route integrating Bhashini ULCA
      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit recording');
      }

      alert('Story successfully submitted and queued for translation!');
      resetRecording();
    } catch (err) {
      console.error('Submission error:', err);
      alert('Error submitting recording. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      <div className="space-y-6">
        {/* Header section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Share Your Story
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Record your oral history to be preserved and translated.
          </p>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language Selection */}
        <div className="space-y-2 relative z-20">
          <label htmlFor="language" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Source Language
          </label>
          <div className="relative">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={state === 'recording' || isSubmitting}
              className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recorder UI */}
        <div className="flex flex-col items-center justify-center py-6 min-h-[160px]">
          {state === 'idle' && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="relative group flex items-center justify-center w-20 h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Mic className="w-8 h-8" />
            </motion.button>
          )}

          {state === 'recording' && (
            <div className="relative flex items-center justify-center">
              {/* Pulsing rings */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-20 h-20 bg-red-500 rounded-full"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                className="absolute w-20 h-20 bg-red-500 rounded-full"
              />
              
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="relative z-10 flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-colors"
              >
                <Square className="w-8 h-8" />
              </motion.button>
            </div>
          )}

          {state === 'review' && audioUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              <div className="px-2 w-full flex justify-center">
                <audio controls src={audioUrl} className="w-full h-12 rounded-full outline-none" />
              </div>
              
              <div className="flex flex-row items-center justify-center gap-3">
                <button
                  onClick={resetRecording}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50 flex-1"
                >
                  {isSubmitting ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" 
                    />
                  ) : (
                    <Send className="w-4 h-4 -ml-1" />
                  )}
                  {isSubmitting ? 'Uploading' : 'Submit'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Status text */}
          <div className="mt-6 h-6 flex items-center justify-center">
            {state === 'idle' && (
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tap to start recording</span>
            )}
            {state === 'recording' && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Recording in progress...
              </motion.span>
            )}
            {state === 'review' && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Recording ready for review
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
