import React, { useState } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

// ⚠️ Definimos las librerías fuera del componente para evitar recargas infinitas
const LIBRARIES: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

const RouteGenerator = () => {
  // 1. CARGADOR DEL SCRIPT DE GOOGLE MAPS
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD_9WDH7yP_vwVyLF5ZulIDgqUka_Csdxw", // <--- ⚠️ IMPORTANTE: PEGA TU API KEY AQUÍ
    
  });
  // Eliminamos "localContext" de la lista de tipos
  const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [encodedPolyline, setEncodedPolyline] = useState('');
  
  // Estado para los inputs
  const [origin, setOrigin] = useState("Universidad Central del Ecuador");
  const [destination, setDestination] = useState("Seminario Mayor, Quito");

  const calculateRoute = () => {
    // Solo ejecutamos si el script ya cargó
    if (!isLoaded) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setResponse(result);
          // Extraemos la polilínea detallada
          const polylineString = result.routes[0].overview_polyline;
          setEncodedPolyline(polylineString);
        } else {
          alert('Error al calcular ruta: ' + status);
        }
      }
    );
  };

  // 2. SI NO HA CARGADO, MOSTRAMOS UN TEXTO DE ESPERA
  if (!isLoaded) return <div className="p-4">⏳ Cargando mapas de Google...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4 text-blue-800">🛠️ Generador de Rutas Reales</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input 
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="border p-2 rounded text-black"
          placeholder="Origen"
        />
        <input 
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border p-2 rounded text-black"
          placeholder="Destino"
        />
      </div>

      <button 
        onClick={calculateRoute}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        🚗 Calcular Ruta (Por Calles)
      </button>

      {encodedPolyline && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-bold text-green-800 mb-2">✅ ¡Polilínea Generada!</p>
          <textarea 
            readOnly
            className="w-full h-24 p-2 text-xs font-mono border rounded bg-white text-gray-600"
            value={encodedPolyline}
          />
          <p className="text-xs text-gray-500 mt-1">
            Copia este texto y pégalo en el campo "polyline" de tu Base de Datos (Swagger).
          </p>
        </div>
      )}

      <div className="h-64 w-full mt-4 rounded border overflow-hidden relative">
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          zoom={13}
          center={{ lat: -0.199, lng: -78.504 }}
        >
          {response && <DirectionsRenderer options={{ directions: response }} />}
        </GoogleMap>
      </div>
    </div>
  );
};

export default RouteGenerator;