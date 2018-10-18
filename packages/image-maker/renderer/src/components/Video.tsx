import * as React from 'react'

import styled from 'styled-components'
import { rgba } from 'polished'

import PauseIcon from '@material-ui/icons/Pause'
import PlayIcon from '@material-ui/icons/PlayArrow'

export interface Props {
  className?: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  src?: string
  videoRef?: React.RefObject<HTMLVideoElement>
}

interface State {
  isPaused: boolean
  currentTime: number
  duration: number
}

export class Video extends React.Component<Props, State> {
  public state: State = {
    isPaused: !this.props.autoPlay,
    currentTime: 0,
    duration: 0
  }

  private video = this.props.videoRef || React.createRef<HTMLVideoElement>()

  public render() {
    const { className, children, autoPlay, muted, controls, src } = this.props
    const { isPaused, currentTime, duration } = this.state

    const PlayToggleIcon = isPaused ? PlayIcon : PauseIcon

    return (
      <Container className={className}>
        <StyledVideo
          ref={this.video as React.RefObject<any>}
          autoPlay={autoPlay}
          muted={muted}
          src={src}
          onTimeUpdate={this.updateTime}
          onLoadedData={this.setDuration}
        >
          {children}
        </StyledVideo>
        {controls ? (
          <Controls>
            <IconButton onClick={this.togglePlayState}>
              <PlayToggleIcon />
            </IconButton>
            <SeekArea>
              <SeekKnob
                style={{
                  left: `${(currentTime / duration) * 100}%`
                }}
              />
            </SeekArea>
          </Controls>
        ) : null}
      </Container>
    )
  }

  private updateTime = (ev: React.SyntheticEvent<HTMLVideoElement>) => {
    this.setState({ currentTime: ev.currentTarget.currentTime })
  }

  private setDuration = (ev: React.SyntheticEvent<HTMLVideoElement>) => {
    this.setState({ duration: ev.currentTarget.duration })
  }

  private togglePlayState = () => {
    if (!this.video.current) {
      return
    }

    const video = this.video.current

    const action = video.paused ? video.play() : Promise.resolve(video.pause())

    action.then(() => {
      this.setState(state => ({
        isPaused: !state.isPaused
      }))
    })
  }
}

export default Video

const Container = styled.div`
  position: relative;
  overflow: hidden;

  border-radius: 4px;
`

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;

  background: #222;
`

const Controls = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 0;
  right: 0;
  left: 0;
  height: 30px;
  padding: 10px 5px;

  color: #fff;
  background-color: ${rgba('#333', 0.85)};

  transition: opacity 0.2s ease;
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
`

const IconButton = styled.span`
  cursor: pointer;
`

const SeekArea = styled.div`
  position: relative;
  flex-grow: 1;
  height: 3px;
  overflow: visible;

  background: #ccc;
`

const SeekKnob = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 15px;
  height: 15px;
  margin-top: -6px;

  background: #fff;
  border-radius: 15px;

  transition: left 0.1s linear;
`
