import { useState } from 'react'
import { CalendarStep } from './CalendarStep'
import { ConfirmStep } from './ConfirmStep'
// import { ConfirmStep } from './ConfirmStep'

export const ScheduleForm = () => {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>()

  // vai preencher o selectedDateTime com null
  function handleClearSelectedDateTime() {
    setSelectedDateTime(null)
  }

  if (selectedDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectedDateTime}
        onCancelConfirmation={handleClearSelectedDateTime}
      />
    )
  }

  return <CalendarStep onSelectDateTime={setSelectedDateTime} />
}
