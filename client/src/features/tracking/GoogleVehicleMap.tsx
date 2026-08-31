import { useEffect, useRef, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import schoolCarMarker from '../../assets/school-car.svg';
import {
  getGoogleMapId,
  loadGoogleMaps,
  type GoogleAdvancedMarker,
  type GoogleLatLng,
  type GoogleMap,
} from '../../components/google-maps';
import type { VehicleLocation } from './tracking.api';

const toMapPosition = (location: VehicleLocation): GoogleLatLng => ({
  lat: Number(location.latitude),
  lng: Number(location.longitude),
});

const createVehicleMarkerContent = () => {
  const image = document.createElement('img');
  image.alt = '';
  image.height = 33;
  image.src = schoolCarMarker;
  image.width = 50;
  return image;
};

type GoogleVehicleMapProps = {
  isActive: boolean;
  location: VehicleLocation | null;
};

export const GoogleVehicleMap = ({ isActive, location }: GoogleVehicleMapProps) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleAdvancedMarker | null>(null);
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (!isActive || !location || mapRef.current || !mapElementRef.current) {
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setMapError('Add VITE_GOOGLE_MAPS_API_KEY to show the live map.');
      return;
    }

    const mapId = getGoogleMapId();

    if (!mapId) {
      setMapError('Add VITE_GOOGLE_MAP_ID to show the live map.');
      return;
    }

    let isMounted = true;

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!isMounted || !mapElementRef.current) {
          return;
        }

        const position = toMapPosition(location);
        const map = new maps.maps.Map(mapElementRef.current, {
          center: position,
          disableDefaultUI: true,
          gestureHandling: 'cooperative',
          mapId,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: 15,
        });

        mapRef.current = map;
        markerRef.current = new maps.maps.marker.AdvancedMarkerElement({
          content: createVehicleMarkerContent(),
          map,
          position,
          title: 'School car location',
        });
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setMapError(error instanceof Error ? error.message : 'Unable to load Google Maps.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isActive, location]);

  useEffect(() => {
    if (!location || !mapRef.current || !markerRef.current) {
      return;
    }

    const position = toMapPosition(location);
    mapRef.current.setCenter(position);
    markerRef.current.position = position;
  }, [location]);

  useEffect(() => {
    return () => {
      if (markerRef.current) markerRef.current.map = null;
    };
  }, []);

  if (mapError) {
    return (
      <div className="flex h-60 items-center justify-center rounded-3xl bg-[#dff3df] px-5 text-center text-sm font-bold text-sky-dark">
        {mapError}
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex h-60 items-center justify-center rounded-3xl bg-[#dff3df] px-5 text-center text-sm font-bold text-sky-dark">
        Waiting for the driver location.
      </div>
    );
  }

  const recenterMap = () => {
    mapRef.current?.setCenter(toMapPosition(location));
  };

  return (
    <div className="relative h-60 overflow-hidden rounded-3xl bg-[#dff3df]">
      <div ref={mapElementRef} className="size-full" />
      <button
        className="absolute right-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-white text-sky-dark shadow-md"
        type="button"
        aria-label="Re-center on driver"
        onClick={recenterMap}
      >
        <LocateFixed className="size-5" aria-hidden="true" strokeWidth={2.5} />
      </button>
    </div>
  );
};
