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
}
