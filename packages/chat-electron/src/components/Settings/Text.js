import { h } from 'preact'

export default props =>
  <input
    type='text'
    css={`
    &:hover {
      color: green;
    }
  `}
  />
