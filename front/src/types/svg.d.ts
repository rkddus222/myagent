declare module '*.svg?react' {
  import React from 'react'
  const content: React.FC<React.SVGProps<SVGElement>>
  export default content
}
