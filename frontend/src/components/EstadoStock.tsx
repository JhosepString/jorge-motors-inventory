import { estaBajoMinimo } from '../utils/formato';

interface Props {
  producto: { cantidadActual: number; stockMinimo: number };
  textos?: [normal: string, bajo: string];
}

/** Estado del stock en texto (no solo color), como pide el criterio de accesibilidad */
export function EstadoStock({ producto, textos = ['Normal', 'Bajo el mínimo'] }: Props) {
  const bajo = estaBajoMinimo(producto);
  return <span className={`chip ${bajo ? 'chip--aviso' : 'chip--ok'}`}>{bajo ? textos[1] : textos[0]}</span>;
}
