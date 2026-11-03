import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../../api';
import type { Categoria, DatosProducto, ProductoStock, Proveedor, UnidadMedida } from '../../api';
import { Dialogo } from '../../components/Dialogo';
import { EstadoStock } from '../../components/EstadoStock';
import { FiltroCategorias } from '../../components/FiltroCategorias';
import { IconoBuscar } from '../../components/Iconos';
import { estaBajoMinimo, nombreUnidad, soles } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';
import { useRetrasado } from '../../utils/useRetrasado';

const vacio: DatosProducto = {
  sku: '', nombre: '', descripcion: null, marca: null, unidadMedida: 'UNIDAD',
  precioCompra: 0, precioVenta: 0, stockMinimo: 0, categoriaId: 0, proveedorId: null, ubicacion: null,
};

function aDatos(p: ProductoStock): DatosProducto {
  return {
    sku: p.sku, nombre: p.nombre, descripcion: p.descripcion, marca: p.marca, unidadMedida: p.unidadMedida,
    precioCompra: p.precioCompra ?? 0, precioVenta: p.precioVenta ?? 0, stockMinimo: p.stockMinimo,
    categoriaId: p.categoriaId, proveedorId: p.proveedorId, ubicacion: p.ubicacion,
  };
}

export function Productos() {
  const [params] = useSearchParams();
  const [buscar, setBuscar] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(params.get('bajo') === '1');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [editando, setEditando] = useState<ProductoStock | 'nuevo' | null>(null);
  const [verCategorias, setVerCategorias] = useState(false);
  const texto = useRetrasado(buscar);
  const categorias = useDatos(() => api.categorias());
  const proveedores = useDatos(() => api.proveedores());
  const productos = useDatos(
    () => api.productos({ buscar: texto, categoriaId: categoriaId ?? undefined, soloBajoMinimo, incluirInactivos }),
    [texto, categoriaId, soloBajoMinimo, incluirInactivos],
  );
  const estado = useEnvio();

  const lista = productos.datos ?? [];
  const activos = lista.filter((p) => p.activo);
  const resumen = productos.datos
    ? `${activos.length} productos · ${activos.reduce((s, p) => s + p.cantidadActual, 0)} unidades · ${activos.filter(estaBajoMinimo).length} bajo el mínimo`
    : 'Cargando…';

  const cambiarEstado = async (p: ProductoStock) => {
    const ok = await estado.ejecutar(() => api.estadoProducto(p.id, !p.activo));
    if (ok) productos.recargar();
  };

  const guardado = () => {
    setEditando(null);
    productos.recargar();
    categorias.recargar();
  };

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Productos y stock</h1>
          <p>{resumen}</p>
        </div>
        <div className="fila">
          <button type="button" className="boton boton--borde" onClick={() => setVerCategorias(true)}>Categorías</button>
          <button type="button" className="boton boton--acento" onClick={() => setEditando('nuevo')}>+ Nuevo producto</button>
        </div>
      </header>

      <div className="fila">
        <label htmlFor="buscar-producto" className="solo-lectores">Buscar producto</label>
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: 14, color: 'var(--texto-suave)' }}><IconoBuscar tam={18} /></span>
          <input id="buscar-producto" className="entrada" type="search" style={{ paddingLeft: 42 }}
            placeholder="Buscar por SKU, nombre o marca" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
        <button type="button" className="pastilla" style={{ minHeight: 48, borderRadius: 'var(--radio)' }}
          aria-pressed={soloBajoMinimo} onClick={() => setSoloBajoMinimo((v) => !v)}>
          Solo bajo el mínimo
        </button>
        <button type="button" className="pastilla" style={{ minHeight: 48, borderRadius: 'var(--radio)' }}
          aria-pressed={incluirInactivos} onClick={() => setIncluirInactivos((v) => !v)}>
          Ver inactivos
        </button>
      </div>
      {categorias.datos && <FiltroCategorias categorias={categorias.datos} valor={categoriaId} onCambiar={setCategoriaId} />}

      {(productos.error ?? estado.error) && <div className="mensaje mensaje--error" role="alert">{productos.error ?? estado.error}</div>}

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 1000 }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Ubic.</th>
              <th style={{ width: 180 }}>Stock / mínimo</th>
              <th className="num">P. compra</th>
              <th className="num">P. venta</th>
              <th>Estado</th>
              <th><span className="solo-lectores">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const bajo = estaBajoMinimo(p);
              const pct = Math.min(100, Math.round((p.cantidadActual / Math.max(1, p.stockMinimo * 2)) * 100));
              return (
                <tr key={p.id} style={p.activo ? undefined : { opacity: 0.6 }}>
                  <td className="mono" style={{ fontSize: 13, color: 'var(--texto-2)' }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                    <div className="suave" style={{ fontSize: 13 }}>{[p.marca, p.proveedor].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td style={{ color: 'var(--texto-2)' }}>{p.categoria}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{p.ubicacion ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="barra" aria-hidden="true">
                        <div className={`barra__relleno${bajo ? ' barra__relleno--aviso' : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{p.cantidadActual} / {p.stockMinimo}</span>
                    </div>
                  </td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>{soles(p.precioCompra ?? 0)}</td>
                  <td className="num" style={{ whiteSpace: 'nowrap' }}>{soles(p.precioVenta ?? 0)}</td>
                  <td>{p.activo ? <EstadoStock producto={p} /> : <span className="chip chip--neutro">Inactivo</span>}</td>
                  <td>
                    <div className="acciones">
                      <button type="button" className="boton boton--borde boton--chico" onClick={() => setEditando(p)}>Editar</button>
                      <button type="button" className={`boton boton--chico ${p.activo ? 'boton--peligro' : 'boton--borde'}`}
                        disabled={estado.enviando} onClick={() => cambiarEstado(p)}>
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {productos.cargando && !productos.datos && <div className="cargando">Cargando productos…</div>}
        {productos.datos?.length === 0 && <p className="tabla__vacio">No hay productos con ese filtro.</p>}
      </div>

      <Dialogo titulo={editando === 'nuevo' ? 'Nuevo producto' : 'Editar producto'} abierto={editando !== null} onCerrar={() => setEditando(null)}>
        {editando !== null && (
          <FormularioProducto
            producto={editando === 'nuevo' ? null : editando}
            categorias={categorias.datos ?? []}
            proveedores={proveedores.datos ?? []}
            onGuardado={guardado}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Dialogo>

      <Dialogo titulo="Categorías" abierto={verCategorias} onCerrar={() => setVerCategorias(false)}>
        <Categorias categorias={categorias.datos ?? []} onCambio={categorias.recargar} />
      </Dialogo>
    </>
  );
}

interface PropsFormulario {
  producto: ProductoStock | null;
  categorias: Categoria[];
  proveedores: Proveedor[];
  onGuardado: () => void;
  onCancelar: () => void;
}

function FormularioProducto({ producto, categorias, proveedores, onGuardado, onCancelar }: PropsFormulario) {
  const [d, setD] = useState<DatosProducto>(() => (producto ? aDatos(producto) : { ...vacio, categoriaId: categorias[0]?.id ?? 0 }));
  const envio = useEnvio();
  const campo = <K extends keyof DatosProducto>(k: K, v: DatosProducto[K]) => setD((previo) => ({ ...previo, [k]: v }));
  const texto = (v: string) => (v.trim() === '' ? null : v);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await envio.ejecutar(() => (producto ? api.editarProducto(producto.id, d) : api.crearProducto(d)));
    if (ok) onGuardado();
  };

  return (
    <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="rejilla">
        <div className="campo">
          <label htmlFor="p-sku">SKU</label>
          <input id="p-sku" className="entrada mono" required maxLength={20} value={d.sku}
            onChange={(e) => campo('sku', e.target.value.toUpperCase())} placeholder="FRN-0001" />
        </div>
        <div className="campo">
          <label htmlFor="p-marca">Marca</label>
          <input id="p-marca" className="entrada" maxLength={80} value={d.marca ?? ''} onChange={(e) => campo('marca', texto(e.target.value))} />
        </div>
        <div className="campo ancho">
          <label htmlFor="p-nombre">Nombre</label>
          <input id="p-nombre" className="entrada" required maxLength={150} value={d.nombre} onChange={(e) => campo('nombre', e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="p-categoria">Categoría</label>
          <select id="p-categoria" className="entrada" value={d.categoriaId} onChange={(e) => campo('categoriaId', Number(e.target.value))}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="p-proveedor">Proveedor</label>
          <select id="p-proveedor" className="entrada" value={d.proveedorId ?? ''}
            onChange={(e) => campo('proveedorId', e.target.value ? Number(e.target.value) : null)}>
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="p-unidad">Unidad de medida</label>
          <select id="p-unidad" className="entrada" value={d.unidadMedida} onChange={(e) => campo('unidadMedida', e.target.value as UnidadMedida)}>
            {Object.entries(nombreUnidad).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="p-ubicacion">Ubicación en almacén</label>
          <input id="p-ubicacion" className="entrada mono" maxLength={20} value={d.ubicacion ?? ''}
            onChange={(e) => campo('ubicacion', texto(e.target.value.toUpperCase()))} placeholder="A-01" />
        </div>
      </div>
      <div className="rejilla rejilla--3">
        <div className="campo">
          <label htmlFor="p-compra">Precio de compra (S/)</label>
          <input id="p-compra" className="entrada" type="number" min={0} step="0.01" required value={d.precioCompra}
            onChange={(e) => campo('precioCompra', Number(e.target.value))} />
        </div>
        <div className="campo">
          <label htmlFor="p-venta">Precio de venta (S/)</label>
          <input id="p-venta" className="entrada" type="number" min={0} step="0.01" required value={d.precioVenta}
            onChange={(e) => campo('precioVenta', Number(e.target.value))} />
        </div>
        <div className="campo">
          <label htmlFor="p-minimo">Stock mínimo</label>
          <input id="p-minimo" className="entrada" type="number" min={0} step={1} required value={d.stockMinimo}
            onChange={(e) => campo('stockMinimo', Number(e.target.value))} />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="p-descripcion">Descripción</label>
        <textarea id="p-descripcion" className="entrada" maxLength={500} value={d.descripcion ?? ''}
          onChange={(e) => campo('descripcion', texto(e.target.value))} />
      </div>
      {!producto && <p className="suave" style={{ margin: 0, fontSize: 14 }}>El producto empieza con stock 0. Las unidades se suman registrando una entrada en Movimientos.</p>}
      {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
      <div className="fila fila--fin">
        <button type="button" className="boton boton--borde" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="boton" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}

function Categorias({ categorias, onCambio }: { categorias: Categoria[]; onCambio: () => void }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const envio = useEnvio();

  const crear = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await envio.ejecutar(() => api.crearCategoria({ nombre, descripcion: descripcion.trim() || null }));
    if (ok) {
      setNombre('');
      setDescripcion('');
      onCambio();
    }
  };

  return (
    <>
      <ul className="lista-simple">
        {categorias.map((c) => (
          <li key={c.id}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.nombre}</div>
              {c.descripcion && <div className="suave" style={{ fontSize: 13 }}>{c.descripcion}</div>}
            </div>
            <span className="chip chip--neutro">{c.productos ?? 0} productos</span>
          </li>
        ))}
      </ul>
      <form onSubmit={crear} className="tarjeta" style={{ padding: 18, gap: 12 }}>
        <h3 style={{ fontSize: 16 }}>Nueva categoría</h3>
        <div className="rejilla">
          <div className="campo">
            <label htmlFor="c-nombre">Nombre</label>
            <input id="c-nombre" className="entrada" required maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="c-descripcion">Descripción</label>
            <input id="c-descripcion" className="entrada" maxLength={255} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
        </div>
        {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
        <div className="fila fila--fin">
          <button type="submit" className="boton" disabled={envio.enviando}>Agregar categoría</button>
        </div>
      </form>
    </>
  );
}
