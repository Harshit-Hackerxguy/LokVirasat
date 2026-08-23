'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useMapStore } from '@/store/useMapStore';
import AddHeritageModal from '@/components/forms/AddHeritageModal';

interface InteractiveMapProps {
  /** If provided, the map will fly to this site */
  activeSiteId?: string | null;

  /** Callback when a marker is clicked */
  onMarkerClick?: (siteId: string) => void;
}

const Map = dynamic(() => import('./MapComponent'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
      Loading Map...
    </div>
  ),
  ssr: false,
});

export default function InteractiveMap(props: InteractiveMapProps) {
  const setModalOpen = useMapStore((state) => state.setModalOpen);

  return (
    <>
      <div
        className="interactive-map-wrapper w-full h-full relative"
        style={{ minHeight: '100vh' }}
      >
        <Map {...props} />
      </div>

      {/* Report a lesser-known heritage location */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-[1000] bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full px-6 py-3 font-semibold flex items-center gap-2 transition-transform hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        Report Heritage Site
      </button>

      <AddHeritageModal />
    </>
  );
}