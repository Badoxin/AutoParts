-- ============================================================
-- Migración: agrega `categoria` a servicios y da de baja "Corte + barba"
-- convirtiéndolo en combinación (Corte con desvanecido + Barba) en vez de
-- ser un servicio aparte.
--
-- CÓMO CORRERLA: entra a tu base ya existente (dayandi_db) y ejecuta este
-- archivo completo, por ejemplo:
--   mysql -u tu_usuario -p dayandi_db < backend/db/migracion_categorias.sql
-- o pega el contenido en phpMyAdmin / la consola de MySQL de XAMPP.
--
-- No borra nada: los historiales de citas ya hechas con "Corte + barba"
-- se quedan intactos, solo deja de aparecer como opción nueva.
-- ============================================================

USE dayandi_db;

-- 1. Agrega la columna si todavía no existe.
ALTER TABLE `servicios`
  ADD COLUMN IF NOT EXISTS `categoria`
  ENUM('corte_hombre','corte_mujer','barba','color','exclusivo','otro')
  NOT NULL DEFAULT 'otro' AFTER `duracion`;

-- 2. Clasifica los servicios reales de Dayandi por nombre.
--    Ajusta aquí si algún nombre en tu base es ligeramente distinto.
UPDATE `servicios` SET `categoria` = 'corte_hombre' WHERE `nombre` = 'Corte con desvanecido';
UPDATE `servicios` SET `categoria` = 'corte_mujer'  WHERE `nombre` = 'Corte mujer';
UPDATE `servicios` SET `categoria` = 'barba'        WHERE `nombre` = 'Barba';
UPDATE `servicios` SET `categoria` = 'color'        WHERE `nombre` = 'Tinte';
UPDATE `servicios` SET `categoria` = 'exclusivo'    WHERE `nombre` IN ('Permanente', 'Peinado y maquillaje');

-- 3. "Corte + barba" deja de ofrecerse como opción (baja lógica, no se
--    borra): a partir de ahora se logra eligiendo Corte con desvanecido y
--    agregando Barba como adicional en la misma cita.
UPDATE `servicios` SET `activo` = 0 WHERE `nombre` = 'Corte + barba';

-- 4. Verificación rápida — deberías ver 6 servicios activos con su categoría.
-- SELECT id, nombre, categoria, activo FROM servicios ORDER BY categoria;
