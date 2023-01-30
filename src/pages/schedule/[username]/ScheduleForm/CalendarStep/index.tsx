import { Calendar } from '@/src/components/Calendar'
import { Container, TimePicker, TimePickerHeader, TimePickerList, TimePickerItem } from './styles'

export const CalendarStep = () => {
  const isDateSelected = true

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            terça-feira <span>30 de janeiro</span>
          </TimePickerHeader>

          <TimePickerList>
            <TimePickerItem>
              15:00h
            </TimePickerItem>
            <TimePickerItem>
              15:00h
            </TimePickerItem>
            <TimePickerItem>
              15:00h
            </TimePickerItem>
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
