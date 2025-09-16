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
  },
  {
    name: 'tictactoe',
    title: '틱택토',
    to: '/tictactoe'
  },
  {
    name: 'gomoku',
    title: '오목',
    to: '/gomoku'
  }
]

const leftSideBottomElements: leftSideElementProps[] = []

export { leftSideElements, leftSideBottomElements }
export type { leftSideElementProps }
