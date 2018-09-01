import React from 'react'
import dateFormat from 'dateformat'
import PropTypes from 'prop-types'

import { formatTag } from '../../../utils/format'

import styles from './Text.scss'

const Text = ({ username, text, myName, self, date, tag }) => (
  <div className={styles.text}>
    <header className={styles.text__header}>
      {self ? myName : username + formatTag(tag)}
    </header>
    <main className={styles.text__main}>{text}</main>
    <footer className={styles.text__footer}>
      {dateFormat(date, 'yyyy-mm-dd HH:MM')}
    </footer>
  </div>
)

Text.propTypes = {
  text: PropTypes.string.isRequired,
  date: PropTypes.number.isRequired,
  username: PropTypes.string,
  self: PropTypes.bool,
  myName: PropTypes.string,
  tag: PropTypes.string,
}

export default Text
