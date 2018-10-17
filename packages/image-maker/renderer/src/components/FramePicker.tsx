import * as React from 'react'

import styled from 'styled-components'

import { Loader } from '~renderer/components/Loader'

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

  private video = React.createRef<any>()
  private videoURI = URL.createObjectURL(this.props.video)

  public render() {
    return (
      <Container>
        <Loader visible={this.state.loading} />
        <PickButton onClick={this.pickFrame}>このフレームを切り出す</PickButton>
        <Video
          ref={this.video}
          autoPlay={false}
          muted={true}
          controls={true}
          src={this.videoURI}
          onLoadedData={this.endLoading}
        />
      </Container>
    )
  }

  private endLoading = () => {
    this.setState({ loading: false })
  }

  private pickFrame = () => {
    const video = this.video.current as HTMLVideoElement
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
  flex-direction: column;

  background: #333;
`

const Video = styled.video`
  width: 90%;
`

const PickButton = styled.button`
  margin: 10px 0;
  padding: 5px 1.5em;
`
