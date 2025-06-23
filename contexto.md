# CONTEXTO

## Objetivo de la aplicación
Desarrollar un sistema web de control de gastos y presupuestos que permita:
- Asignar presupuestos mensuales por categoría.
- Registrar gastos reales con selección de divisa.
- Visualizar en un dashboard la comparación presupuesto vs. gasto.
- Configurar alertas al alcanzar un umbral (p. ej. 80% del presupuesto) en las categorías deseadas.
- Ofrecer un único login con contraseña (usuarios “hardcodeados”: papá y yo).

## Historias de usuario clave
1. **Autenticación sencilla**  
   Como usuario autorizado, quiero ingresar una contraseña para acceder al sistema. Esta contraseña se guardará en la base de datos como un hash.

2. **Gestión de categorías y presupuestos**  
   - Crear categorías de gasto (p. ej. “Alimentos”, “Transporte”).  
   - Asignar un presupuesto mensual a cada categoría.  
   - Editar o eliminar presupuestos o categorías.  
   - Ver la lista de todos los presupuestos activos y el total asignado.

3. **Registro y gestión de gastos**  
   - Registrar un gasto con monto, categoría, fecha, descripción y divisa.  
   - Editar o eliminar un gasto registrado.  
   - Marcar un gasto como recurrente (mensual o semanal).

4. **Visualización e informes**  
   - Dashboard con gráficos (torta, líneas, barras) que comparen presupuesto vs. gasto real por categoría.  
   - Filtrar transacciones por rango de fechas, categorías, montos o divisa.  
   - Seleccionar la divisa de visualización del dashboard.  
   - Consultar historial de presupuestos y gastos de meses anteriores.

5. **Alertas y notificaciones**  
   - Elegir en qué categorías deseo recibir alertas al alcanzar el 80 % del presupuesto.  
   - Recibir una alerta cuando se alcance el umbral configurado.

6. **Revisores**  
   - Como usuario, quiero **asignar uno o varios revisores** (otros usuarios) que **solo puedan ver** mis gastos y estadísticas, sin permiso para modificarlos.

## Modelo de datos (tablas y relaciones)
{
  "usuarios": [
    {"field": "id", "type": "INT", "pk": true, "fk": false, "nullable": false, "description": "Identificador único de usuario"},
    {"field": "username", "type": "VARCHAR(50)", "pk": false, "fk": false, "nullable": false, "description": "Nombre de usuario"},
    {"field": "password_hash", "type": "VARCHAR(255)", "pk": false, "fk": false, "nullable": false, "description": "Hash de la contraseña"},
    {"field": "default_currency_code", "type": "CHAR(3)", "pk": false, "fk": true, "nullable": false, "fk_ref": "divisas.code", "description": "Divisa por defecto"}
  ],
  "categorias": [
    {"field": "id", "type": "INT", "pk": true, "fk": false, "nullable": false, "description": "Identificador único de categoría"},
    {"field": "name", "type": "VARCHAR(100)", "pk": false, "fk": false, "nullable": false, "description": "Nombre de la categoría"},
    {"field": "description", "type": "VARCHAR(255)", "pk": false, "fk": false, "nullable": true, "description": "Descripción opcional"}
  ],
  "presupuestos": [
    {"field": "id", "type": "INT", "pk": true, "fk": false, "nullable": false, "description": "ID de presupuesto"},
    {"field": "category_id", "type": "INT", "pk": false, "fk": true, "nullable": false, "fk_ref": "categorias.id", "description": "Categoría asociada"},
    {"field": "amount", "type": "DECIMAL(12,2)", "pk": false, "fk": false, "nullable": false, "description": "Monto asignado"},
    {"field": "currency_code", "type": "CHAR(3)", "pk": false, "fk": true, "nullable": false, "fk_ref": "divisas.code", "description": "Divisa del presupuesto"},
    {"field": "period_month", "type": "TINYINT", "pk": false, "fk": false, "nullable": false, "description": "Mes (1-12)"},
    {"field": "period_year", "type": "SMALLINT", "pk": false, "fk": false, "nullable": false, "description": "Año"},
    {"field": "recurring", "type": "BOOLEAN", "pk": false, "fk": false, "nullable": false, "description": "Repetición mensual"},
    {"field": "recurrence_end_date", "type": "DATE", "pk": false, "fk": false, "nullable": true, "description": "Fecha fin de recurrencia"}
  ],
  "gastos": [
    {"field": "id", "type": "INT", "pk": true, "fk": false, "nullable": false, "description": "ID de gasto"},
    {"field": "amount", "type": "DECIMAL(12,2)", "pk": false, "fk": false, "nullable": false, "description": "Monto del gasto"},
    {"field": "currency_code", "type": "CHAR(3)", "pk": false, "fk": true, "nullable": false, "fk_ref": "divisas.code", "description": "Divisa del gasto"},
    {"field": "category_id", "type": "INT", "pk": false, "fk": true, "nullable": false, "fk_ref": "categorias.id", "description": "Categoría asociada"},
    {"field": "date", "type": "DATE", "pk": false, "fk": false, "nullable": false, "description": "Fecha de gasto"},
    {"field": "description", "type": "VARCHAR(255)", "pk": false, "fk": false, "nullable": true, "description": "Descripción opcional"},
    {"field": "recurring", "type": "BOOLEAN", "pk": false, "fk": false, "nullable": false, "description": "Gasto recurrente"},
    {"field": "recurrence_type", "type": "ENUM('weekly','monthly')", "pk": false, "fk": false, "nullable": true, "description": "Tipo de recurrencia"},
    {"field": "recurrence_end_date", "type": "DATE", "pk": false, "fk": false, "nullable": true, "description": "Fin de recurrencia"}
  ],
  "alertas": [
    {"field": "id", "type": "INT", "pk": true, "fk": false, "nullable": false, "description": "ID de alerta"},
    {"field": "user_id", "type": "INT", "pk": false, "fk": true, "nullable": false, "fk_ref": "usuarios.id", "description": "Usuario configurador"},
    {"field": "category_id", "type": "INT", "pk": false, "fk": true, "nullable": false, "fk_ref": "categorias.id", "description": "Categoría de alerta"},
    {"field": "threshold_percentage", "type": "DECIMAL(5,2)", "pk": false, "fk": false, "nullable": false, "description": "Porcentaje umbral"}
  ],
  "divisas": [
    {"field": "code", "type": "CHAR(3)", "pk": true, "fk": false, "nullable": false, "description": "Código ISO"},
    {"field": "name", "type": "VARCHAR(50)", "pk": false, "fk": false, "nullable": false, "description": "Nombre de divisa"},
    {"field": "value", "type": "DECIMAL(12,4)", "pk": false, "fk": false, "nullable": false, "description": "Valor en MXN por unidad de la divisa"}
  ],
  "usuario_revisores": [
    {"field": "user_id", "type": "INT", "pk": true, "fk": true, "nullable": false, "fk_ref": "usuarios.id", "description": "Usuario propietario"},
    {"field": "reviewer_id", "type": "INT", "pk": true, "fk": true, "nullable": false, "fk_ref": "usuarios.id", "description": "Usuario revisor"}
  ]
}

