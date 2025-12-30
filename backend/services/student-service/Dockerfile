FROM python:3.11-slim

WORKDIR /app

# Copiamos requirements primero (cache eficiente)
COPY services/student-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código del microservicio
COPY services/student-service/app ./app

# COPIAMOS LA LIBRERÍA SHARED
COPY shared ./shared

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
