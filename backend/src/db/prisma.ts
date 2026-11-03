// Singleton: una sola instancia de PrismaClient para toda la API
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../generated/prisma/client.ts';
import { config } from '../config.ts';

const adaptador = new PrismaMssql(config.DATABASE_URL);

export const prisma = new PrismaClient({ adapter: adaptador });

export type Prisma = typeof prisma;
export type Transaccion = Parameters<Parameters<Prisma['$transaction']>[0]>[0];
