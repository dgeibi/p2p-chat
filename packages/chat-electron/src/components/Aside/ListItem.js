import React from 'react'
import './ListItem.scss'

export default ({ title, badge, online }) => {
  const latest =
    badge > 0
      ? <span styleName="latest__badge">
        {badge}
      </span>
      : null
  return (
    <section styleName={`${!online ? 'title-offline ' : ''}title`}>
      {title}  {latest}
    </section>
  )
}
