import * as React from 'react'

import styled from 'styled-components'

import AppBar from '@material-ui/core/AppBar'
import Step from '@material-ui/core/Step'
import Stepper from '@material-ui/core/Stepper'
import StepLabel from '@material-ui/core/StepLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import { FramePicker } from '~renderer/components/FramePicker'
import { NearFrameDetector } from '~renderer/components/NearFrameDetector'
import { VideoPicker } from '~renderer/components/VideoPicker'

type Scene = {
  label: string
  render(): React.ReactNode
} & ThisType<App>

interface State {
  prev?: File
  next?: File
  prevFrame?: string
  nextFrame?: string
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
    },
    {
      label: '近似フレームの抽出',
      render() {
        return (
          <NearFrameDetector
            frame={this.state.prevFrame!}
            video={this.state.next!}
            onDetect={this.onDetectFrame}
          />
        )
      }
    },
    {
      label: '結果',
      render() {
        return (
          <div>
            <img style={{ height: '40%' }} src={this.state.prevFrame} />
            <img style={{ height: '40%' }} src={this.state.nextFrame} />
          </div>
        )
      }
    }
  ]

  public render() {
    const scene = this.scenes[this.state.sceneIndex]

    return (
      <Container>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              {scene.label}
            </Typography>
          </Toolbar>
        </AppBar>
        <Stepper activeStep={this.state.sceneIndex} alternativeLabel={true}>
          {this.scenes.map((scene, i) => {
            const completed = i < this.state.sceneIndex

            return (
              <Step key={i} completed={completed}>
                <StepLabel>{scene.label}</StepLabel>
              </Step>
            )
          })}
        </Stepper>
        <Content>{scene.render.apply(this)}</Content>
      </Container>
    )
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

  private onDetectFrame = (frame: string) => {
    this.setState({ nextFrame: frame })

    this.gotoNext()
  }
}

export default App

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background: #fefefe;

  & > :not(:last-child) {
    flex-shrink: 0;
  }
`

const Content = styled.div`
  display: flex;
  flex-grow: 1;

  & > * {
    flex-grow: 1;
    max-width: 100%;
  }
`
