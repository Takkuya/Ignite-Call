import { Calendar } from '@/src/components/Calendar'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerList,
  TimePickerItem,
} from './styles'

export const CalendarStep = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  //! ! => transformando em boolean
  const isDateSelected = !!selectedDate

  // se o selectedDate existe
  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  // [ de ] é um "escape" semelhente aos espaces de string iterals
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD[ de ] MMMM')
    : null

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            <TimePickerItem>15:00h</TimePickerItem>
            <TimePickerItem>15:00h</TimePickerItem>
            <TimePickerItem>15:00h</TimePickerItem>
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
