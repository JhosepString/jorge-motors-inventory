import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../../api';
import { fechaHora, numero, soles } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';

type Pestana = 'inventario' | 'kardex';

const textoEstado = { AGOTADO: 'Agotado', CRITICO: 'Bajo el mínimo', NORMAL: 'Normal' } as const;
const claseEstado = { AGOTADO: 'chip--error', CRITICO: 'chip--aviso', NORMAL: 'chip--ok' } as const;

/** Exporta a PDF con el diálogo de impresión del navegador y deja constancia en auditoría */
function imprimir(reporte: Pestana, productoId?: number) {
  void api.reporteImpreso(reporte, productoId).catch(() => undefined);
  window.print();
}

export function Reportes() {
  const [params, setParams] = useSearchParams();
  const pestana: Pestana = params.get('ver') === 'kardex' ? 'kardex' : 'inventario';
  const cambiar = (p: Pestana) => setParams(p === 'kardex' ? { ver: 'kardex' } : {}, { replace: true });

  return (
    <>
      <header className="cabecera no-imprimir">
        <div>
          <h1>Reportes</h1>
          <p>Exporta a Excel (CSV) o a PDF desde el diálogo de impresión.</p>
        </div>
      </header>
      <div className="pestanas no-imprimir" role="tablist">
        <button type="button" role="tab" className="pestana" aria-selected={pestana === 'inventario'} onClick={() => cambiar('inventario')}>
          Inventario valorizado
        </button>
        <button type="button" role="tab" className="pestana" aria-selected={pestana === 'kardex'} onClick={() => cambiar('kardex')}>
          Kardex por producto
        </button>
      </div>
      {pestana === 'inventario' ? <InventarioValorizado /> : <KardexProducto />}
    </>
  );
}

