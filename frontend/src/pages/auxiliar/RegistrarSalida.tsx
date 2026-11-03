import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { api, ApiError } from '../../api';
import type { Movimiento, ProductoStock, ResultadoMovimiento } from '../../api';
import { useAuth } from '../../auth/sesion';
import { IconoCheck } from '../../components/Iconos';
import { estaBajoMinimo, fechaCorta, hoyLargo } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import './RegistrarSalida.css';

type Paso = 'repuesto' | 'cantidad' | 'listo';

export function RegistrarSalida() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const productos = useDatos(() => api.productos());
  const historial = useDatos(() => api.misMovimientos(100));

  const preseleccion = Number(params.get('producto')) || null;
  const [seleccionId, setSeleccionId] = useState<number | null>(preseleccion);
  const [paso, setPaso] = useState<Paso>(preseleccion ? 'cantidad' : 'repuesto');
  const [buscar, setBuscar] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [ot, setOt] = useState('');
  const [errorOt, setErrorOt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoMovimiento | null>(null);

  const lista = useMemo(() => productos.datos ?? [], [productos.datos]);
  const mias = useMemo(() => historial.datos ?? [], [historial.datos]);
  const seleccionado = lista.find((p) => p.id === seleccionId) ?? null;

  // "Los que más usas": los repuestos que este usuario sacó más veces, completados con el resto del catálogo
  const frecuentes = useMemo(() => {
    const usos = new Map<number, number>();
    mias.forEach((m) => usos.set(m.productoId, (usos.get(m.productoId) ?? 0) + 1));
    return [...lista].sort((a, b) => (usos.get(b.id) ?? 0) - (usos.get(a.id) ?? 0)).slice(0, 8);
  }, [lista, mias]);

  const encontrados = useMemo(() => {
    const t = buscar.trim().toLowerCase();
    if (!t) return null;
    return lista.filter((p) => p.sku.toLowerCase().includes(t) || p.nombre.toLowerCase().includes(t)).slice(0, 12);
  }, [buscar, lista]);

  const elegir = (p: ProductoStock) => {
    setSeleccionId(p.id);
    setCantidad(1);
    setError(null);
    setPaso('cantidad');
  };

  const volver = () => {
    setPaso('repuesto');
    setError(null);
    if (params.has('producto')) setParams({}, { replace: true });
  };

  const confirmar = async (e: FormEvent) => {
    e.preventDefault();
    if (!seleccionado) return;
    if (!ot.trim()) {
      setErrorOt('Ingresa el número de la orden de trabajo.');
      return;
    }
    setErrorOt(null);
    setError(null);
    setEnviando(true);
    try {
      const r = await api.registrarSalida({ productoId: seleccionado.id, cantidad, referencia: ot });
      setResultado(r);
      setPaso('listo');
      productos.recargar();
      historial.recargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la salida.');
      productos.recargar();
    } finally {
      setEnviando(false);
    }
  };

  const otraSalida = () => {
    setResultado(null);
    setSeleccionId(null);
    setCantidad(1);
    setOt('');
    setBuscar('');
    setPaso('repuesto');
    if (params.has('producto')) setParams({}, { replace: true });
  };

  const numPaso = paso === 'repuesto' ? 1 : paso === 'cantidad' ? 2 : 3;
  const bajos = lista.filter(estaBajoMinimo).length;
  const stockFinal = seleccionado ? seleccionado.cantidadActual - cantidad : 0;
  const quedaBajo = seleccionado ? stockFinal < seleccionado.stockMinimo : false;

  return (
    <>
      <header className="cabecera">
        <div>
          <p className="suave" style={{ margin: 0 }}>Hola, {usuario?.nombres} · {hoyLargo()}</p>
          <h1>Registrar salida</h1>
        </div>
        <div className="salida__datos">
          <div className="dato">
            <div className="dato__etiqueta">Salidas registradas por ti</div>
            <div className="dato__valor">{historial.datos ? mias.length : '—'}</div>
          </div>
          <div className="dato dato--aviso">
            <div className="dato__etiqueta">Repuestos con pocas unidades</div>
            <div className="dato__valor">{productos.datos ? bajos : '—'}</div>
          </div>
        </div>
      </header>

      <div className="salida">
        <div className="salida__principal">
          <ol className="pasos" aria-label="Progreso">
            {['Repuesto', 'Cantidad', 'Listo'].map((t, i) => (
              <li key={t} className={numPaso === i + 1 ? 'actual' : numPaso > i + 1 ? 'hecho' : ''}
                aria-current={numPaso === i + 1 ? 'step' : undefined}>
                {i + 1} · {t}
              </li>
            ))}
          </ol>

          {productos.error && <div className="mensaje mensaje--error" role="alert">{productos.error}</div>}

          {paso === 'repuesto' && (
            <section className="tarjeta">
              <label htmlFor="buscar-repuesto" className="salida__pregunta">¿Qué repuesto vas a usar?</label>
              <input id="buscar-repuesto" className="entrada entrada--grande" type="search" autoFocus
                placeholder="Busca por SKU o nombre del repuesto" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
              <div className="suave" style={{ fontSize: 14 }}>
                {encontrados ? `${encontrados.length} resultado(s)` : 'Los que más usas — haz clic en uno'}
              </div>
              {productos.cargando && !productos.datos ? (
                <div className="cargando">Cargando repuestos…</div>
              ) : (
                <div className="repuestos">
                  {(encontrados ?? frecuentes).map((p) => (
                    <button key={p.id} type="button" className="repuesto" onClick={() => elegir(p)} disabled={p.cantidadActual === 0}>
                      <span className="mono repuesto__sku">{p.sku} · estante {p.ubicacion ?? '—'}</span>
                      <span className="repuesto__nombre">{p.nombre}</span>
                      <span className={`chip ${estaBajoMinimo(p) ? 'chip--aviso' : 'chip--ok'}`}>
                        {p.cantidadActual === 0 ? 'Sin stock' : `${p.cantidadActual} ${p.cantidadActual === 1 ? 'disponible' : 'disponibles'}`}
                      </span>
                    </button>
                  ))}
                  {encontrados?.length === 0 && <p className="suave">No hay repuestos con «{buscar}».</p>}
                </div>
              )}
            </section>
          )}

          {paso === 'cantidad' && !seleccionado && productos.cargando && <div className="cargando">Cargando repuesto…</div>}

          {paso === 'cantidad' && seleccionado && (
            <form className="tarjeta" onSubmit={confirmar} noValidate>
              <button type="button" className="enlace-boton" onClick={volver}>← Cambiar repuesto</button>
              <div className="elegido">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="elegido__nombre">{seleccionado.nombre}</div>
                  <div className="suave" style={{ fontSize: 14 }}>
                    <span className="mono">{seleccionado.sku}</span> · estante {seleccionado.ubicacion ?? '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="suave" style={{ fontSize: 13 }}>Disponible</div>
                  <div className="elegido__stock">
                    {seleccionado.cantidadActual} <span className="suave">/ mín. {seleccionado.stockMinimo}</span>
                  </div>
                </div>
              </div>

              <div className="salida__campos">
                <div className="campo">
                  <span id="etq-cantidad" className="campo__etiqueta">Cantidad</span>
                  <div className="contador" role="group" aria-labelledby="etq-cantidad">
                    <button type="button" aria-label="Restar uno" disabled={cantidad <= 1}
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}>−</button>
                    <output aria-live="polite">{cantidad}</output>
                    <button type="button" aria-label="Sumar uno" disabled={cantidad >= seleccionado.cantidadActual}
                      onClick={() => setCantidad((c) => Math.min(seleccionado.cantidadActual, c + 1))}>+</button>
                  </div>
                </div>
                <div className="campo" style={{ flex: '1 1 220px' }}>
                  <label htmlFor="ot">Orden de trabajo</label>
                  <input id="ot" className="entrada entrada--grande mono" placeholder="OT-131" value={ot}
                    aria-invalid={errorOt ? true : undefined} aria-describedby={errorOt ? 'error-ot' : undefined}
                    onChange={(e) => { setOt(e.target.value); if (errorOt) setErrorOt(null); }} />
                  {errorOt && <span id="error-ot" className="ayuda-error">{errorOt}</span>}
                </div>
              </div>

              <div className="resultado">
                <span className="suave">El stock quedará en</span>
                <span className="resultado__cifra">
                  {seleccionado.cantidadActual} → <span className={quedaBajo ? 'texto-aviso' : 'texto-ok'}>{stockFinal}</span>
                </span>
                {quedaBajo && (
                  <span className="resultado__nota">Quedará bajo el mínimo: el sistema avisará al proveedor, no tienes que hacer nada más.</span>
                )}
              </div>

              {error && <div className="mensaje mensaje--error" role="alert">{error}</div>}

              <button type="submit" className="boton boton--acento boton--grande" disabled={enviando}>
                {enviando ? 'Registrando…' : `Confirmar salida de ${cantidad}`}
              </button>
            </form>
          )}

          {paso === 'listo' && resultado && (
            <section className="tarjeta listo" role="status">
              <div className="listo__icono"><IconoCheck /></div>
              <h2>Salida registrada</h2>
              <p>
                {resultado.movimiento.cantidad} × {resultado.movimiento.producto} · stock {resultado.movimiento.stockAnterior} → <b>{resultado.stockResultante}</b> · <span className="mono">{resultado.movimiento.referencia}</span>
              </p>
              {resultado.bajoMinimo && (
                <div className="mensaje mensaje--aviso">El repuesto quedó bajo el mínimo: se generó una alerta para el proveedor.</div>
              )}
              <p className="suave" style={{ fontSize: 14 }}>Quedó guardada con tu nombre y la hora; ya aparece en tus últimas salidas.</p>
              <button type="button" className="boton boton--grande" onClick={otraSalida}>Registrar otra salida</button>
            </section>
          )}
        </div>

        <aside className="tarjeta ultimas" aria-labelledby="titulo-ultimas">
          <h2 id="titulo-ultimas">Mis últimas salidas</h2>
          {historial.cargando && !historial.datos && <div className="cargando">Cargando…</div>}
          {historial.datos && mias.length === 0 && <p className="suave">Todavía no registraste salidas.</p>}
          <ul>
            {mias.slice(0, 5).map((m: Movimiento) => (
              <li key={m.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ultimas__producto">{m.producto}</div>
                  <div className="suave ultimas__detalle">{fechaCorta(m.fecha)} · <span className="mono">{m.referencia}</span></div>
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div className="ultimas__producto">−{m.cantidad}</div>
                  <div className="suave ultimas__detalle">{m.stockAnterior} → {m.stockResultante}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="suave ultimas__nota">
            Las salidas no se pueden editar ni borrar. Si te equivocaste, avisa al administrador para registrar una corrección.
          </p>
        </aside>
      </div>
    </>
  );
}
