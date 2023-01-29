import { prisma } from '@/src/lib/prisma'
import { Avatar, Heading, Text } from '@ignite-ui/react'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ScheduleForm } from './ScheduleForm'
import { Container, UserHeader } from './styles'

type ScheduleProps = {
  user: {
    name: string
    bio: string
    avatarUrl: string
  }
}

export default function Schedule({ user }: ScheduleProps) {
  return (
    <Container>
      <UserHeader>
        <Avatar src={user.avatarUrl} />
        <Heading>{user.name}</Heading>
        <Text>{user.bio}</Text>
      </UserHeader>

      <ScheduleForm />
    </Container>
  )
}

// simbolizando para quais usuário queremos gerar páginas estáticas na hora da build da nossa aplicação
export const getStaticPaths: GetStaticPaths = async () => {
  // passo um array vazio, pois dessa forma ele não vai gerar nenhuma página
  // já que queremos ir gerando conforme os usuários forem acessando a página
  // ou seja, a página só vai ser gerada quando um usuário acessar essa página
  return {
    paths: [],
    // se o usuário tentar acessar uma página que ainda não foi gerada de forma estática, ele busca os dados no banco
    // vai gerar a página pelo lado do serverSide do next e quando estiver pronto vai mostrar essa informações para o usuário
    fallback: 'blocking',
  }
}

// aplicar o comportamento de página estática, já que essas informações de usuário raramente mudam
// e esse componente vai estar presente na tela principal da aplicação
// usamos params pois páginas estáticas não possuem req nem res, pois elas são geradas após a build da aplicação
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username)

  //  como o getStaticProps sempre vai ser executado do lado do servidor, podemos trabalhar dentro dele como se
  // estivessemos em um backend, podemos fazer query, acessar dados sensíveis etc.

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  // erro 404 do Next caso o usuário não seja encontrado
  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    // quanto em quanto tempo quero que essa página seja recriada
    revalidate: 60 * 60 * 24, // 1day
  }
}
