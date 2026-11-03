import { api } from '../../api';
import type { Alerta, EstadoAlerta } from '../../api';
import { fechaCorta, nombreCanal } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';

const columnas: { estado: EstadoAlerta; titulo: string; ayuda: string }[] = [
  { estado: 'PENDIENTE', titulo: 'Pendientes', ayuda: 'Detectadas, aún sin avisar al proveedor' },
  { estado: 'ENVIADA', titulo: 'Enviadas', ayuda: 'Proveedor avisado, esperando reposición' },
  { estado: 'ATENDIDA', titulo: 'Atendidas', ayuda: 'Reposición recibida' },
];

export function Alertas() {
  const alertas = useDatos(() => api.alertas());
  const bandeja = useDatos(() => api.bandeja());
  const envio = useEnvio();

  const actuar = async (a: Alerta, accion: 'enviar' | 'atender') => {
    const ok = await envio.ejecutar(() => (accion === 'enviar' ? api.enviarAlerta(a.id) : api.atenderAlerta(a.id)));
    if (ok) {
      alertas.recargar();
      bandeja.recargar();
    }
  };

  const lista = alertas.datos ?? [];

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Alertas de bajo stock</h1>
          <p>Se generan solas cuando una salida deja un repuesto por debajo del mínimo. Cada alerta solo ofrece la acción que su estado permite.</p>
        </div>
        <button type="button" className="boton boton--borde" onClick={() => { alertas.recargar(); bandeja.recargar(); }}>Actualizar</button>
      </header>

      {(alertas.error ?? envio.error) && <div className="mensaje mensaje--error" role="alert">{alertas.error ?? envio.error}</div>}
      {alertas.cargando && !alertas.datos && <div className="cargando">Cargando alertas…</div>}

      <div className="tablero">
        {columnas.map((c) => {
          const delEstado = lista.filter((a) => a.estado === c.estado);
          return (
            <section key={c.estado} className="tablero__columna" aria-labelledby={`col-${c.estado}`}>
              <div>
                <div className="tablero__titulo">
                  <span id={`col-${c.estado}`}>{c.titulo}</span>
                  <span className="chip chip--neutro">{delEstado.length}</span>
                </div>
                <div className="suave" style={{ fontSize: 13 }}>{c.ayuda}</div>
              </div>
              {delEstado.length === 0 && <p className="suave" style={{ margin: 0, fontSize: 14 }}>Sin alertas.</p>}
              {delEstado.map((a) => (
                <article key={a.id} className="alerta">
                  <div className="fila" style={{ justifyContent: 'space-between' }}>
                    <span className="mono" style={{ fontSize: 12.5 }}>{a.sku}</span>
                    <span className="suave" style={{ fontSize: 12.5 }}>#{a.id}</span>
                  </div>
                  <div className="alerta__producto">{a.producto}</div>
                  <div className="alerta__dato">
                    Stock al detectar: <b>{a.stockDetectado}</b> · mínimo {a.stockMinimo} · hoy {a.stockActual}
                  </div>
                  <div className="alerta__dato">
                    {a.proveedor ?? 'Sin proveedor asignado'}
                    {a.canalPreferido && ` · avisa por ${nombreCanal[a.canalPreferido]}`}
                  </div>
                  <div className="alerta__dato suave">
                    Generada {fechaCorta(a.fechaGenerada)}
                    {a.fechaEnviada && ` · enviada ${fechaCorta(a.fechaEnviada)}${a.canal ? ` por ${nombreCanal[a.canal]}` : ''}`}
                    {a.fechaAtendida && ` · atendida ${fechaCorta(a.fechaAtendida)}`}
                  </div>
                  {a.acciones.includes('enviar') && (
                    <button type="button" className="boton boton--chico boton--acento" disabled={envio.enviando || !a.proveedorId}
                      title={a.proveedorId ? undefined : 'Asigna un proveedor al producto para poder avisar'} onClick={() => actuar(a, 'enviar')}>
                      Enviar al proveedor
                    </button>
                  )}
                  {a.acciones.includes('atender') && (
                    <button type="button" className="boton boton--chico" disabled={envio.enviando} onClick={() => actuar(a, 'atender')}>
                      Marcar como atendida
                    </button>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>

      <section className="tarjeta">
        <h2>Bandeja de salida</h2>
        <p className="suave" style={{ margin: 0, fontSize: 14 }}>
          Mensajes enviados a los proveedores por su canal preferido. En esta versión el envío es simulado: el texto queda registrado aquí y en la consola del servidor.
        </p>
        {(bandeja.datos ?? []).length === 0 ? (
          <p className="suave" style={{ margin: 0 }}>Todavía no se envió ningún aviso desde que se encendió el servidor.</p>
        ) : (
          <ul className="lista-simple">
            {(bandeja.datos ?? []).map((m, i) => (
              <li key={`${m.fecha}-${i}`} style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{nombreCanal[m.canal]} → {m.destino}</div>
                  <div style={{ fontSize: 14, color: 'var(--texto-2)' }}>{m.texto}</div>
                </div>
                <span className="suave" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fechaCorta(m.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
