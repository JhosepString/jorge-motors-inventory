import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../api';
import type { Canal, DatosProveedor, Proveedor } from '../../api';
import { Dialogo } from '../../components/Dialogo';
import { nombreCanal } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';

const vacio: DatosProveedor = {
  ruc: '', razonSocial: '', contacto: null, telefono: null, email: null, direccion: null, ciudad: null, canalPreferido: 'CORREO',
};

export function Proveedores() {
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [editando, setEditando] = useState<Proveedor | 'nuevo' | null>(null);
  const proveedores = useDatos(() => api.proveedores(incluirInactivos), [incluirInactivos]);
  const estado = useEnvio();

  const cambiarEstado = async (p: Proveedor) => {
    const ok = await estado.ejecutar(() => api.estadoProveedor(p.id, !p.activo));
    if (ok) proveedores.recargar();
  };

  const lista = proveedores.datos ?? [];

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Proveedores</h1>
          <p>Cada proveedor recibe los avisos de bajo stock por su canal preferido: correo, SMS o WhatsApp.</p>
        </div>
        <button type="button" className="boton boton--acento" onClick={() => setEditando('nuevo')}>+ Nuevo proveedor</button>
      </header>

      <div className="fila">
        <button type="button" className="pastilla" aria-pressed={incluirInactivos} onClick={() => setIncluirInactivos((v) => !v)}>Ver inactivos</button>
      </div>

      {(proveedores.error ?? estado.error) && <div className="mensaje mensaje--error" role="alert">{proveedores.error ?? estado.error}</div>}

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 960 }}>
          <thead>
            <tr><th>RUC</th><th>Razón social</th><th>Contacto</th><th>Teléfono / correo</th><th>Canal</th><th className="num">Productos</th><th>Estado</th><th><span className="solo-lectores">Acciones</span></th></tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} style={p.activo ? undefined : { opacity: 0.6 }}>
                <td className="mono" style={{ fontSize: 13 }}>{p.ruc}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.razonSocial}</div>
                  <div className="suave" style={{ fontSize: 13 }}>{[p.direccion, p.ciudad].filter(Boolean).join(' · ')}</div>
                </td>
                <td>{p.contacto ?? '—'}</td>
                <td style={{ fontSize: 14 }}>
                  <div>{p.telefono ?? '—'}</div>
                  <div className="suave">{p.email ?? ''}</div>
                </td>
                <td><span className="chip chip--azul">{nombreCanal[p.canalPreferido]}</span></td>
                <td className="num">{p.productos}</td>
                <td><span className={`chip ${p.activo ? 'chip--ok' : 'chip--neutro'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div className="acciones">
                    <button type="button" className="boton boton--borde boton--chico" onClick={() => setEditando(p)}>Editar</button>
                    <button type="button" className={`boton boton--chico ${p.activo ? 'boton--peligro' : 'boton--borde'}`}
                      disabled={estado.enviando} onClick={() => cambiarEstado(p)}>{p.activo ? 'Desactivar' : 'Activar'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {proveedores.cargando && !proveedores.datos && <div className="cargando">Cargando proveedores…</div>}
        {proveedores.datos?.length === 0 && <p className="tabla__vacio">No hay proveedores registrados.</p>}
      </div>

      <Dialogo titulo={editando === 'nuevo' ? 'Nuevo proveedor' : 'Editar proveedor'} abierto={editando !== null} onCerrar={() => setEditando(null)}>
        {editando !== null && (
          <FormularioProveedor
            proveedor={editando === 'nuevo' ? null : editando}
            onGuardado={() => { setEditando(null); proveedores.recargar(); }}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Dialogo>
    </>
  );
}

interface PropsFormulario {
  proveedor: Proveedor | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

function FormularioProveedor({ proveedor, onGuardado, onCancelar }: PropsFormulario) {
  const [d, setD] = useState<DatosProveedor>(() => {
    if (!proveedor) return vacio;
    const { id: _id, activo: _activo, productos: _productos, ...datos } = proveedor;
    return datos;
  });
  const envio = useEnvio();
  const campo = <K extends keyof DatosProveedor>(k: K, v: DatosProveedor[K]) => setD((previo) => ({ ...previo, [k]: v }));
  const texto = (v: string) => (v.trim() === '' ? null : v);

  const necesitaCorreo = d.canalPreferido === 'CORREO';
  const necesitaTelefono = d.canalPreferido !== 'CORREO';

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await envio.ejecutar(() => (proveedor ? api.editarProveedor(proveedor.id, d) : api.crearProveedor(d)));
    if (ok) onGuardado();
  };

  return (
    <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="rejilla">
        <div className="campo">
          <label htmlFor="v-ruc">RUC</label>
          <input id="v-ruc" className="entrada mono" required inputMode="numeric" pattern="\d{11}" maxLength={11}
            title="11 dígitos" value={d.ruc} onChange={(e) => campo('ruc', e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="campo">
          <label htmlFor="v-contacto">Persona de contacto</label>
          <input id="v-contacto" className="entrada" maxLength={120} value={d.contacto ?? ''} onChange={(e) => campo('contacto', texto(e.target.value))} />
        </div>
        <div className="campo ancho">
          <label htmlFor="v-razon">Razón social</label>
          <input id="v-razon" className="entrada" required maxLength={150} value={d.razonSocial} onChange={(e) => campo('razonSocial', e.target.value)} />
        </div>
        <fieldset className="campo ancho" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="campo__etiqueta" style={{ marginBottom: 8 }}>Canal para los avisos de bajo stock</legend>
          <div className="grupo-pastillas">
            {(Object.keys(nombreCanal) as Canal[]).map((c) => (
              <button key={c} type="button" className="pastilla" aria-pressed={d.canalPreferido === c} onClick={() => campo('canalPreferido', c)}>
                {nombreCanal[c]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="campo">
          <label htmlFor="v-telefono">Teléfono {necesitaTelefono && '(obligatorio para este canal)'}</label>
          <input id="v-telefono" className="entrada" type="tel" maxLength={20} required={necesitaTelefono} value={d.telefono ?? ''}
            onChange={(e) => campo('telefono', texto(e.target.value))} placeholder="987654321" />
        </div>
        <div className="campo">
          <label htmlFor="v-email">Correo {necesitaCorreo && '(obligatorio para este canal)'}</label>
          <input id="v-email" className="entrada" type="email" maxLength={150} required={necesitaCorreo} value={d.email ?? ''}
            onChange={(e) => campo('email', texto(e.target.value))} />
        </div>
        <div className="campo">
          <label htmlFor="v-direccion">Dirección</label>
          <input id="v-direccion" className="entrada" maxLength={200} value={d.direccion ?? ''} onChange={(e) => campo('direccion', texto(e.target.value))} />
        </div>
        <div className="campo">
          <label htmlFor="v-ciudad">Ciudad</label>
          <input id="v-ciudad" className="entrada" maxLength={80} value={d.ciudad ?? ''} onChange={(e) => campo('ciudad', texto(e.target.value))} />
        </div>
      </div>
      {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
      <div className="fila fila--fin">
        <button type="button" className="boton boton--borde" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="boton" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}
