// Repository: el acceso a datos de productos pasa por Prisma (cambiar de motor no toca este código)
import { prisma } from '../../db/prisma.ts';
import { noEncontrado } from '../../utils/errores.ts';
import { num } from '../../utils/peticion.ts';

const incluir = {
  categoria: { select: { nombre: true } },
  proveedor: { select: { razonSocial: true } },
  stock: { select: { cantidadActual: true, ubicacion: true } },
} as const;

type ProductoConRelaciones = Awaited<ReturnType<typeof buscarConRelaciones>>;
function buscarConRelaciones(id: number) {
  return prisma.producto.findUniqueOrThrow({ where: { id }, include: incluir });
}

/** Formato que recibe el frontend; sin precios cuando conPrecios es false (auxiliar de inventario) */
export function aProductoStock(p: NonNullable<ProductoConRelaciones>, conPrecios = true) {
  return {
    id: p.id,
    sku: p.sku,
    nombre: p.nombre,
    descripcion: p.descripcion,
    marca: p.marca,
    unidadMedida: p.unidadMedida,
    ...(conPrecios ? { precioCompra: num(p.precioCompra), precioVenta: num(p.precioVenta) } : {}),
    stockMinimo: p.stockMinimo,
    categoriaId: p.categoriaId,
    categoria: p.categoria.nombre,
    proveedorId: p.proveedorId,
    proveedor: p.proveedor?.razonSocial ?? null,
    cantidadActual: p.stock?.cantidadActual ?? 0,
    ubicacion: p.stock?.ubicacion ?? null,
    activo: p.activo,
  };
}

export interface FiltroProductos {
  buscar?: string;
  categoriaId?: number;
  soloBajoMinimo: boolean;
  incluirInactivos: boolean;
}

export async function listarProductos(f: FiltroProductos, conPrecios: boolean) {
  const texto = f.buscar?.trim();
  const filas = await prisma.producto.findMany({
    where: {
      activo: f.incluirInactivos ? undefined : true,
      categoriaId: f.categoriaId,
      OR: texto
        ? [{ sku: { contains: texto } }, { nombre: { contains: texto } }, { marca: { contains: texto } }]
        : undefined,
    },
    include: incluir,
    orderBy: { sku: 'asc' },
  });
  const productos = filas.map((p) => aProductoStock(p, conPrecios));
  return f.soloBajoMinimo ? productos.filter((p) => p.cantidadActual < p.stockMinimo) : productos;
}

export async function obtenerProducto(id: number, conPrecios = true) {
  const p = await prisma.producto.findUnique({ where: { id }, include: incluir });
  if (!p) throw noEncontrado('El producto no existe.');
  return aProductoStock(p, conPrecios);
}

export interface DatosProducto {
  sku: string;
  nombre: string;
  descripcion: string | null;
  marca: string | null;
  unidadMedida: string;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  categoriaId: number;
  proveedorId: number | null;
  ubicacion: string | null;
}

export async function crearProducto(d: DatosProducto) {
  const { ubicacion, ...producto } = d;
  const creado = await prisma.producto.create({
    data: { ...producto, stock: { create: { cantidadActual: 0, ubicacion } } },
  });
  return obtenerProducto(creado.id);
}

export async function editarProducto(id: number, d: DatosProducto) {
  const antes = await obtenerProducto(id);
  const { ubicacion, ...producto } = d;
  await prisma.$transaction([
    prisma.producto.update({ where: { id }, data: producto }),
    prisma.stock.upsert({
      where: { productoId: id },
      update: { ubicacion },
      create: { productoId: id, cantidadActual: 0, ubicacion },
    }),
  ]);
  return { antes, despues: await obtenerProducto(id) };
}

export async function cambiarEstadoProducto(id: number, activo: boolean) {
  await obtenerProducto(id);
  await prisma.producto.update({ where: { id }, data: { activo } });
  return obtenerProducto(id);
}
