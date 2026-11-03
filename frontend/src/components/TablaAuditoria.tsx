import { Fragment, useState } from 'react';
import type { PaginaAuditoria } from '../api';
import { nombreRol } from '../auth/sesion';
import { nombreAccion, nombreEntidad } from '../utils/auditoria';
import { fechaHora } from '../utils/formato';

function claseAccion(accion: string): string {
  if (accion === 'LOGIN_FALLIDO' || accion === 'DESACTIVAR') return 'chip--error';
  if (accion.startsWith('LOGIN') || accion === 'LOGOUT') return 'chip--neutro';
  if (accion === 'REGISTRAR_SALIDA' || accion === 'REGISTRAR_ENTRADA') return 'chip--azul';
  if (accion.includes('ALERTA')) return 'chip--aviso';
  return 'chip--ok';
}

function texto(v: unknown): string {
  if (v === undefined) return '';
  if (v === null) return '—';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

/** Muestra campo por campo el valor antes y después, resaltando lo que cambió */
function Detalle({ antes, despues }: { antes: unknown; despues: unknown }) {
  const a = (antes ?? {}) as Record<string, unknown>;
  const d = (despues ?? {}) as Record<string, unknown>;
  const campos = [...new Set([...Object.keys(a), ...Object.keys(d)])];
  const cambiados = campos.filter((c) => texto(a[c]) !== texto(d[c]));
  const [todo, setTodo] = useState(false);
  const visibles = todo || antes == null || despues == null ? campos : cambiados;

  return (
    <>
      <table className="cambios">
        <thead><tr><th>Campo</th>{antes != null && <th>Antes</th>}{despues != null && <th>Después</th>}</tr></thead>
        <tbody>
          {visibles.map((c) => (
            <tr key={c} className={antes != null && despues != null && cambiados.includes(c) ? 'cambiado' : undefined}>
              <td className="mono">{c}</td>
              {antes != null && <td>{texto(a[c])}</td>}
              {despues != null && <td>{texto(d[c])}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {antes != null && despues != null && campos.length > cambiados.length && (
        <button type="button" className="enlace-boton" style={{ minHeight: 30, fontSize: 13 }} onClick={() => setTodo((v) => !v)}>
          {todo ? 'Ver solo lo que cambió' : `Ver todos los campos (${campos.length})`}
        </button>
      )}
    </>
  );
}

interface Props {
  pagina: PaginaAuditoria | null;
  mostrarUsuario?: boolean;
  onPagina: (n: number) => void;
}

/** Tabla de auditoría con detalle (valor anterior / nuevo) desplegable y paginación */
export function TablaAuditoria({ pagina, mostrarUsuario = true, onPagina }: Props) {
  const [abierto, setAbierto] = useState<number | null>(null);
  const registros = pagina?.registros ?? [];
  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.total / pagina.porPagina)) : 1;
  const columnas = mostrarUsuario ? 6 : 5;

  return (
    <>
      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              {mostrarUsuario && <th>Usuario</th>}
              <th>Acción</th><th>Sobre</th><th>Descripción</th><th>IP</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r) => {
              const conDetalle = r.valorAnterior != null || r.valorNuevo != null;
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaHora(r.fecha)}</td>
                    {mostrarUsuario && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.usuario ?? 'Sistema'}</div>
                        <div className="suave" style={{ fontSize: 12.5 }}>{r.rol ? nombreRol[r.rol] : 'Proceso automático'}</div>
                      </td>
                    )}
                    <td><span className={`chip ${claseAccion(r.accion)}`}>{nombreAccion[r.accion] ?? r.accion}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{nombreEntidad[r.entidad] ?? r.entidad}{r.entidadId != null && <span className="suave"> #{r.entidadId}</span>}</td>
                    <td>
                      {r.descripcion}
                      {conDetalle && (
                        <div>
                          <button type="button" className="enlace-boton" style={{ minHeight: 28, fontSize: 13 }}
                            aria-expanded={abierto === r.id} onClick={() => setAbierto(abierto === r.id ? null : r.id)}>
                            {abierto === r.id ? 'Ocultar detalle' : 'Ver detalle'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="mono" style={{ fontSize: 12.5 }}>{r.ip ?? '—'}</td>
                  </tr>
                  {abierto === r.id && (
                    <tr>
                      <td colSpan={columnas} style={{ background: 'var(--fondo-tabla)' }}>
                        <Detalle antes={r.valorAnterior} despues={r.valorNuevo} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {!pagina && <div className="cargando">Cargando registros…</div>}
        {pagina?.total === 0 && <p className="tabla__vacio">No hay registros con ese filtro.</p>}
      </div>
      {pagina && pagina.total > 0 && (
        <nav className="paginacion" aria-label="Paginación">
          <span>{pagina.total} registros · página {pagina.pagina} de {totalPaginas}</span>
          <button type="button" className="boton boton--borde boton--chico" disabled={pagina.pagina <= 1} onClick={() => onPagina(pagina.pagina - 1)}>Anterior</button>
          <button type="button" className="boton boton--borde boton--chico" disabled={pagina.pagina >= totalPaginas} onClick={() => onPagina(pagina.pagina + 1)}>Siguiente</button>
        </nav>
      )}
    </>
  );
}
