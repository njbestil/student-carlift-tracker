export type GoogleLatLng = {
  lat: number | (() => number);
  lng: number | (() => number);
};

export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

export const toGoogleLatLngLiteral = (position: GoogleLatLng): GoogleLatLngLiteral => ({
  lat: typeof position.lat === 'function' ? position.lat() : position.lat,
  lng: typeof position.lng === 'function' ? position.lng() : position.lng,
});

export type GoogleMap = {
  addListener(eventName: 'click', handler: (event: { latLng: GoogleLatLng | null }) => void): void;
  panTo(position: GoogleLatLng): void;
  setCenter(position: GoogleLatLng): void;
};

export type GoogleAdvancedMarker = {
  map: GoogleMap | null;
  position: GoogleLatLng;
};

export type GoogleMapsNamespace = {
  maps: {
    Animation: { DROP: number };
    Geocoder: new () => {
      geocode(
        request: { location: GoogleLatLng },
        callback: (results: Array<{ formatted_address: string }> | null, status: string) => void,
      ): void;
    };
    Map: new (
      element: HTMLElement,
      options: {
        center: GoogleLatLng;
        disableDefaultUI?: boolean;
        gestureHandling?: 'cooperative';
        mapId?: string;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        zoom: number;
      },
    ) => GoogleMap;
    marker: {
      AdvancedMarkerElement: new (options: {
        content?: HTMLElement;
        map: GoogleMap;
        position: GoogleLatLng;
        title: string;
      }) => GoogleAdvancedMarker;
    };
    importLibrary(libraryName: 'places'): Promise<GooglePlacesLibrary>;
  };
};

export type GooglePlacesLibrary = {
  AutocompleteSessionToken: new () => GoogleAutocompleteSessionToken;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(request: {
      input: string;
      sessionToken: GoogleAutocompleteSessionToken;
    }): Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
  };
};

export type GoogleAutocompleteSessionToken = Record<string, never>;

export type GoogleAutocompleteSuggestion = {
  placePrediction?: GooglePlacePrediction;
};

export type GooglePlacePrediction = {
  text: { toString(): string };
  toPlace(): {
    displayName?: string;
    formattedAddress?: string;
    location?: GoogleLatLng;
    fetchFields(options: { fields: string[] }): Promise<void>;
  };
};

declare global {
  interface Window {
    __studentCarliftGoogleMapsReady?: () => void;
    google?: GoogleMapsNamespace;
  }
}

let googleMapsPromise: Promise<GoogleMapsNamespace> | null = null;
const googleMapsCallbackName = '__studentCarliftGoogleMapsReady';

export const loadGoogleMaps = (apiKey: string) => {
  if (window.google) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const searchParams = new URLSearchParams({
      callback: googleMapsCallbackName,
      key: apiKey,
      libraries: 'places,marker',
      loading: 'async',
      v: 'weekly',
    });

    const cleanup = () => delete window.__studentCarliftGoogleMapsReady;

    script.src = `https://maps.googleapis.com/maps/api/js?${searchParams.toString()}`;
    script.async = true;
    script.dataset.googleMaps = 'student-carlift';
    window.__studentCarliftGoogleMapsReady = () => {
      cleanup();
      if (window.google?.maps?.Map) {
        resolve(window.google);
        return;
      }
      googleMapsPromise = null;
      reject(new Error('Google Maps did not initialize.'));
    };
    script.onerror = () => {
      cleanup();
      googleMapsPromise = null;
      reject(new Error('Google Maps failed to load. Check the API key and its website restrictions.'));
    };
    document.head.append(script);
  });

  return googleMapsPromise;
};

export const getGoogleMapId = () => import.meta.env.VITE_GOOGLE_MAP_ID || null;
