import { leftSideElementProps } from '../types'

const leftSideElements: leftSideElementProps[] = [
  {
    name: 'work-helper',
    title: '업무 도우미',
    children: [
      {
        name: 'json',
        title: 'JSON 변환',
        to: '/json'
      },
      {
        name: 'dataframe-converter',
        title: '데이터프레임 변환',
        to: '/dataframe-converter'
      }
    ]
  },
  {
    name: 'llm-helper',
    title: 'LLM 도우미',
    children: [
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
      }
    ]
  },
  {
    name: 'game',
    title: '게임',
    children: [
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
  },
  {
    name: 'news',
    title: '뉴스',
    children: [
      {
        name: 'ai-news',
        title: 'AI 뉴스',
        to: '/ai-news'
      }
    ]
  }
]

const leftSideBottomElements: leftSideElementProps[] = []

export { leftSideElements, leftSideBottomElements }
export type { leftSideElementProps }
