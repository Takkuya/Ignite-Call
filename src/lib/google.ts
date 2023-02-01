// essa função sempre vai ser chamada quando a gente for se comunicar com a API do Google

import dayjs from 'dayjs'
import { google } from 'googleapis'
import { prisma } from './prisma'

//  ela vai se comunicar com o banco de dados vendo se o token expirou ou não
export async function getGoogleOAuthToken(userId: string) {
  // nem preciso validar se o account existe por causa do throw
  const account = await prisma.account.findFirstOrThrow({
    where: {
      provider: 'google',
      user_id: userId,
    },
  })

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : null,
  })

  // se não tiver data de expiração ele não expira nunca
  if (!account.expires_at) {
    return auth
  }

  // precisamos realizar essa verificação, já que o access-token poken pode ter expirado
  // por isso verificamos se eu preciso atualizar o token
  // multiplicado por 1000 pois ele é salvo em epoc time stamp
  // e esse valor é em segundos, mas o dayjs precisa ler o valor em milissegundos
  const isTokenExpired = dayjs(account.expires_at * 1000).isBefore(new Date())

  if (isTokenExpired) {
    const { credentials } = await auth.refreshAccessToken()
    // temos acesso à todas as informações do token
    const {
      access_token,
      expiry_date,
      id_token,
      refresh_token,
      scope,
      token_type,
    } = credentials

    // salvando no prisma
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        access_token,
        // precisa ser salvo em segundos e não em milissegundos
        // salvamos em segundo pois ocupamos menos espaço, salvamos em um INT e não em um BIG INT
        expires_at: expiry_date ? Math.floor(expiry_date / 1000) : null,
        id_token,
        refresh_token,
        scope,
        token_type,
      },
    })

    // setando as credenciais que vieram do processo de refresh
    auth.setCredentials({
      access_token,
      refresh_token,
      expiry_date,
    })
  }

  return auth
}
