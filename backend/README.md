UCE Safe Ride - Backend Services

UCE Safe Ride Backend is the central processing unit of the platform. It is designed as a set of distributed microservices, created to handle complex transportation logic, real-time geolocation tracking using MQTT, and secure user management for the university community.

🏗️ General Architecture

The backend follows a Microservices Architecture pattern, ensuring separation of concerns and independent scalability for each component. The system is based on:

REST APIs for standard CRUD operations and user management.

MQTT (Mosquitto) for high-performance, low-latency telemetry (location updates).

WebSockets to send real-time updates to client apps.

Shared Libraries to maintain code consistency across services.

📂 Project Structure

The project structure is based on service decomposition:

backend/
├── mosquitto/           # MQTT broker configuration
├── postgres-init/       # Database initialization scripts
├── services/            # Microservices source code
│   ├── auth-service/    # User identity management and JWT
│   ├── driver-service/  # Driver profiles and their status
│   ├── notification-service/ # Email/push notifications
│   ├── route-service/   # Route optimization and journey search
│   ├── simulation-service/ # Traffic and journey simulation for testing
│   ├── stop-service/    # Bus stop or pickup point management
│   ├── student-service/ # Student profiles and validation
│   ├── tracking-service/ # Real-time location data ingestion
│   ├── trip-service/    # Trip lifecycle (Request -> Completion)
│   ├── vehicle-service/ # Vehicle registration (buses, cars)
│   └── ws-gateway/      # WebSocket gateway for real-time events
├── shared/              # Shared Pydantic models and utilities
├── .env                 # Global environment variables
├── docker-compose.yml   # Orchestration of all services
└── README.md            # Project documentation

🛠 Tech Stack

The project uses a robust technology stack optimized for performance and scalability:

Component	Technology	Role
Runtime	Python 3.10+	Main language for microservices.
Framework	FastAPI	High-performance asynchronous web framework.
Messaging	Eclipse Mosquitto	MQTT broker for IoT location tracking.
Real-Time	WebSockets	Live updates to frontend clients.
Database	PostgreSQL	Relational data persistence.
Containerization	Docker	Service isolation and deployment.
Orchestration	Docker Compose	Multi-service container management locally.
🔌 Service Catalog
Service	Port (Default)	Description
Auth	8001	Handles login, registration, and token validation.
Student	8002	Manages student data and academic verification.
Driver	8003	Manages driver validation and availability.
Trip	8004	Orchestrates the trip booking flow.
Tracking	8005	Processes MQTT location data streams.
WS Gateway	8006	Aggregates events and sends them to clients via WebSockets.
Simulation	80XX	Generates synthetic traffic for load testing.

Note: Port numbers are illustrative; please verify in your docker-compose.yml file.

🚀 Getting Started
Prerequisites

Docker Desktop (Engine 20.10+)

Docker Compose (v2.0+)

Environment Setup:

Ensure the .env file is present at the root of backend/ with the necessary database credentials and secret keys.

Start the Services:

Run the following command from the backend directory:

docker-compose up --build


This will start all the microservices, the PostgreSQL database, and the Mosquitto broker.

Verify the Status:

Check that all containers are healthy with:

docker-compose ps

📡 Data Flow (Tracking)

The mobile app publishes location data to Mosquitto (Topic: u/loc).

The Tracking Service subscribes to MQTT, processes the coordinates, and stores them in the database.

The WS Gateway broadcasts the update to relevant clients via WebSockets.

🧪 Testing

You can interact with each service's APIs through its auto-generated Swagger documentation (when running locally):

Auth Service: http://localhost:8001/docs

Trip Service: http://localhost:8004/docs

(And so on for other services.)

📄 License

This project is an internal university initiative.
All rights reserved © 2026.