import { Router } from 'express';
import { z } from 'zod';
import { cualquierRol, soloAdministrador } from '../../middlewares/permitir.ts';
import { consulta, validar } from '../../middlewares/validar.ts';
import { fechaOpcional } from '../../utils/esquemas.ts';
import { usuarioDe } from '../../utils/peticion.ts';
import { listarAuditoria } from './auditoria.service.ts';

const filtro = z.object({
  usuarioId: z.coerce.number().int().positive().optional(),
  accion: z.string().optional(),
  entidad: z.string().optional(),
  desde: fechaOpcional,
  hasta: fechaOpcional,
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(25),
});
type Filtro = z.infer<typeof filtro>;

export const rutasAuditoria = Router();

/** Registro completo (solo administrador) */
rutasAuditoria.get('/', soloAdministrador, validar({ query: filtro }), async (req, res) => {
  res.json(await listarAuditoria(consulta<Filtro>(req)));
});

/** Actividad del propio usuario ("Mi actividad") */
rutasAuditoria.get('/mia', cualquierRol, validar({ query: filtro }), async (req, res) => {
  const f = consulta<Filtro>(req);
  res.json(await listarAuditoria({ ...f, usuarioId: usuarioDe(req).id }));
});
