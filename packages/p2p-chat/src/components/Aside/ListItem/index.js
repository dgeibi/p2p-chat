import React from 'react'
import PropTypes from 'prop-types'

import './ListItem.scss'

const ListItem = ({ title, badge, online }) => (
  <section styleName={`${!online ? 'title-offline ' : ''}title`}>
    {title} {badge > 0 && <span styleName="latest__badge">{badge}</span>}
  </section>
)

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  badge: PropTypes.number.isRequired,
  online: PropTypes.bool,
}

export default ListItem
