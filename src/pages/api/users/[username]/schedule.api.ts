import { getGoogleOAuthToken } from '@/src/lib/google'
import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
import { google } from 'googleapis'
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  // não é bem uma validação, pois já fizemos uma validação anteriormente,
  // seria mais uma dupla verificação e um parse
  const createSchedulingBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    observations: z.string(),
    // faz automaticamente a conversão de strings que vem em formato de data para o objeto Date do javascript
    date: z.string().datetime(),
  })

  // lembrando que não existe params dentro do Next, por isso usamos o query
  const username = String(req.query.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  // pegando do body, no caso os dados do nosso formulário
  const { name, email, observations, date } = createSchedulingBodySchema.parse(
    req.body,
  )

  // forçar pelo lado do backend que toda hora nunca esteja criada, sempre no começo da hora
  // mais fácil validar
  const schedulingDate = dayjs(date).startOf('hour')

  // precisamos validar os dados ainda mesmo que a gente já tenha feito as validações anteriormente
  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({ message: 'Date is in the past' })
  }

  const confilictingScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate(),
    },
  })

  if (confilictingScheduling) {
    return res
      .status(400)
      .json({ message: 'There is another scheduling at the same time' })
  }

  const scheduling = await prisma.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id,
    },
  })

  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  })

  await calendar.events.insert({
    // pega o calendário principal, o padrão para a criação de eventos
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      // título
      summary: `Ignite Call ${name}`,
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
      },
      end: {
        // adicionamos 1 hora pois o horário de término sempre é 1 hora depois do horário de ínicio
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      // convidados
      attendees: [{ email, displayName: name }],
      // criar o envento como chamada do Google Meet
      conferenceData: {
        // criar a chamada no momento que eu criar o evento na agenda do usuário
        createRequest: {
          // precisa ser um valor qualquer porém único
          requestId: scheduling.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })

  return res.status(201).end()
}
