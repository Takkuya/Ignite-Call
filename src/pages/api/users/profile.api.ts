import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { z } from 'zod'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

const updateProfileBodySchema = z.object({
  bio: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
    return res.status(405).end()
  }

  // obtendo dados do usuário logado
  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  // caso o usuário não esteja autenticado
  if (!session) {
    return res.status(401).end()
  }

  // o parse já faz disparar um erro caso o body não venha com os formatos do schema
  // se eu quisesse que ele não retornasse um erro eu podia utilizar o safe parse
  const { bio } = updateProfileBodySchema.parse(req.body)

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      bio,
    },
  })

  // não preciso retornar os dados do banco de dados
  // 204 => sucesso porém resposta sem conteúdo
  return res.status(204).end()
}
