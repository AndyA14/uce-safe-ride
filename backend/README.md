# 🔙 UCE Safe Ride - Backend Services

**UCE Safe Ride Backend** es la unidad central de procesamiento de la plataforma. Está diseñado como un conjunto de microservicios distribuidos, creados para manejar lógica de transporte compleja, seguimiento en tiempo real de geolocalización mediante MQTT y gestión segura de usuarios para la comunidad universitaria.

## 🏗️ Arquitectura General

El backend sigue un patrón de **Arquitectura de Microservicios**, asegurando la separación de responsabilidades y escalabilidad independiente. El sistema se basa en:

- **REST APIs** para operaciones CRUD estándar y gestión de usuarios.
- **MQTT (Mosquitto)** para telemetría de alto rendimiento y baja latencia (actualizaciones de ubicación).
- **WebSockets** para enviar actualizaciones en tiempo real a las aplicaciones cliente.
- **Bibliotecas Compartidas** para mantener la consistencia del código a través de los servicios.

## 📂 Estructura del Proyecto

La estructura del proyecto se basa en la descomposición de servicios:

backend/
├── mosquitto/ # Configuración del broker MQTT
├── postgres-init/ # Scripts de inicialización de base de datos
├── services/ # Código fuente de los microservicios
│ ├── auth-service/ # Gestión de identidad de usuarios y JWT
│ ├── driver-service/ # Perfiles de conductores y su estado
│ ├── notification-service/ # Notificaciones por correo/push
│ ├── route-service/ # Optimización de rutas y búsqueda de trayectos
│ ├── simulation-service/ # Simulación de tráfico y viajes para pruebas
│ ├── stop-service/ # Gestión de paradas de buses o puntos de recogida
│ ├── student-service/ # Perfiles de estudiantes y validación
│ ├── tracking-service/ # Ingesta de datos en vivo de ubicación
│ ├── trip-service/ # Ciclo de vida del viaje (Solicitud -> Finalización)
│ ├── vehicle-service/ # Registro de vehículos (autobuses, coches)
│ └── ws-gateway/ # Gateway de WebSocket para eventos en tiempo real
├── shared/ # Modelos y utilidades compartidas de Pydantic
├── .env # Variables globales de entorno
├── docker-compose.yml # Orquestación de todos los servicios
└── README.md # Documentación del proyecto


## 🛠 Tech Stack

El proyecto utiliza una pila tecnológica robusta y optimizada para el rendimiento y la escalabilidad:

| Componente           | Tecnología            | Rol                                                      |
|----------------------|-----------------------|----------------------------------------------------------|
| **Runtime**          | Python 3.10+          | Lenguaje principal para microservicios.                   |
| **Framework**        | FastAPI               | Framework web asíncrono de alto rendimiento.              |
| **Mensajería**       | Eclipse Mosquitto     | Broker MQTT para seguimiento de ubicación IoT.            |
| **Tiempo Real**      | WebSockets            | Actualizaciones en vivo para clientes frontend.           |
| **Base de Datos**    | PostgreSQL            | Persistencia de datos relacionales.                       |
| **Containerización** | Docker                | Aislamiento de servicios y despliegue.                    |
| **Orquestación**     | Docker Compose        | Gestión de contenedores multi-servicio localmente.        |

## 🔌 Catálogo de Servicios

| Servicio                | Puerto (Por defecto) | Descripción                                                  |
|-------------------------|----------------------|--------------------------------------------------------------|
| **Auth**                | 8001                 | Maneja el inicio de sesión, registro y validación de tokens. |
| **Student**             | 8002                 | Gestiona los datos de estudiantes y la verificación académica.|
| **Driver**              | 8003                 | Gestiona la validación de conductores y su disponibilidad.   |
| **Trip**                | 8004                 | Orquesta el flujo de reserva de viajes.                      |
| **Tracking**            | 8005                 | Procesa los flujos MQTT de ubicación.                        |
| **WS Gateway**          | 8006                 | Agrega eventos y los envía a los clientes a través de WS.    |
| **Simulation**          | 80XX                 | Genera tráfico sintético para pruebas de carga.              |

> **Nota**: Los números de puerto son ilustrativos, por favor verifica en tu archivo `docker-compose.yml`.

## 🚀 Getting Started

### Requisitos previos

- **Docker Desktop** (Engine 20.10+)
- **Docker Compose** (v2.0+)

### Configuración del Ecosistema

1. **Configuración del Entorno**:  
   Asegúrate de que el archivo `.env` esté presente en la raíz de `backend/` con las credenciales necesarias de la base de datos y las claves secretas.

2. **Iniciar los Servicios**:  
   Ejecuta el siguiente comando desde el directorio de backend:
   ```bash
   docker-compose up --build
Esto iniciará todos los microservicios, la base de datos de Postgres y el broker Mosquitto.

Verificar el Estado:
Comprueba que todos los contenedores estén saludables con:

docker-compose ps
📡 Flujo de Datos (Seguimiento)
La app móvil publica la ubicación en Mosquitto (Topic: u/loc).

El Tracking Service se suscribe al MQTT, procesa las coordenadas y las guarda en la base de datos.

El WS Gateway transmite la actualización a los clientes relevantes mediante WebSockets.

🧪 Pruebas
Puedes interactuar con las APIs de cada servicio a través de su documentación Swagger auto-generada (cuando se ejecuta localmente):

Auth Service: http://localhost:8001/docs

Trip Service: http://localhost:8004/docs

(Así sucesivamente para otros servicios).

📄 Licencia
Este proyecto es un proyecto interno de la universidad.
Todos los derechos reservados © 2025.