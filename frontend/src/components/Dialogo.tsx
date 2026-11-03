import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
}

/** Ventana modal con <dialog> nativo: atrapa el foco y se cierra con Esc */
export function Dialogo({ titulo, abierto, onCerrar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog ref={ref} className="dialogo" aria-labelledby={idTitulo} onClose={onCerrar}>
      {abierto && (
        <div className="dialogo__cuerpo">
          <div className="dialogo__cabecera">
            <h2 id={idTitulo}>{titulo}</h2>
            <button type="button" className="dialogo__cerrar" aria-label="Cerrar" onClick={onCerrar}>×</button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
