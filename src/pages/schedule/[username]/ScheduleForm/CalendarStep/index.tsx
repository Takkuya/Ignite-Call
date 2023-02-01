import { Calendar } from '@/src/components/Calendar'
import { api } from '@/src/lib/axios'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerList,
  TimePickerItem,
} from './styles'

type Availability = {
  possibleTimes: number[]
  availableTimes: number[]
}

type CalendarStepProps = {
  onSelectDateTime: (date: Date) => void
}

export const CalendarStep = ({ onSelectDateTime }: CalendarStepProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // pegando username da rota
  const router = useRouter()

  //! ! => transformando em boolean
  const isDateSelected = !!selectedDate
  // pegando username da rota
  const username = String(router.query.username)

  // se o selectedDate existe
  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  // [ de ] é um "escape" semelhente aos espaces de string iterals
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD[ de ] MMMM')
    : null

  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null

  // carregando os dados da API toda vez que o selectedDate mudar
  // utilizando react query
  const { data: availability } = useQuery<Availability>(
    ['availability', selectedDateWithoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        params: {
          date: selectedDateWithoutTime,
        },
      })

      return response.data
    },
    // só executa caso haja um selectedDate
    { enabled: !!selectedDate },
  )

  // vai ser chamada quando o usuário selecionar um horário
  function handleSelectTime(hour: number) {
    const dateWithTime = dayjs(selectedDate)
      .set('hour', hour)
      .startOf('hour')
      .toDate()

    onSelectDateTime(dateWithTime)
  }

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map((hour) => {
              return (
                // padStart => preenchendo com 0 caso seja menor seja números abaixo de 10
                <TimePickerItem
                  key={hour}
                  onClick={() => handleSelectTime(hour)}
                  disabled={!availability.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              )
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
