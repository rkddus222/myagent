import { leftSideElementProps } from '../types'

const leftSideElements: leftSideElementProps[] = [
  {
    name: 'json',
    title: 'JSON 변환',
    to: '/json'
  },
  {
    name: 'help',
    title: 'LLM 테스트',
    to: '/help'
  },
  {
    name: 'nl2sql',
    title: 'NL2SQL 샷',
    to: '/nl2sql'
  },
  {
    name: 'respondent',
    title: 'Respondent 샷',
    to: '/respondent'
  },
  {
    name: 'dataframe-converter',
    title: '데이터프레임 변환',
    to: '/dataframe-converter'
  }
]

const leftSideBottomElements: leftSideElementProps[] = []

export { leftSideElements, leftSideBottomElements }
export type { leftSideElementProps }
