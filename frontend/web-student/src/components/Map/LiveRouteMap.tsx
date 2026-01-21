import React, { useMemo, useState, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  Marker,
} from '@react-google-maps/api';

/* ======================================================
   TYPES
====================================================== */

interface LiveRouteMapProps {
  routePolyline: string | null;
  busLocation: { lat: number; lng: number } | null;
}

/* ======================================================
   CONSTANTS
====================================================== */

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

// Coordenadas por defecto (Quito - UCE)
const centerQuito = { lat: -0.210, lng: -78.49 };

/* ======================================================
   COMPONENT
====================================================== */

const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  routePolyline,
  busLocation,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // Vite + fallback por seguridad
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_KEY ||
      process.env.REACT_APP_GOOGLE_MAPS_KEY ||
      '',
    libraries: ['geometry'], // Necesario para decodePath
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  /**
   * 1️⃣ Decodificar la polyline de Google → coordenadas reales
   */
  const path = useMemo(() => {
    if (!routePolyline || !isLoaded || !window.google) return [];
    return window.google.maps.geometry.encoding.decodePath(routePolyline);
  }, [routePolyline, isLoaded]);

  /**
   * 2️⃣ Ajustar la cámara para mostrar toda la ruta
   */
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);

      if (path.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        mapInstance.fitBounds(bounds);
      }
    },
    [path]
  );

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 rounded-xl">
        Cargando Mapa... 🗺️
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={busLocation || centerQuito}
      zoom={14}
      onLoad={onLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {/* A. Ruta (Polyline Azul) */}
      {path.length > 0 && (
        <Polyline
          path={path}
          options={{
            strokeColor: '#2563EB', // Azul UCE
            strokeOpacity: 0.8,
            strokeWeight: 6,
          }}
        />
      )}

      {/* B. Bus */}
      {busLocation && (
        <Marker
          position={busLocation}
          icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
            scaledSize: new window.google.maps.Size(45, 45),
          }}
          animation={window.google.maps.Animation.DROP}
        />
      )}
    </GoogleMap>
  );
};

export default LiveRouteMap;
