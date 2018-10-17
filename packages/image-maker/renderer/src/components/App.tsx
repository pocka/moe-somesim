import * as React from 'react'

import styled from 'styled-components'

import { VideoCropper } from '~renderer/components/VideoCropper'
import { VideoPicker } from '~renderer/components/VideoPicker'

interface State {
  prev?: File
}

export class App extends React.Component<{}, State> {
  public state: State = {}

  public render() {
    const content = !this.state.prev ? (
      <VideoPicker onPick={this.pickPrev} />
    ) : (
      <VideoCropper video={this.state.prev} />
    )

    return <Container>{content}</Container>
  }

  private pickPrev = (file: File) => {
    this.setState({
      prev: file
    })
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
  }
`
