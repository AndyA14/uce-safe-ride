const libraries = ['places', 'geometry'];

/**
 * Calcula la ruta y devuelve la polyline codificada.
 * @param {Object} origin - { lat, lng } o string dirección
 * @param {Object} destination - { lat, lng } o string dirección
 * @param {Array} waypoints - Array de paradas [{location: {lat, lng}}, ...]
 */
export const getRoutePolyline = async (origin, destination, waypoints = []) => {
  // Verificamos que la API esté cargada en window
  if (!window.google) {
    throw new Error("Google Maps API no está lista");
  }

  const directionsService = new window.google.maps.DirectionsService();

  const request = {
    origin: origin,
    destination: destination,
    waypoints: waypoints,
    travelMode: window.google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        // Obtenemos la "overview_polyline" que es el string codificado
        const encodedPolyline = result.routes[0].overview_polyline;
        
        // También devolvemos datos útiles como distancia y duración
        const leg = result.routes[0].legs[0];
        const stats = {
            polyline: encodedPolyline,
            distance: leg.distance.text,
            duration: leg.duration.text
        };
        
        resolve(stats);
      } else {
        console.error(`Error Google Maps: ${status}`);
        reject(status);
      }
    });
  });
};