import { prisma } from '@/src/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    // 405 => method not allowed
    // .end termina a resposta sem nenhum corpo
    return res.status(405).end()
  }

  const { name, username } = req.body

  // validação caso o username já exista
  // findUnique => Achar um registro por algum campo que seja único
  const userExists = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (userExists) {
    return res.status(400).json({
      message: 'Username already exists',
    })
  }

  // cadastrando o usuário no Prisma
  const user = await prisma.user.create({
    // quais dados quero utilizar ao criar a coluna
    data: {
      name,
      username,
    },
  })

  // preciso enviar o res para ele criar o header/cabeçalho
  setCookie(
    {
      res,
    },
    '@ignite-call:userId',
    user.id,
    // é obrigatório passar o tempo de duração de um cookie
    {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      // cookies está acessível em toda a aplicação
      path: '/',
    },
  )

  return res.status(201).json(user)
}
