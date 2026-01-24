# 💻 UCE Safe Ride - Student Web Portal

El **Student Web Portal** es la interfaz del lado del cliente del ecosistema UCE Safe Ride. Construido con tecnologías web modernas, proporciona una experiencia rápida, accesible y adaptable para que los estudiantes soliciten viajes, sigan a los conductores en tiempo real y gestionen sus preferencias de seguridad.

## 🚀 Overview

Esta aplicación actúa como el punto de entrada principal para los estudiantes, conectándose a los microservicios backend mediante APIs REST y WebSockets para ofrecer:

- **Mapas interactivos**: Visualización en tiempo real de rutas y ubicaciones de los conductores.
- **Gestión de viajes**: Interfaz intuitiva para reservar, cancelar y monitorear viajes.
- **Diseño responsive**: Optimizado tanto para dispositivos móviles como para escritorios dentro del campus.
- **Alto rendimiento**: Potenciado por Vite y Bun para tiempos de desarrollo y compilación ultrarrápidos.

## 🛠 Tech Stack

Basado en la configuración del proyecto:

| Categoría        | Tecnología            | Uso                                   |
|------------------|-----------------------|---------------------------------------|
| **Framework**    | React (v18+)          | Arquitectura UI basada en componentes. |
| **Lenguaje**     | TypeScript            | Tipado estático para código robusto.   |
| **Herramienta de Build** | Vite            | Herramienta frontend de siguiente generación. |
| **Runtime / PM** | Bun                   | Runtime y gestor de paquetes rápido (bun.lockb). |
| **Estilos**      | Tailwind CSS          | Framework CSS basado en utilidades.    |
| **Biblioteca UI**| Shadcn/ui             | Componentes reutilizables (components.json). |
| **Despliegue**   | Docker + Nginx        | Servido de producción containerizado (nginx.conf). |
| **Linting**      | ESLint                | Consistencia de código y verificación de errores. |

## 📂 Estructura del Proyecto

La estructura de directorios sigue un patrón escalable estándar para proyectos en React:

frontend/web-student/
├── public/ # Archivos estáticos (favicons, manifest)
├── src/ # Código fuente
│ ├── components/ # Componentes reutilizables (botones, entradas)
│ ├── pages/ # Vistas basadas en rutas (Login, Home, RideRequest)
│ ├── hooks/ # Hooks personalizados de React
│ ├── services/ # Integraciones de servicios API (Axios/Fetch)
│ └── utils/ # Funciones auxiliares y constantes
├── .env # Variables de entorno (URLs de la API)
├── docker-entrypoint.sh # Script de inicialización de contenedor
├── nginx.conf # Configuración de Nginx para producción
├── tailwind.config.ts # Configuración del tema de Tailwind
├── vite.config.ts # Configuración del bundler Vite
└── bun.lockb # Archivo de bloqueo de Bun para versiones de dependencias


## ⚡ Getting Started

### Requisitos previos

- **Bun (v1.0 o superior)**: Recomendado por la presencia del archivo `bun.lockb`.
- **Docker (Opcional, para pruebas containerizadas)**.

### Instalación

1. Navega al directorio `frontend`:
   ```bash
   cd frontend/web-student
Instala las dependencias utilizando Bun:

bun install
Configura las variables de entorno:
Crea un archivo .env (o duplica el .env.example si está disponible) y configura la URL del backend:

VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
Servidor de Desarrollo
Inicia el servidor de desarrollo con recarga en caliente:

bun dev
La aplicación estará disponible en http://localhost:5173.

🐳 Despliegue con Docker
El proyecto incluye una configuración lista para producción con Docker utilizando un proceso de build multi-etapas con Nginx.

Construir y ejecutar
Construir la imagen:

docker build -t uce-safe-ride-student .
Ejecutar el contenedor:

docker run -p 3000:80 uce-safe-ride-student
La aplicación usará nginx.conf para servir los activos estáticos y gestionar el enrutamiento (fallback de SPA). El script docker-entrypoint.sh maneja la inyección de variables de entorno en tiempo de ejecución si está configurado.

🧪 Scripts
Los scripts estándar definidos en package.json son:

bun dev: Inicia el servidor de desarrollo.

bun run build: Compila el código TypeScript a los activos de producción en dist/.

bun run lint: Ejecuta ESLint para verificar problemas de calidad de código.

bun run preview: Previsualiza localmente la build de producción.

🤝 Contribución
Componentes UI: Al agregar nuevos elementos de UI, utiliza la carpeta components/ui si usas Shadcn.

Gestión de estado: Mantén el estado local cuando sea posible; usa Context API o Zustand para el estado global.

Responsividad: Siempre prueba los layouts en vistas móviles usando las herramientas de desarrollo de Chrome.

📄 Licencia
Este es un proyecto interno de la universidad.
Todos los derechos reservados © 2025.