export const convertTimeStringToMinutes = (timeString: string) => {
  // para saber as horas e os minutos
  // na sintaxe do Number é como se fossse (item => Number(item))
  const [hours, minutes] = timeString.split(':').map(Number)

  return hours * 60 + minutes
}
