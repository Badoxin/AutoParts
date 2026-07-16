-- ============================================================
-- Esquema de base de datos para el sistema de citas de Dayandi (estética).
-- Nombre de la base: dayandi_db (debe coincidir con DB_NAME en backend/.env)
--
-- Este negocio lo maneja UNA sola persona (la dueña), por lo que aquí ya
-- no existe el rol/tabla de "barbero": solo hay `cliente` y `admin`.
-- El horario y los servicios ya no están ligados a un barbero_id, sino
-- al negocio completo.
-- ============================================================

CREATE DATABASE IF NOT EXISTS dayandi_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dayandi_db;

-- --------------------------------------------------------
-- usuarios (clientes y el admin comparten esta tabla, se distinguen por `rol`)
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('cliente','admin') DEFAULT 'cliente',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- servicios (catálogo, editable — ver instrucciones al final)
-- `duracion` en minutos. Los servicios de Dayandi suelen ser más
-- tardados que un corte de barbería, así que no asumas nada corto.
--
-- `categoria` es la que permite validar qué se puede combinar en una
-- misma cita (ver backend/src/routes/citas.routes.js -> validarCombinacion
-- y src/app/pages/Citas.tsx -> reglasCombinacion):
--   'corte_hombre' — Corte con desvanecido (excluyente con corte_mujer)
--   'corte_mujer'  — Corte mujer          (excluyente con corte_hombre)
--   'barba'        — se puede sumar a cualquier corte, o ir sola
--   'color'        — Tinte: el único que permite llegar a 3 combinados
--   'exclusivo'    — Permanente, Peinado y maquillaje: no se combinan con nada
-- --------------------------------------------------------
CREATE TABLE `servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion` int(11) NOT NULL,
  `categoria` enum('corte_hombre','corte_mujer','barba','color','exclusivo','otro') NOT NULL DEFAULT 'otro',
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- horarios (bloques semanales recurrentes del negocio — ya no por barbero)
--
-- `tolerancia_cierre_min` es la "regla especial de horario": cuánto se
-- permite que una cita termine DESPUÉS de `hora_fin` del bloque.
-- Ej. bloque mañana 9:00–13:00 con tolerancia 30 → se aceptan citas que
-- terminen hasta la 13:30. Bloque tarde 16:00–20:00 con tolerancia 30 →
-- se aceptan hasta las 20:30.
-- --------------------------------------------------------
CREATE TABLE `horarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dia_semana` tinyint(4) NOT NULL COMMENT '0=domingo ... 6=sábado',
  `nombre_bloque` varchar(50) DEFAULT NULL COMMENT 'ej. "Mañana", "Tarde" — solo informativo',
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tolerancia_cierre_min` int(11) NOT NULL DEFAULT 30,
  PRIMARY KEY (`id`),
  KEY `dia_semana` (`dia_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- dias_cerrados (bloqueos puntuales por fecha: día festivo, ausencia,
-- comida, etc. — reemplaza a la tabla `descansos` de barbero).
-- Si `hora_inicio`/`hora_fin` van NULL, se entiende el día completo cerrado.
-- Si llevan valor, solo se bloquea ese rango dentro del día (ej. la comida).
-- --------------------------------------------------------
CREATE TABLE `dias_cerrados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `motivo` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- citas
--
-- `hora_fin` se guarda calculada (suma de duraciones de los servicios
-- elegidos) para no tener que recalcular en cada consulta de disponibilidad.
-- `expira_en` se fija al crear la pre-reserva (creado_en + 45 min); un
-- proceso "al vuelo" (no un cron aparte) marca como `expirada` cualquier
-- cita `pendiente` cuyo `expira_en` ya pasó, cada vez que se consulta
-- disponibilidad o el panel de admin.
-- --------------------------------------------------------
CREATE TABLE `citas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `nombre_cliente` varchar(100) NOT NULL COMMENT 'por si reserva sin cuenta / o snapshot del nombre',
  `telefono_cliente` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `estado` enum('pendiente','confirmada','rechazada','expirada') DEFAULT 'pendiente',
  `comentarios` text DEFAULT NULL,
  `expira_en` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `fecha` (`fecha`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- cita_servicios (N:M — el cliente puede elegir varios servicios en
-- una misma cita; el sistema suma sus duraciones).
--
-- `precio_en_cita` y `duracion_en_cita` son un snapshot al momento de
-- reservar, para que si luego cambias precios/duración en `servicios`
-- no se altere el historial de citas ya hechas.
-- --------------------------------------------------------
CREATE TABLE `cita_servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cita_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `precio_en_cita` decimal(10,2) NOT NULL,
  `duracion_en_cita` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `cita_servicios_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cita_servicios_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- mensajes_contacto (mensajes enviados desde el formulario de Contacto)
-- --------------------------------------------------------
CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Servicios reales de Dayandi. "Corte + barba" YA NO es un servicio aparte:
-- ahora es Corte con desvanecido + el adicional de Barba en la misma cita
-- (ver reglas de combinación arriba). Si tu base ya tenía un servicio
-- "Corte + barba" activo, corre backend/db/migracion_categorias.sql para
-- darlo de baja sin perder el historial de citas ya hechas con él.
-- ============================================================
INSERT INTO `servicios` (`nombre`, `precio`, `duracion`, `categoria`) VALUES
('Corte con desvanecido', 150.00, 90, 'corte_hombre'),
('Corte mujer', 150.00, 20, 'corte_mujer'),
('Barba', 50.00, 20, 'barba'),
('Tinte', 450.00, 60, 'color'),
('Permanente', 500.00, 120, 'exclusivo'),
('Peinado y maquillaje', 400.00, 40, 'exclusivo');

-- ============================================================
-- Horario de ejemplo (EDITA con los días/horas reales). Se repite cada
-- semana. dia_semana: 0=domingo, 1=lunes ... 6=sábado.
-- Este ejemplo cubre lunes a sábado, mañana y tarde, cerrado domingo.
-- ============================================================
INSERT INTO `horarios` (`dia_semana`, `nombre_bloque`, `hora_inicio`, `hora_fin`, `tolerancia_cierre_min`) VALUES
(1, 'Mañana', '09:00:00', '13:00:00', 30), (1, 'Tarde', '16:00:00', '20:00:00', 30),
(2, 'Mañana', '09:00:00', '13:00:00', 30), (2, 'Tarde', '16:00:00', '20:00:00', 30),
(3, 'Mañana', '09:00:00', '13:00:00', 30), (3, 'Tarde', '16:00:00', '20:00:00', 30),
(4, 'Mañana', '09:00:00', '13:00:00', 30), (4, 'Tarde', '16:00:00', '20:00:00', 30),
(5, 'Mañana', '09:00:00', '13:00:00', 30), (5, 'Tarde', '16:00:00', '20:00:00', 30),
(6, 'Mañana', '09:00:00', '13:00:00', 30), (6, 'Tarde', '16:00:00', '20:00:00', 30);

-- ============================================================
-- CÓMO DAR DE ALTA A LA ADMINISTRADORA
-- ============================================================
-- No hay pantalla de registro para "admin" (por seguridad): se promueve
-- a mano una sola vez, la primera vez que se pone en marcha el sitio.
--
-- 1. Regístrate normal desde la página como si fueras cliente
--    (nombre, correo, contraseña) en /citas o con el modal de login.
-- 2. Busca tu usuario y anota su id:
--      SELECT id, nombre, correo FROM usuarios WHERE correo = 'tu_correo@ejemplo.com';
-- 3. Promuévelo a admin:
--      UPDATE usuarios SET rol = 'admin' WHERE id = <ID_DEL_PASO_2>;
-- 4. Vuelve a iniciar sesión en la página; en el menú de usuario ya
--    debería aparecer "Panel de Administrador" (ruta /admin).
-- 5. Desde ahí se revisan las citas pendientes (aceptar/rechazar) y los
--    mensajes del formulario de Contacto.
