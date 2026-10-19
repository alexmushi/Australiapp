// Zona horaria con desfase negativo: es donde fallaba la asignación de meses
// (un gasto del 1 de julio aparecía en junio). Los tests deben pasar igual.
process.env.TZ = 'America/Mexico_City';
