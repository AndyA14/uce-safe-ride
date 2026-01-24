import React, { useState, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Polyline,
  OverlayViewF,
} from '@react-google-maps/api';

/* ======================================================
   1. ESTILOS DEL MAPA (CONSTANTES)
====================================================== */
const styleLight = [
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#333333" }, { "lightness": 40 }] },
  { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] },
  { "featureType": "all", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
  { "featureType": "poi.school", "elementType": "geometry.fill", "stylers": [{ "color": "#dce0e6" }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
  { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }
];

const styleDark = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

/* ======================================================
   TYPES & CONSTANTS
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
  
  // ✅ ESTADO PARA EL ESTILO DEL MAPA
  const [mapStyles, setMapStyles] = useState<any[]>(styleLight);

  /* ======================================================
     DETECTAR TEMA (LIGHT / DARK)
  ====================================================== */
  useEffect(() => {
    // 1. Definir la media query
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    // 2. Función para cambiar el estado
    const changeTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setMapStyles(e.matches ? styleDark : styleLight);
    };

    // 3. Establecer valor inicial
    changeTheme(mq);

    // 4. Escuchar cambios en vivo
    mq.addEventListener('change', changeTheme);

    // 5. Cleanup
    return () => mq.removeEventListener('change', changeTheme);
  }, []);

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
      const decoded = window.google.maps.geometry.encoding.decodePath(routePolyline);
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
     MOVIMIENTO SUAVIZADO
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

  useEffect(() => {
    if (busLocation?.heading == null) return;
    setSmoothHeading((prev) => {
      const diff = busLocation.heading! - prev;
      return prev + diff * 0.25;
    });
  }, [busLocation?.heading]);

  /* ======================================================
     VALIDACIONES Y RENDER
  ====================================================== */
  if (loadError) return <div>Error cargando Google Maps</div>;
  if (!isLoaded) return <div>Cargando Google Maps...</div>;

  const isBusValid =
    busLocation &&
    typeof busLocation.lat === 'number' &&
    typeof busLocation.lng === 'number' &&
    !isNaN(busLocation.lat) &&
    !isNaN(busLocation.lng);

  const busPosition = isBusValid ? { lat: busLocation.lat, lng: busLocation.lng } : null;
  const busSpeed = busLocation && 'speed' in busLocation ? Number(busLocation.speed) : 10;

  const getBusSize = (zoom: number) => {
    if (zoom >= 18) return { width: 72, height: 148 };
    if (zoom >= 17) return { width: 64, height: 132 };
    if (zoom >= 16) return { width: 60, height: 124 };
    if (zoom >= 15) return { width: 56, height: 116 };
    return { width: 48, height: 100 };
  };
  const busSize = getBusSize(mapZoom);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerQuito}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      // ✅ APLICAMOS LOS ESTILOS DINÁMICOS AQUÍ
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: mapStyles, // <--- Aquí ocurre la magia
      }}
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

      {/* BUS CON GLOW */}
      {busPosition && (
        <OverlayViewF position={busPosition} mapPaneName="overlayMouseTarget">
          <div
            className="relative flex items-center justify-center pointer-events-none"
            style={{
              width: busSize.width,
              height: busSize.height,
              transform: `translate(-50%, -50%) rotate(${smoothHeading - 90}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s linear, width 0.2s ease, height 0.2s ease',
            }}
          >
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
                    background: 'radial-gradient(circle, rgba(41,98,255,0.7) 0%, rgba(41,98,255,0) 80%)',
                    filter: 'blur(30px)',
                    animation: 'pulseBig 1s infinite alternate',
                  }}
                />
                <div
                  className="absolute top-0 left-0 w-full h-full rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(41,98,255,0.5) 0%, rgba(41,98,255,0) 70%)',
                    filter: 'blur(20px)',
                    animation: 'pulseSmall 1s infinite alternate',
                  }}
                />
              </div>
            )}
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