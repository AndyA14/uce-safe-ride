# ==========================================
# ETAPA 1: Construcción
# ==========================================
FROM oven/bun:1 as builder

WORKDIR /app

# 1. Copiar los archivos de dependencias
COPY package.json bun.lockb ./

# 2. ¡Esta es la línea que faltaba!
# Ejecutamos `bun install` sin `--frozen-lockfile` para que arregle el bun.lockb automáticamente
RUN bun install

# 3. Copiar el resto del código
COPY . .

# 4. Construir la aplicación (y encontrará 'vite' porque ya instalamos las dependencias)
RUN bun run build

# ==========================================
# ETAPA 2: Producción
# ==========================================
FROM nginx:alpine

# Instalar bash (opcional, pero recomendable por seguridad)
RUN apk add --no-cache bash

# Copiar los archivos de la build de React al contenedor de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar y preparar el script de entrada
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer el puerto 80 para la aplicación
EXPOSE 80

# Definir el script como ENTRYPOINT
ENTRYPOINT ["/docker-entrypoint.sh"]

# El comando por defecto es iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
