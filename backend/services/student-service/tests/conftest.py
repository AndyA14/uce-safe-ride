import sys
import os

# 1. Añade 'student-service' al path (para que encuentre 'app')
directorio_servicio = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, directorio_servicio)

# 2. Añade la raíz 'backend' al path (para que encuentre 'shared')
# Sube 3 niveles: tests -> student-service -> services -> backend
directorio_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, directorio_backend)