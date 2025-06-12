import { CustomIconsName } from '../components/common/Icons'

interface leftSideElementProps {
  name: CustomIconsName | string
  to?: string
  title: string
  children?: {
    name?: CustomIconsName
    to: string
    title: string
  }[]
}

export type { leftSideElementProps }
