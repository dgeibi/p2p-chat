import React, { Component } from 'react'
import { Button } from 'antd'
import compose from '../../utils/compose'

export default class ModalBtn extends Component {
  state = {
    visible: false,
  }
  showModal = () => {
    this.setState({ visible: true })
  }
  handleCancel = () => {
    this.setState({ visible: false })
  }
  handleCreate = () => {
    const form = this.form
    if (this.props.handleCreate) {
      this.props.handleCreate(form)
    }
    form.resetFields()
    this.setState({ visible: false })
  }
  saveFormRef = (form) => {
    this.form = form
  }
  render() {
    const { ref, handleCreate, component, onCancel, onCreate, onClick, ...rest } = this.props
    return (
      <span style={{
        marginRight: 8,
        marginBottom: 12,
      }}>
        <Button onClick={compose(this.showModal, onClick)} {...rest} />
        <this.props.component
          ref={compose(this.saveFormRef, ref)}
          visible={this.state.visible}
          onCancel={compose(this.handleCancel, onCancel)}
          onCreate={compose(this.handleCreate, onCreate)}
        />
      </span>
    )
  }
}

export const createModalBtn = (children, handleCreate) => component => props =>
  <ModalBtn component={component} handleCreate={handleCreate} {...props}>
    {children}
  </ModalBtn>
