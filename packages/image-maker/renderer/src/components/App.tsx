import * as React from 'react'

import styled from 'styled-components'

import { FramePicker } from '~renderer/components/FramePicker'
import { VideoPicker } from '~renderer/components/VideoPicker'

interface State {
  prev?: File
  next?: File
  prevFrame?: string
}

export class App extends React.Component<{}, State> {
  public state: State = {}

  public render() {
    const content = !this.state.prev ? (
      <VideoPicker onPick={this.pickPrev}>
        先に染色した動画ファイルをドロップするか、クリックして選んでください
      </VideoPicker>
    ) : !this.state.next ? (
      <VideoPicker onPick={this.pickNext}>
        後に染色した動画ファイルをドロップするか、クリックして選んでください
      </VideoPicker>
    ) : !this.state.prevFrame ? (
      <FramePicker video={this.state.prev} onPick={this.pickFrame} />
    ) : (
      <img src={this.state.prevFrame} />
    )

    return <Container>{content}</Container>
  }

  private pickPrev = (file: File) => {
    this.setState({ prev: file })
  }

  private pickNext = (file: File) => {
    this.setState({ next: file })
  }

  private pickFrame = (frame: string) => {
    this.setState({ prevFrame: frame })
  }
}

export default App

const Container = styled.div`
  position: absolute;
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background: #fefefe;

  & > * {
    flex-grow: 1;
    max-width: 100%;
  }
`
