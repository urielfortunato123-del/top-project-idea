import { useState, useCallback } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isLoading: boolean;
  getPosition: () => Promise<GeoPosition | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPosition = useCallback(async (): Promise<GeoPosition | null> => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geoPos: GeoPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(geoPos);
          setIsLoading(false);
          resolve(geoPos);
        },
        (err) => {
          let errorMessage = 'Erro ao obter localização';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tempo esgotado ao buscar localização';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }, []);

  return { position, error, isLoading, getPosition };
}