import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../api';
import type { ProductoStock, ResultadoMovimiento, TipoMovimiento } from '../../api';
import { fechaHora, rangoLima } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';

export function Movimientos() {
  const [tipo, setTipo] = useState<TipoMovimiento | ''>('');
  const [productoId, setProductoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [registrando, setRegistrando] = useState<TipoMovimiento | null>(null);

  const productos = useDatos(() => api.productos());
  const usuarios = useDatos(() => api.usuarios());
  const filtro = useMemo(() => ({
    tipo: tipo || undefined,
    productoId: productoId ? Number(productoId) : undefined,
    usuarioId: usuarioId ? Number(usuarioId) : undefined,
    ...rangoLima(desde, hasta),
    limite: 200,
  }), [tipo, productoId, usuarioId, desde, hasta]);
  const movimientos = useDatos(() => api.movimientos(filtro), [filtro]);

  const registrado = () => {
    movimientos.recargar();
    productos.recargar();
  };

  const lista = movimientos.datos ?? [];
  const entradas = lista.filter((m) => m.tipo === 'ENTRADA').reduce((s, m) => s + m.cantidad, 0);
  const salidas = lista.filter((m) => m.tipo === 'SALIDA').reduce((s, m) => s + m.cantidad, 0);

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Movimientos</h1>
          <p>Entradas por compra y salidas por orden de trabajo. Cada movimiento guarda el stock antes y después.</p>
        </div>
        <div className="fila">
          <button type="button" className="boton boton--borde" onClick={() => setRegistrando('SALIDA')}>Registrar salida</button>
          <button type="button" className="boton boton--acento" onClick={() => setRegistrando('ENTRADA')}>+ Registrar entrada</button>
        </div>
      </header>

      {registrando && (
        <FormularioMovimiento
          key={registrando}
          tipo={registrando}
          productos={(productos.datos ?? []).filter((p) => p.activo)}
          onRegistrado={registrado}
          onCerrar={() => setRegistrando(null)}
        />
      )}

      <section className="tarjeta" style={{ gap: 14 }}>
        <div className="rejilla" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          <div className="campo">
            <label htmlFor="f-tipo">Tipo</label>
            <select id="f-tipo" className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value as TipoMovimiento | '')}>
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="f-producto">Producto</label>
            <select id="f-producto" className="entrada" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Todos</option>
              {(productos.datos ?? []).map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="f-usuario">Registró</label>
            <select id="f-usuario" className="entrada" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
              <option value="">Todos</option>
              {(usuarios.datos ?? []).map((u) => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="f-desde">Desde</label>
            <input id="f-desde" className="entrada" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="f-hasta">Hasta</label>
            <input id="f-hasta" className="entrada" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>
        <p className="suave" style={{ margin: 0, fontSize: 14 }}>
          {lista.length} movimientos · {entradas} unidades de entrada · {salidas} unidades de salida
        </p>
      </section>

      {movimientos.error && <div className="mensaje mensaje--error" role="alert">{movimientos.error}</div>}

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 980 }}>
          <thead>
            <tr>
              <th>Fecha</th><th>Tipo</th><th>Producto</th><th className="num">Cantidad</th>
              <th className="num">Stock</th><th>Referencia</th><th>Motivo</th><th>Registró</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{fechaHora(m.fecha)}</td>
                <td><span className={`chip ${m.tipo === 'ENTRADA' ? 'chip--ok' : 'chip--azul'}`}>{m.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}</span></td>
                <td><span className="mono" style={{ fontSize: 12.5 }}>{m.sku}</span><div>{m.producto}</div></td>
                <td className="num" style={{ fontWeight: 600 }}>{m.tipo === 'ENTRADA' ? '+' : '−'}{m.cantidad}</td>
                <td className="num" style={{ whiteSpace: 'nowrap' }}>{m.stockAnterior} → {m.stockResultante}</td>
                <td className="mono" style={{ fontSize: 13 }}>{m.referencia ?? '—'}</td>
                <td style={{ color: 'var(--texto-2)' }}>{m.motivo ?? '—'}</td>
                <td>{m.registradoPor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.cargando && !movimientos.datos && <div className="cargando">Cargando movimientos…</div>}
        {movimientos.datos?.length === 0 && <p className="tabla__vacio">No hay movimientos con ese filtro.</p>}
      </div>
    </>
  );
}

