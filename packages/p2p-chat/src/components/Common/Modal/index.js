import { Modal as AntdModal } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'

import './index.scss'

// babel-plugin-react-css-modules: HOC need define className explicitly
const Modal = ({ className, ...props }) => (
  <AntdModal styleName="modal" className={className} {...props} />
)

Modal.propTypes = {
  className: PropTypes.string,
}

export default Modal
