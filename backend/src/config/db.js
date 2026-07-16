import mysql from 'mysql2';

// Todos estos valores se toman de backend/.env — no hay nada hardcodeado aquí.
// Para cambiar de base de datos (nombre, usuario, host, etc.) solo edita el .env.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dayandi_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // fuerza que DATE/DATETIME/TIMESTAMP salgan como "2026-07-15" en vez de Date object
}).promise();
