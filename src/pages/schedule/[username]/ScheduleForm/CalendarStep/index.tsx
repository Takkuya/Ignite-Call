import { Calendar } from '@/src/components/Calendar'
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

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            terça-feira <span>30 de janeiro</span>
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
