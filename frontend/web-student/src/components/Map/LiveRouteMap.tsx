import React, { useState, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  OverlayViewF,
} from '@react-google-maps/api';

/* ======================================================
   TYPES
====================================================== */
interface LiveRouteMapProps {
  routePolyline: string | null;
  busLocation: {
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  } | null;
}

/* ======================================================
   CONSTANTS
====================================================== */
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const centerQuito = { lat: -0.2017, lng: -78.5057 };
const libraries: ('geometry')[] = ['geometry'];

/* ======================================================
   COMPONENT
====================================================== */
const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  routePolyline,
  busLocation,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [decodedPath, setDecodedPath] = useState<google.maps.LatLng[]>([]);
  const [smoothHeading, setSmoothHeading] = useState(0);
  const [mapZoom, setMapZoom] = useState(15);

  /* ======================================================
     MAP CALLBACKS
  ====================================================== */
  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => setMap(null), []);

  /* ======================================================
     DECODIFICAR POLYLINE
  ====================================================== */
  useEffect(() => {
    if (!isLoaded || !routePolyline) return;

    if (!window.google?.maps?.geometry?.encoding) return;

    try {
      const decoded =
        window.google.maps.geometry.encoding.decodePath(routePolyline);
      setDecodedPath(decoded);

      if (map && decoded.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        decoded.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds);
      }
    } catch (error) {
      console.error(error);
      setDecodedPath([]);
    }
  }, [isLoaded, routePolyline, map]);

  /* ======================================================
     MOVIMIENTO SUAVIZADO DEL MAPA
  ====================================================== */
  useEffect(() => {
    if (!map || !busLocation) return;

    const lat = Number(busLocation.lat);
    const lng = Number(busLocation.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const center = map.getCenter();
    if (!center) return;

    map.panTo({
      lat: center.lat() + (lat - center.lat()) * 0.3,
      lng: center.lng() + (lng - center.lng()) * 0.3,
    });
  }, [map, busLocation]);

  /* ======================================================
     SUAVIZAR ROTACIÓN
  ====================================================== */
  useEffect(() => {
    if (busLocation?.heading == null) return;

    setSmoothHeading((prev) => {
      const diff = busLocation.heading! - prev;
      return prev + diff * 0.25;
    });
  }, [busLocation?.heading]);

  /* ======================================================
     VALIDACIONES Y ESTADOS
  ====================================================== */
  if (loadError) return <div>Error cargando Google Maps</div>;
  if (!isLoaded) return <div>Cargando Google Maps...</div>;

  const isBusValid =
    busLocation &&
    typeof busLocation.lat === 'number' &&
    typeof busLocation.lng === 'number' &&
    !isNaN(busLocation.lat) &&
    !isNaN(busLocation.lng);

  const busPosition = isBusValid
    ? { lat: busLocation.lat, lng: busLocation.lng }
    : null;

  const busSpeed =
    busLocation && 'speed' in busLocation ? Number(busLocation.speed) : 10;

  const getBusSize = (zoom: number) => {
    if (zoom >= 18) return { width: 72, height: 148 };
    if (zoom >= 17) return { width: 64, height: 132 };
    if (zoom >= 16) return { width: 60, height: 124 };
    if (zoom >= 15) return { width: 56, height: 116 };
    return { width: 48, height: 100 };
  };

  const busSize = getBusSize(mapZoom);

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerQuito}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ disableDefaultUI: true, zoomControl: true }}
      onZoomChanged={() => setMapZoom(map?.getZoom() ?? 15)}
    >
      {/* RUTA */}
      {decodedPath.length > 0 && (
        <Polyline
          path={decodedPath}
          options={{
            strokeColor: '#2962FF',
            strokeOpacity: 1,
            strokeWeight: 6,
            zIndex: 1,
          }}
        />
      )}

      {/* BUS CON GLOW TAILWIND */}
      {busPosition && (
        <OverlayViewF position={busPosition} mapPaneName="overlayMouseTarget">
          <div
            className={`relative flex items-center justify-center pointer-events-none`}
            style={{
              width: busSize.width,
              height: busSize.height,
              transform: `translate(-50%, -50%) rotate(${smoothHeading - 90}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s linear, width 0.2s ease, height 0.2s ease',
            }}
          >
            {/* PUNTO DE ILUMINACIÓN centrado bajo el bus */}
            {busSpeed > 1 && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: busSize.width * 2,
                  height: busSize.width * 1.5,
                  borderRadius: '50%',
                  zIndex: -1,
                }}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(41,98,255,0.7) 0%, rgba(41,98,255,0) 80%)',
                    filter: 'blur(30px)',
                    animation: 'pulseBig 1s infinite alternate',
                  }}
                />
                <div
                  className="absolute top-0 left-0 w-full h-full rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(41,98,255,0.5) 0%, rgba(41,98,255,0) 70%)',
                    filter: 'blur(20px)',
                    animation: 'pulseSmall 1s infinite alternate',
                  }}
                />
              </div>
            )}

            {/* BUS PNG */}
            <img
              src="/bus-top.png"
              alt="Bus UCE"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </OverlayViewF>
      )}
    </GoogleMap>
  );
};

export default LiveRouteMap;
