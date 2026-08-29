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

export type GoogleMarkerIcon = {
  anchor?: GooglePoint;
  fillColor?: string;
  fillOpacity?: number;
  path?: number;
  rotation?: number;
  scale?: number;
  scaledSize?: GoogleSize;
  strokeColor?: string;
  strokeWeight?: number;
  url?: string;
};

export type GoogleMap = {
  addListener(eventName: 'click', handler: (event: { latLng: GoogleLatLng | null }) => void): void;
  panTo(position: GoogleLatLng): void;
  setCenter(position: GoogleLatLng): void;
};

export type GoogleMarker = {
  setIcon(icon: GoogleMarkerIcon): void;
  setMap(map: GoogleMap | null): void;
  setPosition(position: GoogleLatLng): void;
};

export type GooglePoint = {
  x: number;
  y: number;
};

export type GoogleSize = {
  height: number;
  width: number;
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
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        zoom: number;
      },
    ) => GoogleMap;
    Marker: new (options: {
      animation?: number;
      icon?: GoogleMarkerIcon;
      map: GoogleMap;
      position: GoogleLatLng;
      title: string;
    }) => GoogleMarker;
    Point: new (x: number, y: number) => GooglePoint;
    Size: new (width: number, height: number) => GoogleSize;
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
      libraries: 'places',
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
