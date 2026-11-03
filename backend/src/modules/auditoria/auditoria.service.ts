// Auditoría: los módulos publican ACCION_REGISTRADA y este suscriptor la guarda (Observer)
import type { Request } from 'express';
import { prisma } from '../../db/prisma.ts';
import type { AccionRegistrada, BusEventos } from '../../events/bus.ts';
import { eventos } from '../../events/bus.ts';
import { ipDe, num } from '../../utils/peticion.ts';

type DatosAccion = Omit<AccionRegistrada, 'usuarioId' | 'rol' | 'ip'>;

/** Publica una acción del usuario de la sesión para que quede en auditoría */
export function auditar(req: Request, datos: DatosAccion): void {
  eventos.publicar('ACCION_REGISTRADA', {
    ...datos,
    usuarioId: req.usuario?.id ?? null,
    rol: req.usuario?.rol ?? null,
    ip: ipDe(req),
  });
}

const json = (valor: unknown) => (valor === undefined || valor === null ? null : JSON.stringify(valor));

export function suscribirAuditoria(bus: BusEventos): void {
  bus.suscribir('ACCION_REGISTRADA', async (a) => {
    await prisma.auditoria.create({
      data: {
        usuarioId: a.usuarioId,
        rol: a.rol,
        accion: a.accion,
        entidad: a.entidad,
        entidadId: a.entidadId ?? null,
        descripcion: a.descripcion.slice(0, 300),
        valorAnterior: json(a.valorAnterior),
        valorNuevo: json(a.valorNuevo),
        ip: a.ip ?? null,
      },
    });
  });
}

export interface FiltroAuditoria {
  usuarioId?: number;
  accion?: string;
  entidad?: string;
  desde?: Date;
  hasta?: Date;
  pagina: number;
  porPagina: number;
}

export async function listarAuditoria(f: FiltroAuditoria) {
  const where = {
    usuarioId: f.usuarioId,
    accion: f.accion,
    entidad: f.entidad,
    fecha: f.desde || f.hasta ? { gte: f.desde, lt: f.hasta } : undefined,
  };
  const [total, filas] = await Promise.all([
    prisma.auditoria.count({ where }),
    prisma.auditoria.findMany({
      where,
      include: { usuario: { select: { nombres: true, apellidos: true } } },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      skip: (f.pagina - 1) * f.porPagina,
      take: f.porPagina,
    }),
  ]);
  return {
    total,
    pagina: f.pagina,
    porPagina: f.porPagina,
    registros: filas.map((r) => ({
      id: num(r.id),
      fecha: r.fecha.toISOString(),
      usuarioId: r.usuarioId,
      usuario: r.usuario ? `${r.usuario.nombres} ${r.usuario.apellidos}` : null,
      rol: r.rol,
      accion: r.accion,
      entidad: r.entidad,
      entidadId: r.entidadId,
      descripcion: r.descripcion,
      valorAnterior: r.valorAnterior ? JSON.parse(r.valorAnterior) : null,
      valorNuevo: r.valorNuevo ? JSON.parse(r.valorNuevo) : null,
      ip: r.ip,
    })),
  };
}
