import * as React from 'react'

import styled from 'styled-components'

import Button from '@material-ui/core/Button'
import DoneIcon from '@material-ui/icons/Done'

import { Loader } from '~renderer/components/Loader'
import { Video } from '~renderer/components/Video'

export interface Props {
  video: File
  onPick?(base64Image: string): any
}

interface State {
  loading: boolean
}

export class FramePicker extends React.Component<Props, State> {
  public state: State = {
    loading: true
  }

  private video = React.createRef<HTMLVideoElement>()
  private videoURI = URL.createObjectURL(this.props.video)

  public render() {
    return (
      <Container>
        <Loader visible={this.state.loading} />
        <PickButton variant="fab" color="primary" onClick={this.pickFrame}>
          <DoneIcon />
        </PickButton>
        <StyledVideo
          videoRef={this.video}
          autoPlay={false}
          muted={true}
          controls={true}
          src={this.videoURI}
        />
      </Container>
    )
  }

  private endLoading = () => {
    this.setState({ loading: false })
  }

  private pickFrame = () => {
    const video = this.video.current
    const { onPick } = this.props

    if (!video || !onPick) {
      return
    }

    const canvas = document.createElement('canvas')

    const [width, height] = [video.videoWidth, video.videoHeight]

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.drawImage(video, 0, 0, width, height)

    onPick(canvas.toDataURL())
  }
}

export default FramePicker

const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`

const StyledVideo = styled(Video)`
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1080px;
  max-height: 800px;
`

const PickButton = styled(Button)`
  &&& {
    position: absolute;
    right: 15px;
    bottom: 15px;
    z-index: 10;
  }
`
