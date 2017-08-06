import { h, Component } from 'preact'

import styled from 'emotion/react'

const Section = styled.section`
  &:hover {
    background: #11e;
  }

  & > input:checked {
  }

  & > input {
  }

  & > input:checked + label {
  }
`
class User extends Component {
  render() {
    return <Section />
  }
}
