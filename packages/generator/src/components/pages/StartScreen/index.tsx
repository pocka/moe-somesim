import * as React from 'react'

interface Props {
  onStart?(): void
}

export const StartScreen: React.FC<Props> = ({ children, onStart }) => {
  return <span>Henlo, frens</span>
}

export default StartScreen
