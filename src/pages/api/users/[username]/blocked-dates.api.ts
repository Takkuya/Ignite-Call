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

  // retornando dias que estão cheios
  // uma única query precisa retornar todas as informações de todos os dias que estão cheios
  // seria praticamente inviável fazer uma query por dia

  // não temos como fazer essa query usando o formato do Prisma, por isso precisamos fazer uma query "raw"
  const blockedDatesRaw = await prisma.$queryRaw`
    -- buscar todos os schedulings possíveis daquele mês daquele usuário
    SELECT *
    FROM schedulings S

    -- pegando os schedulings de um usuário específico
    WHERE S.user_id = ${user.id}
      -- retorna ano e mês
      -- verificamos se essa data é igual ao ano/mês da query/parâmetro da rota
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
  
  `

  return res.json({ blockedWeekDays, blockedDatesRaw })
}
