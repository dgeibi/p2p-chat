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
    return (
      <span>
        <Button onClick={this.showModal} >
          {this.props.children}
        </Button>
        <this.props.component
          ref={compose(this.saveFormRef, this.props.ref)}
          visible={this.state.visible}
          onCancel={compose(this.handleCancel, this.props.onCancel)}
          onCreate={compose(this.handleCreate, this.props.onCreate)}
        />
      </span>
    )
  }
}

export const createModalBtn = (children, handleCreate) => component => props =>
  <ModalBtn component={component} handleCreate={handleCreate} {...props}>
    {children}
  </ModalBtn>
