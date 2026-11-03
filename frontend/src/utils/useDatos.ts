import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

interface Estado<T> {
  id: string;
  datos: T | null;
  error: string | null;
}

/**
 * Carga datos de la API y expone cargando / error / recargar.
 * Vuelve a cargar cuando cambian las dependencias; si llega una respuesta vieja
 * (por ejemplo, de una búsqueda anterior) se descarta. Mientras carga, conserva los datos anteriores.
 */
export function useDatos<T>(cargar: () => Promise<T>, dependencias: unknown[] = []) {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState<Estado<T>>({ id: '', datos: null, error: null });
  const cargarRef = useRef(cargar);
  const id = `${JSON.stringify(dependencias)}#${version}`;

  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    let vigente = true;
    cargarRef.current()
      .then((datos) => { if (vigente) setEstado({ id, datos, error: null }); })
      .catch((e: unknown) => {
        const error = e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.';
        if (vigente) setEstado((previo) => ({ id, datos: previo.datos, error }));
      });
    return () => { vigente = false; };
  }, [id]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return {
    datos: estado.datos,
    error: estado.id === id ? estado.error : null,
    cargando: estado.id !== id,
    recargar,
  };
}
