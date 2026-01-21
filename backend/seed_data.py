import requests
import json
import time
from datetime import datetime, timedelta # 🟢 AGREGADO

# ================= CONFIGURACIÓN =================
# Ajusta los puertos según tu docker-compose
VEHICLE_SERVICE = "http://localhost:8004/api/v1/vehicles"
TRIP_SERVICE = "http://localhost:8010/api/v1/trips"
ROUTE_SERVICE = "http://localhost:8003/api/v1/routes" 

# 👇 ¡ASEGÚRATE DE QUE ESTE TOKEN SEA VÁLIDO!
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZmJkZjgyMi1hZWI2LTQ0ZDEtODYzNy1mNGIyYzQ1ODQ5MDUiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjkwMjgzOTYsImV4cCI6MTc2OTAzMTk5NiwiaXNzIjoidWNlLXNhZmUtcmlkZSJ9.iv79mKLRmdjk10A2xAxmegSPDN2X4nlm3XH_Cv43kpI"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def create_vehicles():
    print("🚌 Creando Vehículos...")
    vehicles_data = [
        {"plate": "BUS-101", "model": "Volvo 9700", "vehicle_type": "BUS", "capacity": 40},
        {"plate": "BUS-102", "model": "Mercedes Benz", "vehicle_type": "BUS", "capacity": 30},
        {"plate": "BUS-103", "model": "Volkswagen", "vehicle_type": "MINIBUS", "capacity": 15}
    ]
    
    created_vehicles = []
    for v in vehicles_data:
        try:
            r = requests.post(f"{VEHICLE_SERVICE}/", json=v, headers=headers)
            if r.status_code in [200, 201]:
                print(f"   ✅ Creado: {v['plate']}")
                created_vehicles.append(r.json())
            elif r.status_code == 409:
                print(f"   ⚠️ Ya existe: {v['plate']}")
                # Intentamos recuperarlo si ya existe (lógica simple)
                # En un caso real haríamos un GET, pero para seeding rápido asumimos que no lo tenemos
            else:
                print(f"   ❌ Error {r.status_code}: {r.text}")
        except Exception as e:
            print(f"   ❌ Error de conexión con Vehicle Service: {e}")

    return created_vehicles

def start_trip(vehicle, route_id="ruta-uce-1"):
    print(f"\n🚀 Iniciando Viaje para {vehicle['plate']}...")
    
    # 1. Reclamar vehículo (si es necesario por lógica de negocio)
    try:
        requests.post(f"{VEHICLE_SERVICE}/{vehicle['id']}/claim", headers=headers)
    except:
        pass 

    # 2. Iniciar el viaje
    # 🟢 CORRECCIÓN: Agregamos scheduled_start_time
    trip_data = {
        "vehicle_id": vehicle['id'],
        "route_id": route_id,
        "driver_id": vehicle.get('driver_id') or "driver-simulado-id",
        "scheduled_start_time": datetime.utcnow().isoformat(), # 👈 ¡ESTO FALTABA!
        "status": "ACTIVE" # Nos aseguramos que nazca activo
    }
    
    try:
        r = requests.post(f"{TRIP_SERVICE}/", json=trip_data, headers=headers)
        if r.status_code in [200, 201]:
            data = r.json()
            print(f"   ✅ VIAJE INICIADO CORRECTAMENTE (ID: {data['id']})")
            print(f"   👉 ID del Vehículo (UUID): {vehicle['id']}")
            print(f"   👉 ID del Viaje (INT): {data['id']}")
            print("   ✨ ¡Ve al frontend y súbete al bus!")
        else:
            print(f"   ❌ Error iniciando viaje: {r.text}")
    except Exception as e:
        print(f"   ❌ Error conectando a Trip Service: {e}")

if __name__ == "__main__":
    print("🤖 INICIANDO SEMBRADO DE DATOS V2...")
    
    vehicles = create_vehicles()
    
    # Si no se crearon (porque ya existían), necesitamos buscarlos o usar lógica manual.
    # Pero si acabas de limpiar Docker, se crearán ahora.
    if vehicles:
        first_bus = vehicles[0]
        time.sleep(1)
        start_trip(first_bus)
    else:
        print("⚠️ No se crearon vehículos nuevos. Si ya existían, borra volúmenes para un clean start.")