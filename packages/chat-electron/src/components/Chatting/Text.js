import React from 'react'
import dateFormat from 'dateformat'
import './Text.scss'

const Text = ({ username, text, myName }) =>
  <div styleName="text">
    <header styleName="text__header">
      {username || myName}
    </header>
    <pre styleName="text__main">
      {text}
    </pre>
    <footer styleName="text__footer">
      {dateFormat(new Date(), 'HH:MM')}
    </footer>
  </div>

export default Text
