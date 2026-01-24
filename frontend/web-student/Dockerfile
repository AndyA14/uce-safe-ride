# ==========================================
# ETAPA 1: Construcción
# ==========================================
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
COPY . .
RUN bun run build

# ==========================================
# ETAPA 2: Producción
# ==========================================
FROM nginx:alpine

# Instalar bash (opcional, sh suele bastar pero bash es mas seguro)
RUN apk add --no-cache bash

# Copiar build de React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx (el archivo que creamos antes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar y preparar el script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Definir el script como ENTRYPOINT
ENTRYPOINT ["/docker-entrypoint.sh"]

# El comando por defecto sigue siendo arrancar Nginx
CMD ["nginx", "-g", "daemon off;"]