import * as React from 'react'

import styled from 'styled-components'

import LinearProgress from '@material-ui/core/LinearProgress'

interface MatchResult {
  frame: string
  matchPixelCount: number
}

const loadImage = (uri: string): Promise<[HTMLImageElement, number, number]> =>
  new Promise(resolve => {
    const img = new Image()

    img.onload = () => {
      resolve([img, img.width, img.height])
    }

    img.src = uri
  })

export interface Props {
  frame: string
  video: File

  onDetect?(matchFrame: string): any
  onError?(error: Error): any
}

interface State {
  progress: number
}

export class NearFrameDetector extends React.Component<Props> {
  public state: State = {
    progress: 0
  }

  private baseFrameCanvas = React.createRef<HTMLCanvasElement>()
  private videoFrameCanvas = React.createRef<HTMLCanvasElement>()

  private video = React.createRef<HTMLVideoElement>()
  private videoURI = URL.createObjectURL(this.props.video)

  private matchResult: MatchResult = {
    frame: '',
    matchPixelCount: -1
  }

  public render() {
    return (
      <Container>
        <Message>
          近似フレームの抽出中です...(
          {this.state.progress}
          %)
        </Message>
        <ProgressBar variant="determinate" value={this.state.progress} />
        <video
          ref={this.video}
          style={{ display: 'none' }}
          autoPlay={false}
          muted={true}
          controls={false}
          src={this.videoURI}
          onLoadedData={this.startDetecting}
        />
        <canvas style={{ display: 'none' }} ref={this.baseFrameCanvas} />
        <canvas style={{ display: 'none' }} ref={this.videoFrameCanvas} />
      </Container>
    )
  }

  private startDetecting = async () => {
    const video = this.video.current!
    const baseCanvas = this.baseFrameCanvas.current!
    const videoCanvas = this.videoFrameCanvas.current!

    const { videoWidth, videoHeight, duration } = video

    const [img, width, height] = await loadImage(this.props.frame)

    if (videoWidth !== width || videoHeight !== height) {
      const err = new Error('動画のサイズが一致していません')

      if (this.props.onError) {
        this.props.onError(err)
        return
      } else {
        alert(err.message)
        throw err
      }
    }

    baseCanvas.width = videoCanvas.width = width
    baseCanvas.height = videoCanvas.height = height

    const baseCtx = baseCanvas.getContext('2d')!

    baseCtx.drawImage(img, 0, 0, width, height)

    const basePxs = baseCtx.getImageData(0, 0, width, height).data

    const videoCtx = videoCanvas.getContext('2d')!

    const diff = async () => {
      if (video.ended || video.currentTime >= video.duration) {
        if (this.props.onDetect) {
          this.props.onDetect(this.matchResult.frame)
        }

        return
      }

      const next = () => {
        video.currentTime += 1 / 60

        this.setState({
          progress: Math.floor((video.currentTime / duration) * 100)
        })

        diff()
      }

      await video.play()

      videoCtx.drawImage(video, 0, 0)
      video.pause()

      const currentFramePxs = videoCtx.getImageData(0, 0, width, height).data

      if (basePxs.length !== currentFramePxs.length) {
        console.warn('フレーム間でのピクセル数に相違があるためスキップします')

        next()
        return
      }

      // Diff pixels
      let matchPixelCount = 0

      for (let i = 0, l = basePxs.length; i < l; i += 4) {
        // Ignore alpha channel
        if (
          basePxs[i] === currentFramePxs[i] &&
          basePxs[i + 1] === currentFramePxs[i + 1] &&
          basePxs[i + 2] === currentFramePxs[i + 2]
        ) {
          matchPixelCount += 1
        }
      }

      if (matchPixelCount > this.matchResult.matchPixelCount) {
        this.matchResult = {
          frame: videoCanvas.toDataURL(),
          matchPixelCount
        }
      }

      next()
    }

    diff()
  }
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Message = styled.span`
  margin-bottom: 1em;
`

const ProgressBar = styled(LinearProgress)`
  width: 10em;
`
