import * as React from 'react'

import styled from 'styled-components'

import CircularProgress from '@material-ui/core/CircularProgress'

export interface Props {
  visible?: boolean
}

export class Loader extends React.PureComponent<Props> {
  private visibleStyle: React.CSSProperties = {
    opacity: 1
  }

  private invisibleStyle: React.CSSProperties = {
    pointerEvents: 'none',
    opacity: 0
  }

  public render() {
    return (
      <Container
        style={this.props.visible ? this.visibleStyle : this.invisibleStyle}
      >
        <CircularProgress />
      </Container>
    )
  }
}

const Container = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: rgba(255, 255, 255, 0.8);

  transition: opacity 0.3s ease;
`
