'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

interface InteractiveMapProps {
  /** If provided, the map will fly to this site */
  activeSiteId?: string | null;
  /** Callback when a marker is clicked */
  onMarkerClick?: (siteId: string) => void;
}

export default function InteractiveMap(props: InteractiveMapProps) {
  // Dynamically import the Leaflet map component with SSR disabled
  const Map = useMemo(
    () =>
      dynamic(() => import('./MapComponent'), {
        loading: () => (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            Loading Map...
          </div>
        ),
        ssr: false,
      }),
    []
  );

  return (
    <div className="interactive-map-wrapper">
      <Map {...props} />
    </div>
  );
}

