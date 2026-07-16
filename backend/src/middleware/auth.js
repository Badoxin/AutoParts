import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.usuarioId = payload.id;
    req.usuarioRol = payload.rol;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}

// Solo deja pasar a usuarios con rol 'admin'.
export function verificarAdmin(req, res, next) {
  if (req.usuarioRol !== 'admin') {
    return res.status(403).json({ error: 'Solo la administradora puede acceder a esto' });
  }
  next();
}

// A diferencia de verificarToken, NUNCA rechaza la petición: si hay un token
// válido lo resuelve (req.usuarioId/req.usuarioRol quedan disponibles), y si
// no hay token o es inválido simplemente sigue como visitante anónimo.
// Se usa en /citas para permitir reservar con o sin cuenta.
export function identificarSiHayToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
      req.usuarioId = payload.id;
      req.usuarioRol = payload.rol;
    } catch {
      // token vencido o inválido: no truena, sigue como anónimo
    }
  }
  next();
}
