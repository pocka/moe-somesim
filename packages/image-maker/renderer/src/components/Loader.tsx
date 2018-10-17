import * as React from 'react'

import styled, { keyframes } from 'styled-components'

import { FaSpinner } from 'react-icons/fa'

export interface Props {
  visible?: boolean
}

export class Loader extends React.PureComponent<Props> {
  private visibleStyle: React.CSSProperties = {
    opacity: 1
  }

  private invisibleStyle: React.CSSProperties = {
    opacity: 0
  }

  public render() {
    return (
      <Container
        style={this.props.visible ? this.visibleStyle : this.invisibleStyle}
      >
        <Spinner />
      </Container>
    )
  }
}

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: #555;
  color: #fff;

  transition: opacity 0.3s ease;
`

const spin = keyframes`
  from {
    transform: rotate(-45deg);
  }

  to {
    transform: rotate(315deg);
  }
`

const Spinner = styled(FaSpinner)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  font-size: 20px;

  animation: 1.5s ease 0s infinite ${spin};
`
