import { Modal as AntdModal } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'
import styles from './index.scss'

const Modal = ({ className, ...props }) => (
  <AntdModal className={`${styles.modal} ${className || ''}`} {...props} />
)

Modal.propTypes = {
  className: PropTypes.string,
}

export default Modal