function InventarioValorizado() {
  const { datos, error } = useDatos(() => api.inventario());
  const descarga = useEnvio();

  if (error) return <div className="mensaje mensaje--error" role="alert">{error}</div>;
  if (!datos) return <div className="cargando">Generando reporte…</div>;

  return (
    <>
      <div className="fila no-imprimir" style={{ justifyContent: 'space-between' }}>
        <span className="suave" style={{ fontSize: 14 }}>Generado {fechaHora(datos.generado)}</span>
        <div className="fila">
          <button type="button" className="boton boton--borde" disabled={descarga.enviando}
            onClick={() => descarga.ejecutar(() => api.descargarInventario())}>Descargar Excel (CSV)</button>
          <button type="button" className="boton" onClick={() => imprimir('inventario')}>Exportar PDF</button>
        </div>
      </div>
      {descarga.error && <div className="mensaje mensaje--error" role="alert">{descarga.error}</div>}

      <div className="solo-impresion">
        <h1 style={{ fontSize: 20 }}>Jorge Motors · Inventario valorizado</h1>
        <p>Generado {fechaHora(datos.generado)}</p>
      </div>

      <section className="kpis" aria-label="Totales">
        <div className="kpi"><div className="kpi__etiqueta">Productos</div><div className="kpi__valor">{datos.totalProductos}</div></div>
        <div className="kpi"><div className="kpi__etiqueta">Unidades</div><div className="kpi__valor">{numero(datos.totalUnidades)}</div></div>
        <div className="kpi"><div className="kpi__etiqueta">Categorías</div><div className="kpi__valor">{datos.categorias.length}</div></div>
        <div className="kpi"><div className="kpi__etiqueta">Valor total (a precio de compra)</div><div className="kpi__valor">{soles(datos.totalValor)}</div></div>
      </section>

      <div className="tabla-caja">
        <table className="tabla">
          <thead><tr><th>Categoría</th><th className="num">Productos</th><th className="num">Unidades</th><th className="num">Valor</th><th className="num">% del total</th></tr></thead>
          <tbody>
            {datos.categorias.map((c) => (
              <tr key={c.categoria}>
                <td style={{ fontWeight: 600 }}>{c.categoria}</td>
                <td className="num">{c.productos}</td>
                <td className="num">{c.unidades}</td>
                <td className="num">{soles(c.valor)}</td>
                <td className="num">{datos.totalValor ? ((c.valor / datos.totalValor) * 100).toFixed(1) : '0.0'} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 900 }}>
          <thead>
            <tr><th>SKU</th><th>Producto</th><th>Categoría</th><th className="num">Stock</th><th className="num">Mínimo</th><th className="num">P. compra</th><th className="num">Valor</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {datos.productos.map((p) => (
              <tr key={p.id}>
                <td className="mono" style={{ fontSize: 13 }}>{p.sku}</td>
                <td>{p.nombre}</td>
                <td style={{ color: 'var(--texto-2)' }}>{p.categoria}</td>
                <td className="num">{p.cantidadActual}</td>
                <td className="num">{p.stockMinimo}</td>
                <td className="num">{soles(p.precioCompra ?? 0)}</td>
                <td className="num" style={{ fontWeight: 600 }}>{soles(p.valorInventario)}</td>
                <td><span className={`chip ${claseEstado[p.estadoStock]}`}>{textoEstado[p.estadoStock]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function KardexProducto() {
  const productos = useDatos(() => api.productos({ incluirInactivos: true }));
  const [productoId, setProductoId] = useState<number | null>(null);
  const elegido = productoId ?? productos.datos?.[0]?.id ?? null;
  const kardex = useDatos(() => (elegido ? api.kardex(elegido) : Promise.resolve(null)), [elegido]);
  const descarga = useEnvio();
  const k = kardex.datos;

  return (
    <>
      <div className="fila no-imprimir" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="campo" style={{ flex: '1 1 360px', maxWidth: 520 }}>
          <label htmlFor="k-producto">Producto</label>
          <select id="k-producto" className="entrada" value={elegido ?? ''} onChange={(e) => setProductoId(Number(e.target.value))}>
            {(productos.datos ?? []).map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.nombre}</option>)}
          </select>
        </div>
        <div className="fila">
          <button type="button" className="boton boton--borde" disabled={!elegido || descarga.enviando}
            onClick={() => elegido && descarga.ejecutar(() => api.descargarKardex(elegido))}>Descargar Excel (CSV)</button>
          <button type="button" className="boton" disabled={!k} onClick={() => elegido && imprimir('kardex', elegido)}>Exportar PDF</button>
        </div>
      </div>
      {(kardex.error ?? descarga.error) && <div className="mensaje mensaje--error" role="alert">{kardex.error ?? descarga.error}</div>}
      {!k && !kardex.error && <div className="cargando">Cargando kardex…</div>}

      {k && (
        <>
          <section className="tarjeta" style={{ gap: 6 }}>
            <div className="solo-impresion"><b>Jorge Motors · Kardex</b></div>
            <div className="mono" style={{ fontSize: 13 }}>{k.producto.sku}</div>
            <h2 style={{ fontSize: 22 }}>{k.producto.nombre}</h2>
            <p className="suave" style={{ margin: 0 }}>
              {k.producto.categoria} · stock actual <b>{k.producto.stockActual}</b> · mínimo {k.producto.stockMinimo} · costo unitario {soles(k.producto.precioCompra)}
            </p>
          </section>
          <div className="tabla-caja">
            <table className="tabla" style={{ minWidth: 900 }}>
              <thead>
                <tr><th>Fecha</th><th>Referencia</th><th>Motivo</th><th className="num">Entrada</th><th className="num">Salida</th><th className="num">Saldo</th><th>Registró</th></tr>
              </thead>
              <tbody>
                {k.movimientos.map((m) => (
                  <tr key={m.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fechaHora(m.fecha)}</td>
                    <td className="mono" style={{ fontSize: 13 }}>{m.referencia ?? '—'}</td>
                    <td style={{ color: 'var(--texto-2)' }}>{m.motivo ?? '—'}</td>
                    <td className="num" style={{ color: 'var(--ok-texto)' }}>{m.entrada || ''}</td>
                    <td className="num" style={{ color: 'var(--azul)' }}>{m.salida || ''}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{m.saldo}</td>
                    <td>{m.registradoPor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {k.movimientos.length === 0 && <p className="tabla__vacio">Este producto aún no tiene movimientos.</p>}
          </div>
        </>
      )}
    </>
  );
}
