import React, { Component } from 'react'
import { Button, Form } from 'antd'
import compose from './compose'

export default class ModalBtn extends Component {
  state = {
    visible: this.props.visibleDefault || false,
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
    const {
      visibleDefault,
      ref,
      handleCreate,
      component,
      onCancel,
      onCreate,
      onClick,
      ...rest
    } = this.props
    return (
      <span
        style={{
          marginRight: 8,
          marginBottom: 12,
        }}
      >
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

export const createModalBtn = (children, handleCreate, enhanceComponent) => component => props =>
  <ModalBtn
    component={Form.create()(enhanceComponent ? enhanceComponent(component) : component)}
    handleCreate={handleCreate}
    {...props}
  >
    {children}
  </ModalBtn>
