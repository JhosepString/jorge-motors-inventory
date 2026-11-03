import type { Categoria } from '../api';

interface Props {
  categorias: Categoria[];
  valor: number | null;
  onCambiar: (id: number | null) => void;
}

export function FiltroCategorias({ categorias, valor, onCambiar }: Props) {
  return (
    <div className="grupo-pastillas" role="group" aria-label="Filtrar por categoría">
      <button type="button" className="pastilla" aria-pressed={valor === null} onClick={() => onCambiar(null)}>
        Todas
      </button>
      {categorias.map((c) => (
        <button key={c.id} type="button" className="pastilla" aria-pressed={valor === c.id} onClick={() => onCambiar(c.id)}>
          {c.nombre}
        </button>
      ))}
    </div>
  );
}
