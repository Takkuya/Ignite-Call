type GetWeekDaysParams = {
  short?: boolean
}

// = {} => colocamos para o typescript parar de reclamar
export function getWeekDays({ short = false }: GetWeekDaysParams = {}) {
  // mostrar o dia da semana escrito por extenso
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  // criar um array com 7 posições porém todos contendo valores undefined
  // keys => retorna o índice
  // retornamos um Date pois o format só aceita objetos do tipo Date
  return Array.from(Array(7).keys())
    .map((day) => formatter.format(new Date(Date.UTC(2021, 5, day))))
    .map((weekDay) => {
      if (short) {
        return weekDay.substring(0, 3).toUpperCase()
      }

      return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1))
    })
}
