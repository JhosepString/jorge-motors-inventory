import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ApiError } from '../api';
import { inicioDeRol, useAuth } from '../auth/sesion';
import { IconoCandado, IconoLlave } from '../components/Iconos';
import './Login.css';

export function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={inicioDeRol(usuario.rol)} replace />;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      const u = await iniciarSesion(email, password, recordar);
      const desde = (ubicacion.state as { desde?: string } | null)?.desde;
      navegar(desde && desde !== '/login' ? desde : inicioDeRol(u.rol), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.');
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <section className="login__portada">
        <div className="marca">
          <div className="marca__logo login__logo"><IconoLlave tam={28} /></div>
          <div>
            <div className="marca__nombre login__marca">Jorge Motors</div>
            <div className="marca__sub login__sub">Mecánica automotriz</div>
          </div>
        </div>
        <div className="login__mensaje">
          <h1>El inventario del taller, al día en cada salida.</h1>
          <p>Registra entradas y salidas de repuestos, consulta el stock en tiempo real y recibe alertas antes de quedarte sin productos.</p>
          <div className="login__etiquetas">
            <span>Stock en tiempo real</span>
            <span>Alertas a proveedores</span>
            <span>Kardex y auditoría</span>
          </div>
        </div>
        <div className="login__sub">UPIS Húsares de Junín, Pueblo Nuevo, Chincha — Ica</div>
      </section>

      <section className="login__lado">
        <form className="login__form" onSubmit={enviar} noValidate>
          <div>
            <h2>Iniciar sesión</h2>
            <p className="suave">Ingresa con la cuenta que te asignó el administrador.</p>
          </div>

          {error && <div className="mensaje mensaje--error" role="alert">{error}</div>}

          <div className="campo">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" className="entrada" type="email" autoComplete="username" autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input id="password" className="entrada" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <label className="login__recordar">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            Mantener la sesión en este equipo
          </label>
          <button type="submit" className="boton boton--grande" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
          <div className="mensaje mensaje--info login__nota">
            <IconoCandado />
            <span>El sistema reconoce tu rol al ingresar: el <b>administrador</b> ve todo el panel; el <b>auxiliar de inventario</b> va directo a registrar salidas.</span>
          </div>
          {import.meta.env.DEV && (
            <div className="mensaje mensaje--aviso login__demo">
              <b>Usuarios de prueba</b> (datos_prueba.sql):<br />
              admin@jorgemotors.pe · Admin123*<br />
              carlos.quispe@jorgemotors.pe · Auxiliar123*
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
