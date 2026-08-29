import { useEffect, useRef, useState } from 'react';
import { trackingApi } from './tracking.api';

const LOCATION_POST_INTERVAL_MS = 30_000;
const MIN_DISTANCE_CHANGE_METERS = 30;

type PublishedLocation = {
  latitude: number;
  longitude: number;
  postedAt: number;
};

type DriverLocationPublisherState = {
  status: 'idle' | 'requesting' | 'saving' | 'sharing' | 'blocked' | 'unsupported' | 'error';
  message: string;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceInMeters = (from: PublishedLocation, to: GeolocationCoordinates) => {
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const useDriverLocationPublisher = (token: string | null, enabled: boolean) => {
  const [state, setState] = useState<DriverLocationPublisherState>({
    status: 'idle',
    message: 'Location sharing is off.',
  });
  const lastPublishedRef = useRef<PublishedLocation | null>(null);

  useEffect(() => {
    if (!enabled) {
      lastPublishedRef.current = null;
      setState({ status: 'idle', message: 'Location sharing is off.' });
      return undefined;
    }

    if (!token) {
      setState({ status: 'error', message: 'Sign in again to share your route.' });
      return undefined;
    }

    if (!('geolocation' in navigator)) {
      setState({ status: 'unsupported', message: 'This phone does not support GPS sharing in the browser.' });
      return undefined;
    }

    let isActive = true;
    setState({ status: 'requesting', message: 'Getting your current GPS location...' });

    const publishPosition = (position: GeolocationPosition) => {
      const coordinates = position.coords;

      if (!Number.isFinite(coordinates.latitude) || !Number.isFinite(coordinates.longitude)) {
        if (isActive) {
          setState({ status: 'error', message: 'Unable to read a valid GPS location.' });
        }
        return;
      }

      const now = Date.now();
      const lastPublished = lastPublishedRef.current;
      const shouldPublish =
        !lastPublished ||
        now - lastPublished.postedAt >= LOCATION_POST_INTERVAL_MS ||
        distanceInMeters(lastPublished, coordinates) >= MIN_DISTANCE_CHANGE_METERS;

      if (!shouldPublish) {
        return;
      }

      lastPublishedRef.current = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        postedAt: now,
      };

      if (isActive) {
        setState({ status: 'saving', message: 'Saving your current location...' });
      }

      void trackingApi
        .createVehicleLocation(token, {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: coordinates.accuracy,
          heading: coordinates.heading ?? undefined,
          speed: coordinates.speed ?? undefined,
          recordedAt: new Date(position.timestamp).toISOString(),
        })
        .then(() => {
          if (isActive) {
            setState({ status: 'sharing', message: 'Sharing live location.' });
          }
        })
        .catch(() => {
          if (isActive) {
            setState({ status: 'error', message: 'Unable to update location. Retrying shortly.' });
          }
        });
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      if (!isActive) {
        return;
      }

      const message =
        error.code === error.PERMISSION_DENIED
          ? 'Location permission is blocked.'
          : 'Unable to read this phone location.';
      setState({ status: error.code === error.PERMISSION_DENIED ? 'blocked' : 'error', message });
    };

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 15_000,
      timeout: 20_000,
    };

    navigator.geolocation.getCurrentPosition(publishPosition, handleLocationError, geolocationOptions);

    const watcherId = navigator.geolocation.watchPosition(
      publishPosition,
      handleLocationError,
      geolocationOptions,
    );

    return () => {
      isActive = false;
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [enabled, token]);

  return state;
};
