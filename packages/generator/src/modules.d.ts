declare module '*.svg?component' {
  import { ComponentType, CSSProperties } from 'react'

  const Component: ComponentType<JSX.IntrinsicElements['svg']>

  export default Component
}

declare module '*.css?module' {
  const classNames: {
    [className: string]: string
  }
  export default classNames
}

declare module '*.css?inline'

declare module '*.jpg' {
  const path: string
  export default path
}

declare module '*.png' {
  const path: string
  export default path
}

declare module '*.svg' {
  const path: string
  export default path
}

declare module '*.webp' {
  const path: string
  export default path
}
