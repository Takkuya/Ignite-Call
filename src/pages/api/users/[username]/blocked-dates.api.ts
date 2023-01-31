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
  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    -- buscar todos os schedulings possíveis daquele mês daquele usuário
    -- tudo que eu coloco no groupby precisa estar no SELECT
    SELECT 
      EXTRACT(DAY FROM S.date) AS date,
      -- mostrando quantos schedulings tenho no dia
      COUNT(S.date) AS amount,
      -- quantos horários eu tenho disponível
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size
    FROM schedulings S
    
    -- qual o total de horários que eu tenho disponíveis naquele dia?
    LEFT JOIN user_time_intervals UTI
      -- adicionando 1 nos dias, pois o SQL o dia/semana começa no 1 ao invés do 0 do javascript
      ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 day))

    -- pegando os schedulings de um usuário específico
    WHERE S.user_id = ${user.id}
      -- retorna ano e mês
      -- verificamos se essa data é igual ao ano/mês da query/parâmetro da rota
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}
    -- agrupar meus schedulings
    GROUP BY EXTRACT(DAY FROM S.date),  
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)

    -- retornar todos os registros que sobrarão onde o amount seja maior ou igual ao size
    -- quer dizer o tanto de agendamentos que tenho em um dia seja igual ou superior ao tanto de disponibilidade que eu tenho no dia
    -- ou se o size retornar 0 também retorno o dia como um dia indisponível, porque ai quer dizer que o usuário não tem nenhuma disponibilidade
    -- naquele dia
    HAVING amount >= size
  `

  // retornando somente o/os dias específicos bloqueados (date)
  const blockedDates = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDates })
}
