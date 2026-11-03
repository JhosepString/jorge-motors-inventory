import { useEffect, useState } from 'react';

/** Devuelve el valor después de una pausa al escribir, para no consultar la API en cada tecla */
export function useRetrasado<T>(valor: T, ms = 300): T {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return retrasado;
}
