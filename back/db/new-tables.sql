-- Tablas nuevas de Australiapp. El backend las crea solo al arrancar
-- (npm start / npm run migrate). Este archivo es para crearlas a mano si
-- el usuario de MySQL de la app no tiene permiso CREATE.
-- Seguro de ejecutar varias veces: no modifica ni borra tablas existentes.

CREATE TABLE IF NOT EXISTS `ingresos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency_code` VARCHAR(3) NOT NULL,
  `period_month` INT NOT NULL,
  `period_year` INT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ingresos_period_year_period_month` (`period_year`, `period_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `divisas_historial` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(3) NOT NULL,
  `date` DATE NOT NULL,
  `value` DECIMAL(12,4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `divisas_historial_code_date` (`code`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
