import type { RequestHandler } from 'express';
import multer from 'multer';
import { HttpError } from './errorHandler.js';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1, fields: 5, fieldSize: 2_000 },
});

/** Recibe un formulario con un archivo opcional en el campo "photo" y traduce los errores de multer. */
export const uploadPhoto: RequestHandler = (req, res, next) => {
  upload.single('photo')(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'La foto no puede pesar más de 5 MB.'
          : 'El formulario enviado no es válido.';
      next(new HttpError(400, message));
      return;
    }
    next(error);
  });
};
