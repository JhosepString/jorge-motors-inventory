import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../api';
import type { DatosUsuario, Rol, UsuarioAdmin } from '../../api';
import { nombreRol, useAuth } from '../../auth/sesion';
import { Dialogo } from '../../components/Dialogo';
import { fechaCorta } from '../../utils/formato';
import { useDatos } from '../../utils/useDatos';
import { useEnvio } from '../../utils/useEnvio';

const permisos: [string, boolean, boolean][] = [
  ['Registrar salidas con orden de trabajo', true, true],
  ['Consultar stock (sin precios)', true, true],
  ['Ver su propia actividad', true, true],
  ['Ver precios y valor del inventario', true, false],
  ['Registrar entradas de mercadería', true, false],
  ['Crear y editar productos y categorías', true, false],
  ['Gestionar proveedores', true, false],
  ['Enviar y atender alertas de bajo stock', true, false],
  ['Generar y exportar reportes', true, false],
  ['Gestionar usuarios y roles', true, false],
  ['Ver la auditoría de todos los usuarios', true, false],
];

type Edicion = { tipo: 'nuevo' } | { tipo: 'editar'; usuario: UsuarioAdmin } | { tipo: 'clave'; usuario: UsuarioAdmin };

export function Usuarios() {
  const { usuario: yo } = useAuth();
  const usuarios = useDatos(() => api.usuarios());
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const estado = useEnvio();

  const cambiarEstado = async (u: UsuarioAdmin) => {
    const ok = await estado.ejecutar(() => api.estadoUsuario(u.id, !u.activo));
    if (ok) usuarios.recargar();
  };

  const titulo = edicion?.tipo === 'nuevo' ? 'Nuevo usuario' : edicion?.tipo === 'editar' ? 'Editar usuario' : 'Cambiar contraseña';

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Usuarios y roles</h1>
          <p>Dos roles: Administrador y Auxiliar de inventario. Un usuario desactivado ya no puede ingresar.</p>
        </div>
        <button type="button" className="boton boton--acento" onClick={() => setEdicion({ tipo: 'nuevo' })}>+ Nuevo usuario</button>
      </header>

      {(usuarios.error ?? estado.error) && <div className="mensaje mensaje--error" role="alert">{usuarios.error ?? estado.error}</div>}

      <div className="tabla-caja">
        <table className="tabla" style={{ minWidth: 960 }}>
          <thead>
            <tr><th>Usuario</th><th>Correo</th><th>Rol</th><th className="num">Movimientos</th><th>Último ingreso</th><th>Estado</th><th><span className="solo-lectores">Acciones</span></th></tr>
          </thead>
          <tbody>
            {(usuarios.datos ?? []).map((u) => {
              const soyYo = u.id === yo?.id;
              return (
                <tr key={u.id} style={u.activo ? undefined : { opacity: 0.6 }}>
                  <td style={{ fontWeight: 600 }}>{u.nombres} {u.apellidos}{soyYo && <span className="suave" style={{ fontWeight: 400 }}> (tú)</span>}</td>
                  <td>{u.email}</td>
                  <td><span className={`chip ${u.rol === 'ADMINISTRADOR' ? 'chip--azul' : 'chip--neutro'}`}>{nombreRol[u.rol]}</span></td>
                  <td className="num">{u.movimientos}</td>
                  <td>{u.ultimoIngreso ? fechaCorta(u.ultimoIngreso) : <span className="suave">Nunca</span>}</td>
                  <td><span className={`chip ${u.activo ? 'chip--ok' : 'chip--neutro'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="acciones">
                      <button type="button" className="boton boton--borde boton--chico" onClick={() => setEdicion({ tipo: 'editar', usuario: u })}>Editar</button>
                      <button type="button" className="boton boton--borde boton--chico" onClick={() => setEdicion({ tipo: 'clave', usuario: u })}>Contraseña</button>
                      {!soyYo && (
                        <button type="button" className={`boton boton--chico ${u.activo ? 'boton--peligro' : 'boton--borde'}`}
                          disabled={estado.enviando} onClick={() => cambiarEstado(u)}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {usuarios.cargando && !usuarios.datos && <div className="cargando">Cargando usuarios…</div>}
      </div>

      <section className="tarjeta">
        <h2>Matriz de permisos</h2>
        <div className="tabla-caja">
          <table className="tabla">
            <thead><tr><th>Permiso</th><th style={{ textAlign: 'center' }}>Administrador</th><th style={{ textAlign: 'center' }}>Auxiliar de inventario</th></tr></thead>
            <tbody>
              {permisos.map(([texto, admin, auxiliar]) => (
                <tr key={texto}>
                  <td>{texto}</td>
                  <td style={{ textAlign: 'center' }}>{admin ? 'Sí' : '—'}</td>
                  <td style={{ textAlign: 'center' }}>{auxiliar ? 'Sí' : <span className="suave">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialogo titulo={titulo} abierto={edicion !== null} onCerrar={() => setEdicion(null)}>
        {edicion?.tipo === 'clave' && (
          <FormularioClave usuario={edicion.usuario} onListo={() => setEdicion(null)} />
        )}
        {(edicion?.tipo === 'nuevo' || edicion?.tipo === 'editar') && (
          <FormularioUsuario
            usuario={edicion.tipo === 'editar' ? edicion.usuario : null}
            esYo={edicion.tipo === 'editar' && edicion.usuario.id === yo?.id}
            onGuardado={() => { setEdicion(null); usuarios.recargar(); }}
            onCancelar={() => setEdicion(null)}
          />
        )}
      </Dialogo>
    </>
  );
}

interface PropsFormulario {
  usuario: UsuarioAdmin | null;
  esYo: boolean;
  onGuardado: () => void;
  onCancelar: () => void;
}

function FormularioUsuario({ usuario, esYo, onGuardado, onCancelar }: PropsFormulario) {
  const [d, setD] = useState<DatosUsuario>(() =>
    usuario
      ? { nombres: usuario.nombres, apellidos: usuario.apellidos, email: usuario.email, rol: usuario.rol }
      : { nombres: '', apellidos: '', email: '', rol: 'AUXILIAR_INVENTARIO', password: '' },
  );
  const envio = useEnvio();
  const campo = <K extends keyof DatosUsuario>(k: K, v: DatosUsuario[K]) => setD((previo) => ({ ...previo, [k]: v }));

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await envio.ejecutar(() => (usuario ? api.editarUsuario(usuario.id, d) : api.crearUsuario(d)));
    if (ok) onGuardado();
  };

  return (
    <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="rejilla">
        <div className="campo">
          <label htmlFor="u-nombres">Nombres</label>
          <input id="u-nombres" className="entrada" required maxLength={100} value={d.nombres} onChange={(e) => campo('nombres', e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="u-apellidos">Apellidos</label>
          <input id="u-apellidos" className="entrada" required maxLength={100} value={d.apellidos} onChange={(e) => campo('apellidos', e.target.value)} />
        </div>
        <div className="campo ancho">
          <label htmlFor="u-email">Correo</label>
          <input id="u-email" className="entrada" type="email" required maxLength={150} value={d.email} onChange={(e) => campo('email', e.target.value)} />
        </div>
        <fieldset className="campo ancho" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="campo__etiqueta" style={{ marginBottom: 8 }}>Rol</legend>
          <div className="grupo-pastillas">
            {(['AUXILIAR_INVENTARIO', 'ADMINISTRADOR'] as Rol[]).map((r) => (
              <button key={r} type="button" className="pastilla" aria-pressed={d.rol === r} disabled={esYo && r !== 'ADMINISTRADOR'}
                onClick={() => campo('rol', r)}>{nombreRol[r]}</button>
            ))}
          </div>
          {esYo && <span className="suave" style={{ fontSize: 13, marginTop: 6 }}>No puedes quitarte el rol de administrador a ti mismo.</span>}
        </fieldset>
        {!usuario && (
          <div className="campo ancho">
            <label htmlFor="u-password">Contraseña inicial</label>
            <input id="u-password" className="entrada" type="password" required minLength={8} maxLength={72} autoComplete="new-password"
              value={d.password ?? ''} onChange={(e) => campo('password', e.target.value)} />
            <span className="suave" style={{ fontSize: 13 }}>Mínimo 8 caracteres.</span>
          </div>
        )}
      </div>
      {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
      <div className="fila fila--fin">
        <button type="button" className="boton boton--borde" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="boton" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}

function FormularioClave({ usuario, onListo }: { usuario: UsuarioAdmin; onListo: () => void }) {
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const envio = useEnvio();
  const distintas = repetir !== '' && clave !== repetir;

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (clave !== repetir) return;
    const r = await envio.ejecutar(async () => { await api.cambiarPassword(usuario.id, clave); return true; });
    if (r) onListo();
  };

  return (
    <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ margin: 0 }}>Nueva contraseña para <b>{usuario.nombres} {usuario.apellidos}</b>.</p>
      <div className="campo">
        <label htmlFor="k-nueva">Nueva contraseña</label>
        <input id="k-nueva" className="entrada" type="password" required minLength={8} maxLength={72} autoComplete="new-password"
          value={clave} onChange={(e) => setClave(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="k-repetir">Repite la contraseña</label>
        <input id="k-repetir" className="entrada" type="password" required aria-invalid={distintas} autoComplete="new-password"
          value={repetir} onChange={(e) => setRepetir(e.target.value)} />
        {distintas && <span className="ayuda-error">Las contraseñas no coinciden.</span>}
      </div>
      {envio.error && <div className="mensaje mensaje--error" role="alert">{envio.error}</div>}
      <div className="fila fila--fin">
        <button type="submit" className="boton" disabled={envio.enviando || distintas}>Cambiar contraseña</button>
      </div>
    </form>
  );
}
