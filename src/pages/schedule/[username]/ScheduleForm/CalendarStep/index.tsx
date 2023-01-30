import { Calendar } from '@/src/components/Calendar'
import { api } from '@/src/lib/axios'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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

export const CalendarStep = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)
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

  // carregando os dados da API toda vez que o selectedDate mudar
  useEffect(() => {
    if (!selectedDate) {
      return
    }

    api
      .get(`/users/${username}/availability`, {
        params: {
          date: dayjs(selectedDate).format('YYYY-MM-DD'),
        },
      })
      .then((response) => {
        setAvailability(response.data)
      })
  }, [selectedDate, username])

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
