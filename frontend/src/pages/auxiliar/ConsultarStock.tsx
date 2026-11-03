import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../api';
import { EstadoStock } from '../../components/EstadoStock';
import { FiltroCategorias } from '../../components/FiltroCategorias';
import { useDatos } from '../../utils/useDatos';
import { useRetrasado } from '../../utils/useRetrasado';

/** Consulta de solo lectura: sin precios ni edición (RF-03) */
export function ConsultarStock() {
  const navegar = useNavigate();
  const [buscar, setBuscar] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const texto = useRetrasado(buscar);
  const categorias = useDatos(() => api.categorias());
  const productos = useDatos(
    () => api.productos({ buscar: texto, categoriaId: categoriaId ?? undefined }),
    [texto, categoriaId],
  );

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Consultar stock</h1>
          <p>Vista de solo consulta: no muestra precios ni permite editar productos.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <label htmlFor="buscar-stock" className="solo-lectores">Buscar repuesto</label>
        <input id="buscar-stock" className="entrada" type="search" style={{ flex: '1 1 320px', width: 'auto', height: 52 }}
          placeholder="Buscar por SKU o nombre" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>
      {categorias.datos && <FiltroCategorias categorias={categorias.datos} valor={categoriaId} onCambiar={setCategoriaId} />}

      {productos.error && <div className="mensaje mensaje--error" role="alert">{productos.error}</div>}

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th>Repuesto</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th className="num">Disponibles</th>
              <th>Estado</th>
              <th><span className="solo-lectores">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {(productos.datos ?? []).map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <div className="mono suave" style={{ fontSize: 12.5 }}>{p.sku}</div>
                </td>
                <td style={{ color: 'var(--texto-2)' }}>{p.categoria}</td>
                <td className="mono" style={{ fontSize: 13.5 }}>Estante {p.ubicacion ?? '—'}</td>
                <td className="num" style={{ fontFamily: 'var(--titulo)', fontWeight: 600, fontSize: 17 }}>{p.cantidadActual}</td>
                <td><EstadoStock producto={p} textos={['Disponible', 'Pocas unidades']} /></td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="boton boton--borde" style={{ minHeight: 40, fontSize: 14.5 }}
                    disabled={p.cantidadActual === 0}
                    onClick={() => navegar(`/auxiliar/salida?producto=${p.id}`)}>
                    Registrar salida
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productos.cargando && !productos.datos && <div className="cargando">Cargando stock…</div>}
        {productos.datos?.length === 0 && <p className="tabla__vacio">No hay repuestos con ese filtro.</p>}
      </div>
    </>
  );
}
