# Australiapp

Australiapp es una aplicación web para el seguimiento de presupuestos y gastos personales. El proyecto está dividido en un **backend** construido con Node.js/Express y un **frontend** usando React.

## Arquitectura
- **Backend**: Servidor Express con Sequelize ORM. Se conecta a una base de datos MySQL usando la configuración de un archivo `.env`. Las carpetas principales incluyen:
    - `config/` para la configuración de la base de datos.
    - `models/`, `services/`, `controllers/` y `routes/` implementando la API.
- **Frontend**: Todo el código de React vive ahora en `front/src`. Allí se
  organizan subcarpetas como `pages/`, `context/`, `hooks/` y `services/`.

El frontend se comunica con la API REST expuesta por el backend.

## Prerrequisitos
- [Node.js](https://nodejs.org/) y npm.
- Una instancia de MySQL en funcionamiento para la base de datos.

## Configuración
1. Instala las dependencias para el backend:
     ```bash
     cd back
     npm install
     ```
2. (Opcional) Instala dependencias adicionales en la raíz si es necesario:
     ```bash
     cd ..
     npm install
     ```
3. Crea un archivo `.env` en la raíz del proyecto con la configuración de tu base de datos:
     ```ini
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=myuser
     DB_PASS=mypassword
     DB_NAME=mydatabase
     ```

## Ejecutar el backend
Desde el directorio `back` ejecuta:
```bash
npm start
```
Esto inicia el servidor Express en el puerto **3000**.

## Ejecutar el frontend
Si tienes una configuración de React en el directorio `front`, ejecuta:
```bash
cd front
npm install
npm start    # o npm run dev
```
Esto lanza el servidor de desarrollo de React y se conecta a la API del backend.

## Variables de entorno
El backend lee los valores de conexión desde el archivo `.env` mostrado arriba. Ajústalos para que coincidan con tu instancia de MySQL. También puedes agregar otras opciones de ejecución a ese archivo según sea necesario.