import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';

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

// Libraries estática para Google Maps
const libraries: ('places' | 'geometry')[] = ['geometry'];

/* ======================================================
   COMPONENT
====================================================== */
const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  routePolyline,
  busLocation,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_KEY ||
      process.env.REACT_APP_GOOGLE_MAPS_KEY ||
      '',
    libraries,
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
   * 2️⃣ Ajustar la cámara para mostrar toda la ruta al cargar
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

  /**
   * 3️⃣ Forzar al mapa a seguir al bus
   */
  useEffect(() => {
    if (map && busLocation && busLocation.lat !== 0) {
      console.log("📍 Centrando mapa en:", busLocation);
      map.panTo(busLocation); // pan suave
      // map.setCenter(busLocation); // alternativa instantánea
      // map.setZoom(15);          // ajustar zoom si quieres
    }
  }, [map, busLocation?.lat, busLocation?.lng]);

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
            strokeColor: '#2563EB',
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
