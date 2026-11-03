import { useCallback, useState } from 'react';
import { ApiError } from '../api';

/** Ejecuta una acción contra la API guardando "enviando" y el mensaje de error */
export function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(async <T,>(accion: () => Promise<T>): Promise<T | undefined> => {
    setEnviando(true);
    setError(null);
    try {
      return await accion();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
      return undefined;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { enviando, error, setError, ejecutar };
}