interface PropsFormulario {
  tipo: TipoMovimiento;
  productos: ProductoStock[];
  onRegistrado: () => void;
  onCerrar: () => void;
}

function FormularioMovimiento({ tipo, productos, onRegistrado, onCerrar }: PropsFormulario) {
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [referencia, setReferencia] = useState('');
  const [motivo, setMotivo] = useState('');
  const [resultado, setResultado] = useState<ResultadoMovimiento | null>(null);
  const envio = useEnvio();
  const esEntrada = tipo === 'ENTRADA';
  const producto = productos.find((p) => p.id === Number(productoId));
  const n = Number(cantidad) || 0;
  const resultante = producto ? producto.cantidadActual + (esEntrada ? n : -n) : null;

  const registrar = async (e: FormEvent) => {
    e.preventDefault();
    const datos = { productoId: Number(productoId), cantidad: n, referencia: referencia || null, motivo: motivo || null };
    const r = await envio.ejecutar(() => (esEntrada ? api.registrarEntrada(datos) : api.registrarSalida(datos)));
    if (r) {
      setResultado(r);
      setCantidad('');
      setReferencia('');
      setMotivo('');
      onRegistrado();
    }
  };

  return (
    <section className="tarjeta" aria-labelledby="titulo-registro">
      <div className="fila" style={{ justifyContent: 'space-between' }}>
        <h2 id="titulo-registro">{esEntrada ? 'Registrar entrada (compra a proveedor)' : 'Registrar salida (uso en taller)'}</h2>
        <button type="button" className="dialogo__cerrar" aria-label="Cerrar formulario" onClick={onCerrar}>×</button>
      </div>
      <form onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="rejilla" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <div className="campo">
            <label htmlFor="m-producto">Producto</label>
            <select id="m-producto" className="entrada" required value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Elige un producto…</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.nombre} (stock {p.cantidadActual})</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="m-cantidad">Cantidad</label>
            <input id="m-cantidad" className="entrada" type="number" min={1} step={1} required value={cantidad}
              onChange={(e) => setCantidad(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="m-referencia">{esEntrada ? 'Factura / guía' : 'Orden de trabajo'}</label>
            <input id="m-referencia" className="entrada mono" maxLength={50} required={!esEntrada} value={referencia}
              placeholder={esEntrada ? 'F001-000123' : 'OT-2026-0001'} onChange={(e) => setReferencia(e.target.value.toUpperCase())} />
          </div>
          <div className="campo ancho">
            <label htmlFor="m-motivo">Motivo (opcional)</label>
            <input id="m-motivo" className="entrada" maxLength={200} value={motivo} onChange={(e) => setMotivo(e.target.value)}
              placeholder={esEntrada ? 'Compra a proveedor' : 'Uso en servicio de mantenimiento'} />
          </div>
        </div>
        {producto && n > 0 && resultante !== null && (
          <div className={`mensaje ${resultante < 0 ? 'mensaje--error' : resultante < producto.stockMinimo ? 'mensaje--aviso' : 'mensaje--info'}`}>
            Stock de {producto.nombre}: {producto.cantidadActual} → <b>{resultante}</b> (mínimo {producto.stockMinimo})
            {resultante < 0 && ' · no hay unidades suficientes'}
            {resultante >= 0 && resultante < producto.stockMinimo && ' · quedará bajo el mínimo y se generará una alerta'}
          </div>
        )}
        {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
        {resultado && !envio.error && (
          <div className="mensaje mensaje--info" role="status">
            Registrado: {resultado.movimiento.tipo === 'ENTRADA' ? 'entrada' : 'salida'} de {resultado.movimiento.cantidad} × {resultado.movimiento.producto}. Stock actual: <b>{resultado.stockResultante}</b>.
            {resultado.bajoMinimo && ' Quedó bajo el mínimo: revisa el tablero de alertas.'}
          </div>
        )}
        <div className="fila fila--fin">
          <button type="submit" className="boton" disabled={envio.enviando || (resultante !== null && resultante < 0)}>
            {envio.enviando ? 'Registrando…' : esEntrada ? 'Registrar entrada' : 'Registrar salida'}
          </button>
        </div>
      </form>
    </section>
  );
}
