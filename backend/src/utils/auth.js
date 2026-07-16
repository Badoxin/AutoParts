import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

export function sanitizarUsuario(usuario) {
  const { contrasena, ...resto } = usuario;
  return resto;
}

export function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
