# TODO

- [x] Si se pasa el presupuesto por dos meses seguidos, agregar una alerta cuando se esté registrando una compra con ese rubro.
  (Ahora con el fondo único del 50%: al registrar un gasto se avisa si los dos meses anteriores se excedió, con lo que sumó esa categoría.)
- [x] Módulo de notificaciones (campana: falta el ingreso, 80% usado, excedido, gasto acelerado, dos meses excedidos)
- [x] Módulo de revisor (cuentas de solo lectura; la API exige sesión y bloquea cambios de revisores)
- [x] Checar si mi método de divisas es correcto: Si en un futuro el AUD cuesta 1 MXN, no joderá mi historial?
  (Sí lo habría hecho. Ahora cada gasto/ingreso usa el tipo de cambio de su fecha.)
- [x] CRUD de presupuestos (reemplazado por ingresos: crear, ver, editar y eliminar)
- [x] Poder ver un histórico de las tablas (gráfica de barras por mes de la categoría elegida; clic en un mes abre su detalle)
- [x] Checar bug: Registré un gasto el 1 de julio y me lo marcó como parte de junio
- [x] Página HTTPS
- [x] Agregar vista de calendario en fecha de registro gasto
- [x] Mostrar nombre de gasto en vez de "Gasto 1"
- [x] Que NADIE pueda hacer cambios sin la contraseña
- [x] Agilizar modales de estatus
- [x] Recordar selección de categoría en registrar gasto
- [x] Agregar tabla de rubros al elegir categorías (tabla de categorías con gasto del mes, editar y eliminar)
- [x] Barra de progreso del mes (marca del día en la barra y cuánto gastar por día)
- [x] Agregar barra de porcentaje
- [x] Despliegue con respaldos semanales
- [x] Usar modales de confirmación/error
- [x] Validación de campos
- [x] Agregar feature: pago dividido entre dos
- [x] Agregar vista de "Seleccionar mes"
- [x] Agregar selección de categorías que se quieren ver
- [x] Eliminar duplicate entries al darle clic dos veces al botón de registrar gasto
- [x] Bug: Cuando una categoría no tiene presupuesto y se registra más de un gasto, no se visualiza en el pie chart
