import React, { useState } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const RouteGenerator = () => {
  const [response, setResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [generatedPolyline, setGeneratedPolyline] = useState('');

  // Coordenadas de la UCE para centrar el mapa
  const center = { lat: -0.1996, lng: -78.5047 };

  // Función "calculateRoute" adaptada de tu mapa.js
  const generateRoute = () => {
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: "Universidad Central del Ecuador, Quito", // O usa coordenadas
        destination: "Condado Shopping, Quito", // Cambia esto por tu destino real
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setResponse(result);
          
          // 🔥 AQUÍ ESTÁ LA MAGIA:
          // En lugar de "overview_path" (array de puntos) que usabas en mapa.js,
          // usamos "overview_polyline" que es el string comprimido para tu BD.
          const polylineString = result.routes[0].overview_polyline;
          setGeneratedPolyline(polylineString);
          console.log("COPIA ESTO EN TU DB:", polylineString);
        } else {
          console.error('Error calculando ruta:', status);
        }
      }
    );
  };

  return (
    <div style={{ padding: 20, background: '#fff' }}>
      <h3>Generador de Polilíneas (Reparación de BD)</h3>
      <button onClick={generateRoute} style={{ background: 'blue', color: 'white', padding: 10 }}>
      </button>

      {generatedPolyline && (
        <div style={{ marginTop: 10, padding: 10, background: '#f0f0f0', wordBreak: 'break-all' }}>
          <strong>Polyline Generada:</strong>
          <p>{generatedPolyline}</p>
          <button onClick={() => navigator.clipboard.writeText(generatedPolyline)}>
            Copiar al portapapeles
          </button>
        </div>
      )}

      <div style={{ height: '400px', marginTop: 20 }}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          zoom={13}
          center={center}
        >
          {response && <DirectionsRenderer options={{ directions: response }} />}
        </GoogleMap>
      </div>
    </div>
  );
};

export default RouteGenerator;