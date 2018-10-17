import * as React from 'react'

import styled from 'styled-components'

import { Loader } from '~renderer/components/Loader'

export interface Props {
  video: File
}

interface State {
  loading: boolean
}

export class VideoCropper extends React.Component<Props, State> {
  public state: State = {
    loading: true
  }

  private videoURI = URL.createObjectURL(this.props.video)

  public render() {
    return (
      <Container>
        <Loader visible={this.state.loading} />
        <Video
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
}

export default VideoCropper

const Container = styled.div`
  position: relative;

  background: #333;
`

const Video = styled.video`
  position: absolute;
  top: 2em;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 90%;
  z-index: 10;
`
