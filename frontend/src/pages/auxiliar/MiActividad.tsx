import { useState } from 'react';
import { api } from '../../api';
import { TablaAuditoria } from '../../components/TablaAuditoria';
import { useDatos } from '../../utils/useDatos';

export function MiActividad() {
  const [pagina, setPagina] = useState(1);
  const registros = useDatos(() => api.miActividad({ pagina, porPagina: 20 }), [pagina]);

  return (
    <>
      <header className="cabecera">
        <div>
          <h1>Mi actividad</h1>
          <p>Lo que registraste en el sistema con tu usuario: ingresos, salidas y cierres de sesión.</p>
        </div>
      </header>
      {registros.error && <div className="mensaje mensaje--error" role="alert">{registros.error}</div>}
      <TablaAuditoria pagina={registros.datos} mostrarUsuario={false} onPagina={setPagina} />
    </>
  );
}
