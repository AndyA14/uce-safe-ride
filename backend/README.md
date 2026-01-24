🔙 UCE Safe Ride - Backend ServicesUCE Safe Ride Backend is the core processing unit of the platform. It is architected as a set of distributed microservices, designed to handle complex transportation logic, real-time geolocation tracking via MQTT, and secure user management for the university community.🏗️ Architecture OverviewThe backend follows a Microservices Architecture pattern, ensuring separation of concerns and independent scalability. The system relies on:REST APIs for standard CRUD operations and user management.MQTT (Mosquitto) for high-throughput, low-latency telemetry (location updates).WebSockets for pushing real-time updates to client applications.Shared Libraries to maintain code consistency across services.📂 Project StructureBased on the service decomposition:Plaintextbackend/
├── mosquitto/                # MQTT Broker configuration
├── postgres-init/            # Database initialization scripts
├── services/                 # Microservices Source Code
│   ├── auth-service/         # User identity & JWT management
│   ├── driver-service/       # Driver profiles & status
│   ├── notification-service/ # Email/Push notifications
│   ├── route-service/        # Pathfinding & route optimization
│   ├── simulation-service/   # Traffic/Ride simulation for testing
│   ├── stop-service/         # Bus stops or pickup points management
│   ├── student-service/      # Student profiles & validation
│   ├── tracking-service/     # Ingestion of live location data
│   ├── trip-service/         # Ride lifecycle (Request -> End)
│   ├── vehicle-service/      # Car/Bus registry
│   └── ws-gateway/           # WebSocket Gateway for real-time events
├── shared/                   # Shared Pydantic models & Utils
├── .env                      # Global Environment variables
├── docker-compose.yml        # Orchestration for all services
└── README.md                 # Project Documentation
🛠 Tech StackComponentTechnologyRoleRuntimePython 3.10+Main language for microservices.FrameworkFastAPIHigh-performance async web framework.MessagingEclipse MosquittoMQTT Broker for IoT/Location tracking.Real-TimeWebSocketsLive updates for frontend clients.DatabasePostgreSQLRelational data persistence.ContainerizationDockerService isolation and deployment.OrchestrationDocker ComposeLocal multi-container management.🔌 Services CatalogServicePort (Default)DescriptionAuth:8001Handles login, registration, and token validation.Student:8002Manages student data and academic verification.Driver:8003Manages driver validation and availability.Trip:8004Orchestrates the ride booking flow.Tracking:8005Processes MQTT location streams.WS Gateway:8006Aggregates events and pushes to clients via WS.Simulation:80XXGenerates synthetic traffic for load testing.(Note: Port numbers are illustrative, please verify against your docker-compose.yml)🚀 Getting StartedPrerequisitesDocker Desktop (Engine 20.10+)Docker Compose (v2.0+)Running the EcosystemEnvironment Setup:Ensure the .env file exists in the root of backend/ with the necessary database credentials and secret keys.Start Services:Run the orchestration command from the backend directory:Bashdocker-compose up --build
This will start all microservices, the Postgres database, and the Mosquitto broker.Verify Status:Check that all containers are healthy:Bashdocker-compose ps
📡 Data Flow (Tracking)Mobile App publishes location to Mosquitto (Topic: u/loc).Tracking Service subscribes to MQTT, processes coordinates, and saves to DB.WS Gateway broadcasts the update to relevant Web Clients listening via WebSockets.🧪 TestingYou can interact with individual service APIs via their auto-generated Swagger documentation (when running locally):Auth Service: http://localhost:8001/docsTrip Service: http://localhost:8004/docs(And so on for other services)📄 LicenseInternal University Project.All rights reserved © 2025.