import React from 'react'
import './ListItem.scss'

export default ({ title, badge, online }) => (
  <section styleName={`${!online ? 'title-offline ' : ''}title`}>
    {title} {badge > 0 && <span styleName="latest__badge">{badge}</span>}
  </section>
)
