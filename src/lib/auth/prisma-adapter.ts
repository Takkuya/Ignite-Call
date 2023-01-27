import { NextApiRequest, NextApiResponse } from 'next'
import { Adapter } from 'next-auth/adapters'
import { destroyCookie, parseCookies } from 'nookies'
import { prisma } from '../prisma'

export const PrismaAdapter = (
  req: NextApiRequest,
  res: NextApiResponse,
): Adapter => {
  return {
    // com base no id de usuário do cookie eu preciso preencher as demais informações
    // o problema é que o PrismaAdapter não tem acesso aos cookies
    // isso porque só temos acesso aos cookies através do req e res
    async createUser(user) {
      // buscando todos os cookies
      // realizamos a desestruturação para pegar um único cookies já que o parseCookies retorna todos os cookies
      // chamamos ele de userIdOnCookies, o nome que eu quero para a variável
      const { '@ignite-call:userId': userIdOnCookies } = parseCookies({ req })

      if (!userIdOnCookies) {
        throw new Error('User ID not found on cookies.')
      }

      // conectando o usuário ao prisma
      const prismaUser = await prisma.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      // depois que o usuário foi utilizado vamos apagar o cookies
      // sempre que modificamos os cookies utilizamos o res
      // se estamos buscando utilizamos o req
      destroyCookie(
        { res },
        '@ignitecall:userId',
        // apagando os cookies em todas as páginas
        {
          path: '/',
        },
      )

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        // usamos o ! para falar para o TypeScript que esses dados vão ser informados
        avatar_url: prismaUser.avatar_url!,
        email: prismaUser.email!,
        // enviamos como null pois ele não existe mais no nosso Model
        emailVerified: null,
      }
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        // usamos o ! para falar para o TypeScript que esses dados vão ser informados
        avatar_url: user.avatar_url!,
        email: user.email!,
        // enviamos como null pois ele não existe mais no nosso Model
        emailVerified: null,
      }
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        // usamos o ! para falar para o TypeScript que esses dados vão ser informados
        avatar_url: user.avatar_url!,
        email: user.email!,
        // enviamos como null pois ele não existe mais no nosso Model
        emailVerified: null,
      }
    },
    async getUserByAccount({ providerAccountId, provider }) {
      // precisa ser um findUnique
      const account = await prisma.account.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id: providerAccountId,
          },
        },
        // incluio o relacionamento do usuário
        include: {
          user: true,
        },
      })

      if (!account) {
        return null
      }

      const { user } = account

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        // usamos o ! para falar para o TypeScript que esses dados vão ser informados
        avatar_url: user.avatar_url!,
        email: user.email!,
        // enviamos como null pois ele não existe mais no nosso Model
        emailVerified: null,
      }
    },
    async updateUser(user) {
      // atribuimos uma variável prisma.user.update por causa do Partial no user (hover no user)
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        // dados que podemos alterar
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        // usamos o ! para falar para o TypeScript que esses dados vão ser informados
        avatar_url: prismaUser.avatar_url!,
        email: prismaUser.email!,
        // enviamos como null pois ele não existe mais no nosso Model
        emailVerified: null,
      }
    },
    // caso o usuário já tenha conta em outro provider e agora ele tá logando com outro provider
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },
    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          user_id: userId,
          expires,
          session_token: sessionToken,
        },
      })

      return {
        userId,
        expires,
        sessionToken,
      }
    },
    async getSessionAndUser(sessionToken) {
      const prismaSession = await prisma.session.findUnique({
        where: {
          session_token: sessionToken,
        },
        include: {
          user: true,
        },
      })

      if (!prismaSession) {
        return null
      }

      const { user, ...session } = prismaSession

      return {
        session: {
          userId: session.user_id,
          expires: session.expires,
          sessionToken: session.session_token,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          // usamos o ! para falar para o TypeScript que esses dados vão ser informados
          avatar_url: user.avatar_url!,
          email: user.email!,
          emailVerified: null,
          // enviamos como null pois ele não existe mais no nosso Model
        },
      }
    },
    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.update({
        where: {
          session_token: sessionToken,
        },
        // dados que podemos alterar
        data: {
          expires,
          user_id: userId,
        },
      })

      return {
        // retornamos usando o prismaSession para não dar undefined / incompatible no typescript
        sessionToken: prismaSession.session_token,
        userId: prismaSession.user_id,
        expires: prismaSession.expires,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          session_token: sessionToken,
        },
      })
    },
  }
}
