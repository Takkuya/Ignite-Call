import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
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
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
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

  // transformando a data
  // lembrando que eu converto para string pois podemos receber um array no query params
  const referenceDate = dayjs(String(date))

  // validação data que já passou
  // precisamos fazer isso, pois a nossa API não pode depender apenas de validações client side/frontend
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    // não existe disponibilidade nenhuma no dia
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  // precisamos fazer um cruzamento de dados, precisamos verificar se temos "schedulings" suficientes para cobrir todos
  // os intervalos de tempo que o usuário tem, se não quais os horários que não tenho "schedulings" ativos

  // selecionando a disponibilidade do usuário
  // buscando no banco de dados o intervalo de tempo que o usuário simbolizou que ele vai estar disponível onde
  // o dia da semana bate exatamente com a data que eu tô chamando a rota de disponibilidade
  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      // retorna o dia da semana
      week_day: referenceDate.get('day'),
    },
  })

  // se o usuário não tem disponibilidade esse dia
  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  // se eu tiver pelo menos um horário disponível nesse dia
  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  // converter para horas (já que salvamos em minutes)
  // lembrando que se o agendamento não fosse de hora em hora, a gente não ia poder dividir por 60, ia quebrar o aplicativo
  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  // criar um array com todas as horas disponíveis no intervalo de tempo
  // lembrando que não pegamos o valor pois ele vai ser undefined
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, idx) => {
      return startHour + idx
    },
  )

  // verificando se já não existe algum "scheduling"/agendamento nos horários disponíveis
  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        // gte => greater than or equal => maior ou igual a
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  })

  // fazendo a interseção entre os valores
  // pegando todos os horários disponíveis e validando que não existe um agendamento naquele horário
  const availableTimes = possibleTimes.filter((time) => {
    // manter apenas quando não existe
    // some => pelo menos um
    return !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
  })

  return res.json({ possibleTimes, availableTimes })
}
