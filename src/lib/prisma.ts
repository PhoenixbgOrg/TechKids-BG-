// Use a namespace import to resolve "no exported member" error when the Prisma client is not yet generated.
import * as Prisma from '@prisma/client';

// Extract PrismaClient from the namespace using type casting to avoid compilation errors.
const { PrismaClient } = Prisma as any;

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;