import { api } from '@/src/lib/axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Container, Form, FormError, Header } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 letras' }),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(
    () => {
      if (router.query.username) {
        // preencher o valor router.query.username no campo username
        // transformamos para string pois o router.query pode enviar vários
        // parâmetros username, então se por acaso isso aconteça, transformamos
        // em uma String para fazer a concatenação desses 2 ou mais valores, ao invés
        // de mostrar como um array
        setValue('username', String(router.query.username))
      }
    },
    // uso o ponto de interrogação pois o valor pode ser opcional
    [router.query?.username, setValue],
  )

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })

      // redirecionando o usuário
      await router.push('/register/connect-calendar')
    } catch (err) {
      // caso o erro seja um objeto, e dentro de response eu tenha data e dentro de data
      // eu tenha message
      if (err instanceof AxiosError && err.response?.data?.message) {
        alert(err.response.data.message)
        // insiro um return aqui para ele não executar o console.error
        return
      }
      console.error(err)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem vindo ao Ignite Call</Heading>
        <Text>Precisamos de algumas informações para </Text>
        <MultiStep size={4} currentStep={1} />
      </Header>
      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="ignite.com/"
            placeholder="seu-usuario"
            {...register('username')}
          />
          {/* se tivermos erros */}
          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome Completo</Text>
          <TextInput placeholder="seu-nome" {...register('name')} />

          {/* se tivermos erros */}
          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
