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
  const isDateSelected = false

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar />

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
