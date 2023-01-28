import NextAuth from 'next-auth'

declare module 'next-auth' {
  // nomeamos User pois interface AdapterUser extends User
  interface User {
    id: string
    name: string
    email: string
    username: string
    avatar_url: string
  }

  // criamos essa interface por causa do que retornamos no [...nextauth].api.ts
  interface Session{
    user: User
  }
}
