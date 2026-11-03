/** Error con código HTTP y mensaje para el usuario */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}

export const solicitudInvalida = (mensaje: string) => new HttpError(400, mensaje);
export const noAutenticado = (mensaje = 'Inicia sesión para continuar.') => new HttpError(401, mensaje);
export const prohibido = (mensaje = 'Tu rol no tiene permiso para esta acción.') => new HttpError(403, mensaje);
export const noEncontrado = (mensaje: string) => new HttpError(404, mensaje);
export const conflicto = (mensaje: string) => new HttpError(409, mensaje);
