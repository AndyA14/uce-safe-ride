#!/bin/sh

# Salir si hay error
set -e

# Ruta donde Nginx sirve los archivos
ROOT_DIR=/usr/share/nginx/html

# Recrear el archivo de configuración
echo "window._env_ = {" > $ROOT_DIR/env-config.js
echo "  VITE_API_URL: \"$VITE_API_URL\"," >> $ROOT_DIR/env-config.js
echo "  VITE_WS_URL: \"$VITE_WS_URL\"" >> $ROOT_DIR/env-config.js
echo "};" >> $ROOT_DIR/env-config.js

# Ejecutar el comando original (iniciar nginx)
exec "$@"