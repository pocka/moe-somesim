import * as React from 'react'

import styled from 'styled-components'

import NoteAddIcon from '@material-ui/icons/NoteAdd'

import Dropzone from 'react-dropzone'

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
        <p>
          {this.props.children ||
            '動画ファイルをドロップするか、クリックして選んでください'}
        </p>
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

  cursor: pointer;
`

const UploadIcon = styled(NoteAddIcon)`
  &&& {
    font-size: 3em;
    margin-bottom: 10px;
  }
`
