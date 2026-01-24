# 🚕 UCE Safe Ride - Secure Campus Mobility Platform

**UCE Safe Ride** es una plataforma moderna y distribuida de transporte diseñada para garantizar un desplazamiento seguro, eficiente y en tiempo real para la comunidad universitaria. Conecta la flota de transporte institucional con estudiantes y personal docente, optimizando rutas y priorizando la seguridad de los pasajeros mediante telemetría avanzada.

## 🛡️ ¿Qué es UCE Safe Ride?

UCE Safe Ride es un sistema distribuido basado en microservicios que transforma la manera en que la comunidad universitaria se desplaza. A diferencia del transporte tradicional, nuestra plataforma ofrece:

- **Gestión Inteligente de Flota**: Los conductores se asocian a vehículos específicos y rutas activas en tiempo real.
- **Acceso Seguro**: Validación estricta mediante credenciales universitarias para garantizar que todos los pasajeros sean miembros verificados de la comunidad.
- **Telemetría en Vivo**: Seguimiento en tiempo real de la ubicación mediante WebSockets y Kafka para actualizaciones de alta frecuencia.
- **Alertas Inteligentes**: Notificaciones integradas para anomalías de tráfico, desvíos de ruta y estimaciones de llegada.

La plataforma aprovecha tecnologías nativas de la nube y servicios geoespaciales para asegurar alta disponibilidad, baja latencia y un entorno seguro para todos los usuarios.

## 🎯 Objetivos

- **Mejorar la Seguridad Estudiantil**: Crear una red confiable donde cada unidad y pasajero estén monitoreados.
- **Optimizar la Movilidad**: Reducir la incertidumbre proporcionando ETAs precisos y la ubicación en tiempo real de las unidades.
- **Sostenibilidad**: Promover el uso del transporte colectivo institucional para reducir la huella de carbono.
- **Excelencia Técnica**: Demostrar una arquitectura escalable y tolerante a fallos capaz de manejar picos de tráfico utilizando patrones basados en eventos.

## 🔍 Características Clave

### Para Estudiantes (App Pasajero)

- **Geolocalización en Vivo**: Ver las unidades activas moviéndose en el mapa en tiempo real con animaciones suaves.
- **Descubrimiento de Rutas**: Filtrar unidades visibles por rutas específicas (e.g., "Ruta Norte", "Ruta Valles").
- **Embarque Digital**: Función de "Check-in" para registrar la presencia en la unidad.
- **Notificaciones Ricas**: Alertas flotantes para el estado del servicio, incidentes de tráfico y avisos de llegada.

### Para Conductores (App Conductor)

- **Gestión de Viajes**: Configuración fácil del Vehículo + Ruta para comenzar la transmisión.
- **Contador de Pasajeros**: Visibilidad en tiempo real de los estudiantes embarcados.
- **Reporte de Incidentes**: Alerta de un toque para notificar al centro de control y a los estudiantes sobre demoras o problemas.

## 📚 Tech Stack

El proyecto utiliza una robusta y poliglota pila tecnológica optimizada para rendimiento y escalabilidad:

### Frontend (Web & Móvil)

- **Framework**: React + Vite (TypeScript)
- **Estilos**: Tailwind CSS + ShadcnUI
- **Mapas**: Google Maps Javascript API
- **Estado**: Context API + Hooks personalizados

### Backend (Microservicios)

- **Lenguaje**: Python 3.11+
- **Framework**: FastAPI
- **Gateway**: WebSocket Gateway (Implementación personalizada)

### Datos & Mensajería (El Núcleo)

- **Event Streaming**: Apache Kafka (Telemetría en tiempo real)
- **Message Broker**: RabbitMQ (Tareas asincrónicas y comunicaciones entre servicios)
- **Caching**: Redis (Cache de sesión y ubicación en vivo)
- **Bases de Datos**: PostgreSQL (Datos relacionales), MongoDB (Logs/Historial)

### DevOps & Infraestructura

- **Containerización**: Docker & Docker Compose
- **IaC**: Terraform
- **Proveedor de Nube**: AWS (EC2, RDS, EKS listo)
- **CI/CD**: GitHub Actions (Construcción y despliegue automatizados)

## 🌎 ¿Quiénes son los beneficiarios?

- **Estudiantes Universitarios**: Buscando transporte confiable con horarios predecibles.
- **Operadores de Transporte**: Necesitando herramientas modernas para gestionar sus rutas y comunicarse con los pasajeros.
- **Administración Universitaria**: Para monitorear el uso de la flota y mejorar la seguridad en el campus.
- **Desarrolladores**: Como implementación de referencia de un sistema distribuido geoespacial.

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso académico de **Sistemas Distribuidos** en la **Universidad Central del Ecuador**.  
Todos los derechos reservados © 2026.
