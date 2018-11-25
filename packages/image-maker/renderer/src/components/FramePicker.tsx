import * as React from 'react'

import styled from 'styled-components'

import Button from '@material-ui/core/Button'
import DoneIcon from '@material-ui/icons/Done'

export interface Props {
  video: File
  onPick?(base64Image: string): any
}

export class FramePicker extends React.Component<Props> {
  private video = React.createRef<HTMLVideoElement>()
  private videoURI = URL.createObjectURL(this.props.video)

  public render() {
    return (
      <Container>
        <PickButton variant="fab" color="primary" onClick={this.pickFrame}>
          <DoneIcon />
        </PickButton>
        <StyledVideo
          ref={this.video as React.Ref<any>}
          autoPlay={false}
          muted={true}
          controls={true}
          src={this.videoURI}
        />
      </Container>
    )
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

const StyledVideo = styled.video`
  position: relative;
  width: 90%;
  height: 90%;
  max-width: 1080px;
  max-height: 800px;

  border-radius: 4px;
  background: #222;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
`

const PickButton = styled(Button)`
  &&& {
    position: absolute;
    right: 15px;
    bottom: 15px;
    z-index: 10;
  }
`
