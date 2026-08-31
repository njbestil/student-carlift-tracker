import { ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, X } from 'lucide-react';
import { ToastNotification } from './ui/ToastNotification';
import {
  getGoogleMapId,
  loadGoogleMaps,
  type GoogleAutocompleteSessionToken,
  type GoogleLatLng,
  type GoogleMap,
  type GoogleAdvancedMarker,
  type GooglePlacePrediction,
  type GooglePlacesLibrary,
  toGoogleLatLngLiteral,
} from './google-maps';

export type LocationSelection = {
  address: string;
  latitude: number;
  longitude: number;
};

type GoogleMapsLocatorDialogProps = {
  initialLocation?: LocationSelection | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (location: LocationSelection) => void;
};

const defaultLocation = { lat: 25.2048, lng: 55.2708 };

export const GoogleMapsLocatorDialog = ({
  initialLocation,
  isOpen,
  onOpenChange,
  onSelect,
}: GoogleMapsLocatorDialogProps) => {
  const initialLatitude = initialLocation?.latitude;
  const initialLongitude = initialLocation?.longitude;
  const initialAddress = initialLocation?.address;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleAdvancedMarker | null>(null);
  const selectedLocationRef = useRef<LocationSelection | null>(null);
  const sessionTokenRef = useRef<GoogleAutocompleteSessionToken | null>(null);
  const titleId = useId();
  const suggestionsId = useId();
  const [mapError, setMapError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection | null>(null);
  const [placesLibrary, setPlacesLibrary] = useState<GooglePlacesLibrary | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const mapElement = mapElementRef.current;
    if (!isOpen || !mapElement || mapRef.current) return;

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
    const savedLocation = initialLatitude !== undefined && initialLongitude !== undefined
      ? { address: initialAddress ?? 'Saved location', latitude: initialLatitude, longitude: initialLongitude }
      : null;
    const startLocation = savedLocation
      ? { lat: savedLocation.latitude, lng: savedLocation.longitude }
      : defaultLocation;

    selectedLocationRef.current = savedLocation;
    setSelectedLocation(savedLocation);
    setSearchValue('');
    setSuggestions([]);

    const setPin = (position: GoogleLatLng, address: string) => {
      if (!active || !mapRef.current || !markerRef.current) return;
      const coordinates = toGoogleLatLngLiteral(position);
      markerRef.current.position = coordinates;
      mapRef.current.panTo(coordinates);
      const location = { address, latitude: coordinates.lat, longitude: coordinates.lng };
      selectedLocationRef.current = location;
      setSelectedLocation(location);
    };

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active) return;

        const map = new maps.maps.Map(mapElement, {
          center: startLocation,
          disableDefaultUI: true,
          gestureHandling: 'cooperative',
          mapId,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: initialLatitude !== undefined && initialLongitude !== undefined ? 16 : 12,
        });
        const marker = new maps.maps.marker.AdvancedMarkerElement({ map, position: startLocation, title: 'Selected location' });
        const geocoder = new maps.maps.Geocoder();
        mapRef.current = map;
        markerRef.current = marker;

        void maps.maps.importLibrary('places').then((library) => {
          if (!active) return;
          sessionTokenRef.current = new library.AutocompleteSessionToken();
          setPlacesLibrary(library);
        }).catch(() => {
          if (active) setMapError('Address search could not load. Check that Places API (New) is enabled for this key.');
        });

        map.addListener('click', (event) => {
          if (!event.latLng) return;
          setMapError('');
          geocoder.geocode({ location: event.latLng }, (results, status) => {
            setPin(event.latLng!, status === 'OK' && results?.[0] ? results[0].formatted_address : 'Pinned location');
          });
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
      sessionTokenRef.current = null;
      setPlacesLibrary(null);
    };
  }, [initialAddress, initialLatitude, initialLongitude, isOpen]);

  useEffect(() => {
    if (!placesLibrary || !sessionTokenRef.current || searchValue.trim().length < 3) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(() => {
      void placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: searchValue.trim(),
        sessionToken: sessionTokenRef.current!,
      })
        .then(({ suggestions: fetchedSuggestions }) => {
          if (active) {
            setSuggestions(
              fetchedSuggestions.flatMap((suggestion) =>
                suggestion.placePrediction ? [suggestion.placePrediction] : [],
              ),
            );
          }
        })
        .catch(() => {
          if (active) setMapError('Unable to find addresses. Try again.');
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [placesLibrary, searchValue]);

  const close = () => onOpenChange(false);
  const selectSuggestion = async (suggestion: GooglePlacePrediction) => {
    try {
      const place = suggestion.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
      if (!place.location) {
        setMapError('That address has no map location. Choose another suggestion.');
        return;
      }
      const coordinates = toGoogleLatLngLiteral(place.location);
      if (markerRef.current) markerRef.current.position = coordinates;
      mapRef.current?.panTo(coordinates);
      const location = {
        address: place.formattedAddress ?? place.displayName ?? 'Selected location',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };
      selectedLocationRef.current = location;
      setSelectedLocation(location);
      setSearchValue(location.address);
      setSuggestions([]);
      setMapError('');
      if (placesLibrary) sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
    } catch {
      setMapError('Unable to load that address. Choose another suggestion.');
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setMapError('');
  };

  const confirmSelection = () => {
    if (!selectedLocationRef.current) {
      setMapError('Search for an address or place a pin on the map first.');
      return;
    }
    onSelect(selectedLocationRef.current);
    close();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="ui-dialog"
      onClose={() => onOpenChange(false)}
    >
      <div className="flex items-center justify-between border-b-2 border-line p-5">
        <h2 id={titleId} className="section-heading">Find your address</h2>
        <button className="size-11 rounded-full bg-white text-ink" type="button" aria-label="Close location picker" onClick={close}>
          <X className="mx-auto size-5" aria-hidden="true" strokeWidth={3} />
        </button>
      </div>
      <ToastNotification message={mapError} variant="error" onClose={() => setMapError('')} />
      <div className="grid gap-4 p-5">
        <div>
          <label className="ui-label" htmlFor="google-maps-address-search">Search for an address</label>
          <div className="relative z-20">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              className="ui-field pl-12"
              id="google-maps-address-search"
              value={searchValue}
              onChange={handleSearchChange}
              autoComplete="off"
              aria-expanded={suggestions.length > 0 ? 'true' : 'false'}
              aria-controls={suggestions.length > 0 ? suggestionsId : undefined}
              placeholder="Search for an address"
            />
            {suggestions.length > 0 ? (
              <ul id={suggestionsId} className="absolute inset-x-0 top-full mt-2 max-h-56 overflow-y-auto rounded-2xl border-2 border-line bg-white py-1 shadow-lg">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.text.toString()}>
                    <button className="flex w-full items-start gap-3 px-4 py-3 text-left text-ink hover:bg-sky-soft focus-visible:bg-sky-soft" type="button" onClick={() => void selectSuggestion(suggestion)}>
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-soft text-sky-dark">
                        <MapPin className="size-4" aria-hidden="true" strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0 text-sm font-bold leading-5">{suggestion.text.toString()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <div ref={mapElementRef} className="h-72 overflow-hidden rounded-2xl bg-sky-soft" />
        <p className="body-copy text-sm">Search for your address or tap the map to place a pin.</p>
        {selectedLocation ? <p className="body-copy"><MapPin className="mr-1 inline size-4 text-sky-dark" aria-hidden="true" />{selectedLocation.address}</p> : null}
        <button className="ui-button-primary" type="button" onClick={confirmSelection}>Use this address</button>
      </div>
    </dialog>,
    document.body,
  );
};
