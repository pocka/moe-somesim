import * as React from 'react'

import styled from 'styled-components'

import Dropzone from 'react-dropzone'
import { FaFileUpload } from 'react-icons/fa'

export interface Props {
  onPick?(video: File): any
}

export class VideoPicker extends React.PureComponent<Props> {
  private hiddenInput = React.createRef<any>()

  public render() {
    return (
      <Container
        ref={this.hiddenInput}
        type="file"
        accept="video/*"
        onDrop={this.pick}
      >
        <UploadIcon />
        <p>動画ファイルをドロップするか、クリックして選んでください</p>
      </Container>
    )
  }

  private pick = (acceptedFiles: File[]) => {
    const { onPick = () => void 0 } = this.props

    onPick(acceptedFiles[0])
  }
}

export default VideoPicker

const Container = styled(Dropzone)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: #222;
  background: #dedede;

  cursor: pointer;
`

const UploadIcon = styled(FaFileUpload)`
  display: block;
  font-size: 3em;
  margin-bottom: 10px;
`
