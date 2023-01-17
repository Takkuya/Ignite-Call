import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  // faz o log de todas as querys executadas no banco de dados dentro do terminal
  log: ['query'],
})
