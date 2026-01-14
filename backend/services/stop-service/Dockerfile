# Dockerfile en services/stop-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copiar requirements
COPY services/stop-service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copiar código
COPY services/stop-service/app /app/app
COPY shared /app/shared

# PYTHONPATH
ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
