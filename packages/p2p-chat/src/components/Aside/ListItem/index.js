import React from 'react'
import PropTypes from 'prop-types'

import styles from './ListItem.scss'

const ListItem = ({ title, badge, online }) => (
  <section className={`${!online ? styles['title-offline'] : ''} ${styles.title}`}>
    {title} {badge > 0 && <span className={styles.latest__badge}>{badge}</span>}
  </section>
)

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  badge: PropTypes.number.isRequired,
  online: PropTypes.bool,
}

export default ListItem
