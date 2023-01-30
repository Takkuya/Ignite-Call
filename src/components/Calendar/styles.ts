import { styled, Text } from '@ignite-ui/react'

export const CalendarContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$6',
  padding: '$6',
})
export const CalendarHeader = styled('div', {
  display: 'flex',
  alignItems: ' center',
  justifyContent: 'space-between',
})
export const CalendarTitle = styled(Text, {
  fontWeight: '$medium',
  textTransform: 'capitalize',

  span: {
    color: '$gray200',
  },
})
export const CalendarActions = styled('div', {
  display: 'flex',
  gap: '$2',
  color: 'gray200',

  button: {
    // pega todas as propriedades do css e zera elas, resetando os estilos basicamente
    all: 'unset',
    cursor: 'pointer',
    lineHeight: 0,
    borderRadius: '$sm',

    svg: {
      width: '$5',
      height: '$5',
    },

    '&:hover': {
      color: '$gray100',
    },

    '&:focus': {
      // temos que especificar as cores dessa forma para o stitches entender que é um token de cor
      boxShadow: '0 0 0 2px $colors$gray100',
    },
  },
})
export const CalendarBody = styled('table', {
  width: '100%',
  fontFamily: '$default',
  borderSpacing: '0.25rem',
  // algoritmo utilizado para calcular o tamanho das colunas
  // fixed => todas as células da table tem o mesmo tamanho
  tableLayout: 'fixed',

  'thead th': {
    color: '$gray200',
    fontWeight: '$md',
    fontSize: '$sm',
  },

  // utilizamos esse hackzinho para dar espaçamento entre os elementos em uma tabela
  // já que em uma table não podemos utilizar margin ou padding
  'tbody:before': {
    content: '',
    paddingBottom: '0.75rem',
    display: 'block',
    color: '$gray800',
  },

  'tbody td': {
    boxSizing: 'border-box',
  },
})
export const CalendarDay = styled('button', {
  all: 'unset',
  // usamos isso para termos a mesma largura e altura
  // isso com width 100% e aspectRatio,
  // basicamente estamos obrigando esse botão a ter exatamente a mesma altura e largura
  width: '100%',
  aspectRatio: '1/1',

  background: '$gray600',
  textAlign: 'center',

  cursor: 'pointer',
  borderRadius: '$sm',

  '&:disabled': {
    background: 'none',
    cursor: 'default',
    opacity: 0.4,
  },

  '$:not(:disabled):hover': {
    background: '$gray500',
  },

  '&:focus': {
    boxShadow: '0 0 0 2px $colors$gray100',
  },
})
