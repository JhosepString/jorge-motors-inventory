import { useMemo, useState } from 'react';
import { api } from '../../api';
import { TablaAuditoria } from '../../components/TablaAuditoria';
import { nombreAccion, nombreEntidad } from '../../utils/auditoria';
import { rangoLima } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';

export function Auditoria() {
  const [usuarioId, setUsuarioId] = useState('');
  const [accion, setAccion] = useState('');
  const [entidad, setEntidad] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const usuarios = useDatos(() => api.usuarios());

  const filtro = useMemo(() => ({
    usuarioId: usuarioId ? Number(usuarioId) : undefined,
    accion: accion || undefined,
    entidad: entidad || undefined,
    ...rangoLima(desde, hasta),
    pagina,
    porPagina: 25,
  }), [usuarioId, accion, entidad, desde, hasta, pagina]);
  const registros = useDatos(() => api.auditoria(filtro), [filtro]);

  const filtrar = <T,>(fijar: (v: T) => void) => (v: T) => {
    fijar(v);
    setPagina(1);
  };
  const limpiar = () => {
    setUsuarioId(''); setAccion(''); setEntidad(''); setDesde(''); setHasta(''); setPagina(1);
  };

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Auditoría</h1>
          <p>Todo lo que hace cada usuario queda registrado y no se puede editar ni borrar.</p>
        </div>
        <button type="button" className="boton boton--borde" onClick={registros.recargar}>Actualizar</button>
      </header>

      <section className="tarjeta" style={{ gap: 14 }}>
        <div className="rejilla" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          <div className="campo">
            <label htmlFor="a-usuario">Usuario</label>
            <select id="a-usuario" className="entrada" value={usuarioId} onChange={(e) => filtrar(setUsuarioId)(e.target.value)}>
              <option value="">Todos</option>
              {(usuarios.datos ?? []).map((u) => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="a-accion">Acción</label>
            <select id="a-accion" className="entrada" value={accion} onChange={(e) => filtrar(setAccion)(e.target.value)}>
              <option value="">Todas</option>
              {Object.entries(nombreAccion).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="a-entidad">Sobre</label>
            <select id="a-entidad" className="entrada" value={entidad} onChange={(e) => filtrar(setEntidad)(e.target.value)}>
              <option value="">Todo</option>
              {Object.entries(nombreEntidad).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="a-desde">Desde</label>
            <input id="a-desde" className="entrada" type="date" value={desde} onChange={(e) => filtrar(setDesde)(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="a-hasta">Hasta</label>
            <input id="a-hasta" className="entrada" type="date" value={hasta} onChange={(e) => filtrar(setHasta)(e.target.value)} />
          </div>
        </div>
        <div className="fila fila--fin">
          <button type="button" className="enlace-boton" onClick={limpiar}>Limpiar filtros</button>
        </div>
      </section>

      {registros.error && <div className="mensaje mensaje--error" role="alert">{registros.error}</div>}
      <TablaAuditoria pagina={registros.datos} onPagina={setPagina} />
    </>
  );
}
