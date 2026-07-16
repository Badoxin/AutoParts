import multer from 'multer';

// Manejo de errores de subida de archivos (tamaño excedido, tipo inválido, etc.)
export function manejarErroresDeSubida(err, req, res, next) {
  if (err instanceof multer.MulterError || err?.message === 'Solo se permiten imágenes') {
    return res.status(400).json({
      error: err.message === 'File too large' ? 'La imagen pesa demasiado (máx. 8MB)' : err.message,
    });
  }
  next(err);
}