Relaciones principales:
- usuarios 1—∞ alertas  
- usuarios ∞—1 divisas (divisa por defecto)  
- usuarios 1—∞ usuario_revisores (user_id → reviewer_id)  
- usuarios 0—∞ usuario_revisores inverso (revisor que ve muchos usuarios)  
- categorías 1—∞ presupuestos  
- categorías 1—∞ gastos  
- categorías 1—∞ alertas  
- divisas 1—∞ gastos  

## Arquitectura del proyecto

### Frontend (React + Tailwind CSS)
- **src/index.jsx**: Punto de entrada y montaje de la aplicación.  
- **src/App.jsx**: Componente raíz que gestiona rutas y contexto global.  
- **components/**: UI atómica y compuesta (CategoryList, BudgetForm, ExpenseForm, Dashboard, AlertSettings).  
- **pages/**: Vistas principales (LoginPage, HomePage, SettingsPage).  
- **hooks/**: Lógica de captura de datos y manejo de estado (useAuth, useCategories, useBudgets, useExpenses, useAlerts).  
- **context/**: Providers para autenticación y datos globales (AuthContext, DataContext).  
- **services/api.js**: Cliente HTTP para comunicarse con el backend.  
- **utils/**: Funciones de ayuda (formatDate, currencyConverter).  
- **tailwind.config.js**: Configuración de la biblioteca de estilos.

### Backend (Node.js + Express + Sequelize)
- **index.js**: Inicializa Express, carga middlewares y arranca servidor.  
- **config/index.js**: Configuración de Sequelize y conexión a la base de datos (lectura de .env).  
- **models/**: Definición de los modelos Sequelize (usuario.model.js, categoria.model.js, presupuesto.model.js, gasto.model.js, alerta.model.js, divisa.model.js).  
- **controllers/**: Controladores HTTP para cada entidad (auth.controller.js, categorias.controller.js, presupuestos.controller.js, gastos.controller.js, alertas.controller.js).  
- **services/**: Lógica de negocio y orquestación de modelo (auth.service.js, categoria.service.js, presupuesto.service.js, gasto.service.js, alerta.service.js).  
- **routes/**: Rutas Express separadas por recurso (auth.routes.js, categorias.routes.js, presupuestos.routes.js, gastos.routes.js, alertas.routes.js).  
- **middlewares/**: Funciones de chequeo y manejo de errores (auth.middleware.js, error.handler.js).

### Comunicación
- El frontend consume la API REST del backend a través de servicios HTTP (api.js).  
- Se utiliza un túnel SSH o conexión directa a MySQL para la persistencia de datos.  
- La aplicación emplea async/await en Node.js, sin callbacks, y Sequelize para manejar la base de datos.  