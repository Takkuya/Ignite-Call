import { api } from '@/src/lib/axios'
import { getWeekDays } from '@/src/utils/get-week-days'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { CaretLeft, CaretRight } from 'phosphor-react'
import { useMemo, useState } from 'react'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'

type CalendarWeek = {
  week: number
  days: { date: dayjs.Dayjs; disabled: boolean }[]
}

type CalendarWeeks = CalendarWeek[]

type CalendarProps = {
  selectedDate: Date | null
  onDateSelected: (date: Date) => void
}

type BlockedDates = {
  blockedWeekDays: number[]
}

export const Calendar = ({ selectedDate, onDateSelected }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(() => {
    // setando o dia de 1 pois só quero saber a informação do mês e ano, não quero saber a informação do dia
    return dayjs().set('date', 1)
  })

  const router = useRouter()

  function handlePreviousMonth() {
    // subtract => subtrair 1 mês dela
    const previousMonthDate = currentDate.subtract(1, 'month')

    setCurrentDate(previousMonthDate)
  }

  function handleNextMonth() {
    // add => adicionar 1 mês dela

    const nextMonthDate = currentDate.add(1, 'month')

    setCurrentDate(nextMonthDate)
  }

  const shortWeekDays = getWeekDays({ short: true })

  // MMMM => mês por extenso basicamente
  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')

  const username = String(router.query.username)

  // carregando os dados da API toda vez que o selectedDate mudar
  // utilizando react query
  const { data: blockedDates } = useQuery<BlockedDates>(
    // fazer o cache por mês e por ano
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        params: {
          year: currentDate.get('year'),
          month: currentDate.get('month'),
        },
      })

      return response.data
    },
  )

  // array de arrays, cada array vai representar os dias de 1 semana
  // vamos usar o useMemo para não precisarmos executar os cálculos toda hora que o código renderizar
  const calendarWeeks = useMemo(() => {
    // validação para o typescript não reclamar
    // e também evitamos que o calendário apareça antes de terminamos a chamada de API que busca as dadas bloqueadas
    if (!blockedDates) {
      return []
    }

    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, idx) => {
      // date => dia
      // não usamos day pois o day no javascript representa o dia da semana
      return currentDate.set('date', idx + 1)
    })

    // pegar o dia da semana do primeiro dia do mês
    // sempre vai retornar a quantidade de dias que faltaram para preencher a linha dos dias do mês anterior
    const firstWeekDay = currentDate.get('day')

    // criar um array com os 4 dias do mês anterior (exemplo) para preencher o nosso array (semelhante ao Google Agenda)
    // retorno os últimos dias do mês anterior
    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, idx) => {
        return currentDate.subtract(idx + 1, 'day')
      })
      .reverse()

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    )

    // para saber quantos dias precisamos do próximo mês, precisamos saber qual o dia da semana do último dia do mês
    const lastWeekDay = lastDayInCurrentMonth.get('day')
    const nextMonthFillArray = Array.from({
      // somo 1 pois lastWeekday começa do 0
      length: 7 - (lastWeekDay + 1),
    }).map((_, idx) => {
      return lastDayInCurrentMonth.add(idx + 1, 'day')
    })

    const previousMonthFillArrayFormatted = previousMonthFillArray.map(
      (date) => {
        return { date, disabled: true }
      },
    )

    const daysInMonthArrayFormatted = daysInMonthArray.map((date) => {
      // desabilitado dias antes das 23:59 de hj
      // ou desabilitar caso inclua um dia da semana que está desabilitado
      return {
        date,
        disabled:
          date.endOf('day').isBefore(new Date()) ||
          blockedDates.blockedWeekDays.includes(date.get('day')),
      }
    })

    const nextMonthFillArrayFormatted = nextMonthFillArray.map((date) => {
      return { date, disabled: true }
    })

    // somar todos os dias em um único array
    const calendarDays = [
      ...previousMonthFillArrayFormatted,
      ...daysInMonthArrayFormatted,
      ...nextMonthFillArrayFormatted,
    ]

    // dividindo os valores por semanas
    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      // weeks => informação que vou manipular
      // _ => cada um dos dias que tenho no calendarDays, mas não vou utilizar ele por isso o underline
      // nesse caso o idx acaba sendo melhor, já que quando ele atingir o valor 6 (último dia da semana) vamos para o próximo valor
      // original => retorna o valor original (array original), podiamos utilizar o calendarDays ao invés do original
      // porém conseguimos manipular o original sem modificar o valor do calendarDays
      (weeks, _, idx, original) => {
        // se meu índice  for divisível por 7 quer dizer que eu cheguei ao final da semana
        const isNewWeek = idx % 7 === 0

        if (isNewWeek) {
          weeks.push({
            week: idx / 7 + 1,
            days: original.slice(idx, idx + 7),
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate, blockedDates])

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>
        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Previous month">
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth} title="Next month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>
      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => {
              return <th key={weekDay}>{weekDay}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        onClick={() => onDateSelected(date.toDate())}
                        disabled={disabled}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
