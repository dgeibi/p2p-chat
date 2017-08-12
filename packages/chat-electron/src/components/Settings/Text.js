import React, { Component } from 'react'

export default props =>
  <input
    type="text"
    css={`
    &:hover {
      color: green;
    }
  `}
  />
