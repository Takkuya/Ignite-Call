import { PrismaAdapter } from '@/src/lib/auth/prisma-adapter'
import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

export const buildNextAuthOptions = (
  req: NextApiRequest,
  res: NextApiResponse,
): NextAuthOptions => {
  return {
    // enviando req e res para o prisma adapter
    adapter: PrismaAdapter(req, res),
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        authorization: {
          params: {
            scope:
              'https://www.googleapis.com/auth/userinfo.email  https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile',
          },
        },
        // profile => informações que o Google retorna quando fazemos login
        profile(profile: GoogleProfile) {
          // retornando os dados que eu quero acessar
          return {
            // sub => o que identifica o usuário unicamente
            id: profile.sub,
            name: profile.name,
            // não vem do Google e sim da nossa aplicação, por isso retornamos uma string vazia, já que também não usamos ele em outro lugar
            username: '',
            email: profile.email,
            // dessa forma conseguimos pegar a URL do avatar, já que antes a gente não conseguia pois o Google retorna a URL com outro nome
            // e nesse caso estamos "renomeando" o nome da propriedade
            avatar_url: profile.picture,
          }
        },
      }),
    ],

    callbacks: {
      // função chamada no momento que o usuário logou na aplicação
      async signIn({ account }) {
        if (
          !account?.scope?.includes('https://www.googleapis.com/auth/calendar')
        ) {
          return '/register/connect-calendar/?error=permissions'
        }

        return true
      },

      // tudo que é retornado dessa função é o que é passado para o front
      // criamos essa função, pois por padrão só temos accesso ao name e ao email
      // sendo que precisamos ter acesso as outras informações também
      async session({ session, user }) {
        return {
          ...session,
          // substituindo a informação de user
          // basicamente estou mandando todos os campos ao invés do campo name e email
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}
