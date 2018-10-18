import * as React from 'react'

import styled from 'styled-components'

import { FramePicker } from '~renderer/components/FramePicker'
import { VideoPicker } from '~renderer/components/VideoPicker'

type Scene = {
  label: string
  render(): React.ReactNode
} & ThisType<App>

interface State {
  prev?: File
  next?: File
  prevFrame?: string
  sceneIndex: number
}

export class App extends React.Component<{}, State> {
  public state: State = {
    sceneIndex: 0
  }

  private scenes: Scene[] = [
    {
      label: '動画の選択(1回目)',
      render() {
        return (
          <VideoPicker onPick={this.pickPrev}>
            先に染色した動画ファイルをドロップするか、クリックして選んでください
          </VideoPicker>
        )
      }
    },
    {
      label: 'フレームの選択',
      render() {
        if (!this.state.prev) {
          this.goto(0)
          return <div />
        }

        return <FramePicker video={this.state.prev} onPick={this.pickFrame} />
      }
    },
    {
      label: '動画の選択(2回目)',
      render() {
        return (
          <VideoPicker onPick={this.pickNext}>
            後に染色した動画ファイルをドロップするか、クリックして選んでください
          </VideoPicker>
        )
      }
    }
  ]

  public render() {
    const scene = this.scenes[this.state.sceneIndex]

    return <Container>{scene.render.apply(this)}</Container>
  }

  private goto = (sceneIndex: number) => {
    this.setState({ sceneIndex })
  }

  private gotoNext = () => {
    this.setState(state => ({
      sceneIndex: Math.min(state.sceneIndex + 1, this.scenes.length - 1)
    }))
  }

  private pickPrev = (file: File) => {
    this.setState({ prev: file })

    this.gotoNext()
  }

  private pickNext = (file: File) => {
    this.setState({ next: file })

    this.gotoNext()
  }

  private pickFrame = (frame: string) => {
    this.setState({ prevFrame: frame })

    this.gotoNext()
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
