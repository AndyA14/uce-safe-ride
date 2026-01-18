FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 1. Copiamos el requirements desde su ruta real (services/trip-service/...)
COPY services/trip-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copiamos la carpeta 'app' desde su ruta real
COPY services/trip-service/app ./app


COPY shared ./shared

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]