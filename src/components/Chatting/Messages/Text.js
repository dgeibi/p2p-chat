import React from 'react'
import dateFormat from 'dateformat'
import './Text.scss'

const Text = ({
  username, text, myName, self, date,
}) => (
  <div styleName="text">
    <header styleName="text__header">{self ? myName : username}</header>
    <main styleName="text__main">{text}</main>
    <footer styleName="text__footer">{dateFormat(date, 'HH:MM')}</footer>
  </div>
)

export default Text
