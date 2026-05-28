import { PrismaClient } from '@prisma/client'

// Protection radicale pour le navigateur
if (typeof window !== "undefined") {
  throw new Error("Prisma ne peut pas être chargé côté client.");
}
//creation de nouv inst
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma