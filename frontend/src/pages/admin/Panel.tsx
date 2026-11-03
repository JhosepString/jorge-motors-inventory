import { Link } from 'react-router';
import { api } from '../../api';
import { useAuth } from '../../auth/sesion';
import { fechaCorta, hoyLargo, numero, soles } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';

const textoEstado = { PENDIENTE: 'Pendiente', ENVIADA: 'Enviada', ATENDIDA: 'Atendida' } as const;

export function Panel() {
  const { usuario } = useAuth();
  const { datos, error, recargar } = useDatos(() => api.panel());
  const maximo = Math.max(1, ...(datos?.unidadesPorCategoria.map((c) => c.unidades) ?? [1]));

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Hola, {usuario?.nombres}</h1>
          <p>{hoyLargo()}</p>
        </div>
        <button type="button" className="boton boton--borde" onClick={recargar}>Actualizar</button>
      </header>

      {error && <div className="mensaje mensaje--error" role="alert">{error}</div>}
      {!datos && !error && <div className="cargando">Cargando indicadores…</div>}

      {datos && (
        <>
          <section className="kpis" aria-label="Indicadores">
            <div className="kpi"><div className="kpi__etiqueta">Productos activos</div><div className="kpi__valor">{numero(datos.productosActivos)}</div></div>
            <div className="kpi"><div className="kpi__etiqueta">Unidades en almacén</div><div className="kpi__valor">{numero(datos.unidades)}</div></div>
            <Link to="/admin/productos?bajo=1" className={`kpi${datos.bajoMinimo ? ' kpi--aviso' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="kpi__etiqueta">Bajo el mínimo</div><div className="kpi__valor">{datos.bajoMinimo}</div>
            </Link>
            <div className="kpi"><div className="kpi__etiqueta">Valor del inventario</div><div className="kpi__valor">{soles(datos.valorInventario)}</div></div>
          </section>

          <div className="columnas">
            <section className="tarjeta">
              <div className="fila" style={{ justifyContent: 'space-between' }}>
                <h2>Últimos movimientos</h2>
                <Link to="/admin/movimientos">Ver todos</Link>
              </div>
              <div className="tabla-caja">
                <table className="tabla">
                  <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th className="num">Cant.</th><th>Registró</th></tr></thead>
                  <tbody>
                    {datos.ultimosMovimientos.map((m) => (
                      <tr key={m.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{fechaCorta(m.fecha)}</td>
                        <td><span className="mono" style={{ fontSize: 12.5 }}>{m.sku}</span> · {m.producto}</td>
                        <td><span className={`chip ${m.tipo === 'ENTRADA' ? 'chip--ok' : 'chip--azul'}`}>{m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}</span></td>
                        <td className="num">{m.cantidad}</td>
                        <td>{m.registradoPor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datos.ultimosMovimientos.length === 0 && <p className="tabla__vacio">Aún no hay movimientos.</p>}
              </div>
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <section className="tarjeta">
                <div className="fila" style={{ justifyContent: 'space-between' }}>
                  <h2>Alertas abiertas</h2>
                  <Link to="/admin/alertas">Ir al tablero</Link>
                </div>
                {datos.alertasAbiertas.length === 0 ? (
                  <p className="suave" style={{ margin: 0 }}>No hay alertas abiertas.</p>
                ) : (
                  <ul className="lista-simple">
                    {datos.alertasAbiertas.map((a) => (
                      <li key={a.id}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.producto}</div>
                          <div className="suave" style={{ fontSize: 13 }}>{a.stockDetectado} / mín. {a.stockMinimo} · {a.proveedor ?? 'Sin proveedor'}</div>
                        </div>
                        <span className={`chip ${a.estado === 'PENDIENTE' ? 'chip--aviso' : 'chip--azul'}`}>{textoEstado[a.estado]}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="tarjeta">
                <h2>Unidades por categoría</h2>
                <div className="barras">
                  {datos.unidadesPorCategoria.map((c) => (
                    <div key={c.categoria} className="barras__fila">
                      <span>{c.categoria}</span>
                      <div className="barra" aria-hidden="true"><div className="barra__relleno" style={{ width: `${(c.unidades / maximo) * 100}%` }} /></div>
                      <span style={{ textAlign: 'right', fontWeight: 600 }}>{c.unidades}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
