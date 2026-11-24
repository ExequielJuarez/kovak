-- Estructura de la base de Kovak Automotores (MySQL 8 / MariaDB 10.4+)
-- La crea `npm run db:instalar`. ATENCIÓN: borra las tablas si ya existen.

CREATE DATABASE IF NOT EXISTS kovak_automotores CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kovak_automotores;
SET time_zone = '-03:00';

DROP TABLE IF EXISTS consultas;
DROP TABLE IF EXISTS vehiculo_imagenes;
DROP TABLE IF EXISTS vehiculos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  usuario VARCHAR(60) NOT NULL,
  clave VARCHAR(100) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vehiculos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  segmento VARCHAR(40) NOT NULL,
  condicion VARCHAR(40) NOT NULL DEFAULT 'Usado Seleccionado',
  km INT UNSIGNED NOT NULL DEFAULT 0,
  transmision VARCHAR(30) NOT NULL,
  combustible VARCHAR(30) NOT NULL,
  precio INT UNSIGNED NOT NULL,
  descripcion TEXT NULL,
  destacado TINYINT(1) NOT NULL DEFAULT 0,
  publicado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculos_slug (slug),
  KEY ix_vehiculos_marca (marca),
  KEY ix_vehiculos_publicado (publicado, destacado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vehiculo_imagenes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehiculo_id INT UNSIGNED NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_imagenes_vehiculo (vehiculo_id, orden),
  CONSTRAINT fk_imagenes_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consultas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  vehiculo_id INT UNSIGNED NULL,
  nombre VARCHAR(80) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  motivo VARCHAR(160) NOT NULL,
  mensaje VARCHAR(500) NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_consultas_leida (leida, creado_en),
  CONSTRAINT fk_consultas_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
