// Eslabón 3 de la cadena: valida body, query y params con Zod antes de llegar al controlador
import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

interface Esquemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

export function validar(esquemas: Esquemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.validado = {
      body: esquemas.body ? esquemas.body.parse(req.body ?? {}) : undefined,
      query: esquemas.query ? esquemas.query.parse(req.query) : undefined,
      params: esquemas.params ? esquemas.params.parse(req.params) : undefined,
    };
    next();
  };
}

/** Lee los datos ya validados con su tipo */
export const cuerpo = <T>(req: Request) => req.validado?.body as T;
export const consulta = <T>(req: Request) => req.validado?.query as T;
export const parametros = <T>(req: Request) => req.validado?.params as T;
