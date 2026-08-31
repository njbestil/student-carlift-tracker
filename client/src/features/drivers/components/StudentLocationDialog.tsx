import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  getGoogleMapId,
  loadGoogleMaps,
  type GoogleAdvancedMarker,
  type GoogleMap,
} from '../../../components/google-maps';
import type { AssignedStudent } from '../drivers.api';

type StudentLocationDialogProps = {
  student: AssignedStudent | null;
  onClose: () => void;
};

export const StudentLocationDialog = ({ student, onClose }: StudentLocationDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleAdvancedMarker | null>(null);
  const titleId = useId();
  const [mapError, setMapError] = useState('');
  const hasLocation = student?.latitude !== null && student?.latitude !== undefined
    && student?.longitude !== null && student?.longitude !== undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (student && !dialog.open) dialog.showModal();
    if (!student && dialog.open) dialog.close();
  }, [student]);

  useEffect(() => {
    const mapElement = mapElementRef.current;
    if (!student || !hasLocation || !mapElement || mapRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Google Maps is not configured for this app.');
      return;
    }

    const mapId = getGoogleMapId();
    if (!mapId) {
      setMapError('Google Maps needs a map ID before it can show pins.');
      return;
    }

    let active = true;
    const position = { lat: student.latitude!, lng: student.longitude! };

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active) return;
        mapRef.current = new maps.maps.Map(mapElement, {
          center: position,
          disableDefaultUI: true,
          gestureHandling: 'cooperative',
          mapId,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: 16,
        });
        markerRef.current = new maps.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position,
          title: `${student.studentFullName}'s address`,
        });
      })
      .catch((error: unknown) => {
        if (active) setMapError(error instanceof Error ? error.message : 'Unable to load Google Maps.');
      });

    return () => {
      active = false;
      if (markerRef.current) markerRef.current.map = null;
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [hasLocation, student]);

  const close = () => onClose();

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} className="ui-dialog" onClose={close}>
      <div className="flex items-center justify-between border-b-2 border-line p-5">
        <h2 id={titleId} className="section-heading">Student address</h2>
        <button className="size-11 rounded-full bg-white text-ink" type="button" aria-label="Close student address" onClick={close}>
          <X className="mx-auto size-5" aria-hidden="true" strokeWidth={3} />
        </button>
      </div>
      <div className="grid gap-4 p-5">
        <p className="font-display text-xl font-bold">{student?.studentFullName}</p>
        <p className="body-copy">{student?.completeAddress}</p>
        {hasLocation && !mapError ? <div ref={mapElementRef} className="h-72 overflow-hidden rounded-2xl bg-sky-soft" /> : null}
        {!hasLocation ? <p className="body-copy">This student has no saved map location yet.</p> : null}
        {mapError ? <p className="body-copy">{mapError}</p> : null}
      </div>
    </dialog>
  );
};
