# Cómo ejecutar el proyecto ShareIt

El proyecto está dividido en dos partes principales: el **backend** (servidor Node/Express) y el **frontend** (aplicación React con Vite). Dado que corren por separado, necesitarás abrir **dos terminales distintas** para iniciarlos simultáneamente.

## 1. Levantar el Backend

El backend se encarga de proveer la API del proyecto y en su configuración actual corre en el puerto 3000.

1. Abre una terminal.
2. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
3. Instala las dependencias (solo es necesario la primera vez de desarrollo o si se añaden nuevas librerías):
   ```bash
   npm install
   ```
4. Inicia el servidor. Puedes hacerlo de las siguientes maneras:
   - **Usando Node directamente:**
     ```bash
     node index.js
     ```
   - **Usando nodemon** (recomendado para desarrollo, ya que reinicia el servidor automáticamente al realizar cambios en el código):
     ```bash
     npx nodemon index.js
     ```

## 2. Levantar el Frontend

El frontend está construido con React y utiliza Vite como entorno de desarrollo.

1. Abre una **nueva terminal** (manteniendo abierta la del backend).
2. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias (necesario la primera vez):
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
5. La terminal te mostrará una URL local (típicamente `http://localhost:5173/`). Haz clic en el enlace o cópialo y ábrelo en tu navegador para ver la aplicación funcionando.

> **Nota importante:** Asegúrate siempre de tener el backend en ejecución antes de interactuar con el frontend si este necesita conectarse a la API, de lo contrario podrías experimentar errores de conexión.
