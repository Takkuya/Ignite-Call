// essa rota basicamente vai ser responsável por receber nosso form e processar/salvar as informações dentro do
// registro de usuário
import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { z } from 'zod'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
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
  const { intervals } = timeIntervalsBodySchema.parse(req.body)

  // não utilizamos o createMany por causa da limitação do SQLite que não permite a inserção múltipla de valores
  // await prisma.userTimeInterval.createMany
  // criar todos os registros simultaneamente
  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeInterval.create({
        data: {
          week_day: interval.weekDay,
          time_start_in_minutes: interval.startTimeInMinutes,
          time_end_in_minutes: interval.endTimeInMinutes,
          user_id: session.user?.id,
        },
      })
    }),
  )

  // não preciso retornar os dados do banco de dados
  return res.status(201).end()
}
