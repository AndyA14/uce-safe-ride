# Base
FROM python:3.11-slim

# Carpeta de trabajo
WORKDIR /app

# Dependencias del sistema
RUN apt-get update && \
    apt-get install -y gcc build-essential libffi-dev && \
    rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY services/notification-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código compartido si existe
COPY shared ./shared

# Copiar código de la aplicación
COPY services/notification-service/app ./app

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/app

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
