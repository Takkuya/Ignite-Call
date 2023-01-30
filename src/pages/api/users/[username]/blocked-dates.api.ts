import { prisma } from '@/src/lib/prisma'
// import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  // lembrando que não existe params dentro do Next, por isso usamos o query
  const username = String(req.query.username)
  // exemplo rota => http://localhost:3333/api/users/username/availability?date=2023-01-30
  // através dessa rota pegar todos os horários disponíveis naquele dia
  const { year, month } = req.query

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month not specified' })
  }

  // buscando usuário do DB
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  // dias da semana que tenho disponibilidade
  const avaiableWeekDays = await prisma.userTimeInterval.findMany({
    // pegar apenas o dia da semana, sem pegar os outros campos
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  // dias da semana que quero bloquear
  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !avaiableWeekDays.some(
      (avaiableWeekDay) => avaiableWeekDay.week_day === weekDay,
    )
  })

  return res.json({ blockedWeekDays })
}
