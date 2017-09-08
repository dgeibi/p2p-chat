import { Modal as AntdModal } from 'antd'
import React from 'react'
import './index.scss'

// babel-plugin-react-css-modules: HOC need define className explicitly
const Modal = ({ styleName, className, ...props }) => (
  <AntdModal styleName="modal" className={className} {...props} />
)

export default Modal
