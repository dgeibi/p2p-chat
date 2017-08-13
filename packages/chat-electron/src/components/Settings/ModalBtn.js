import React, { Component } from 'react'
import { Button } from 'antd'

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
    if (this.props.component.handleCreate) {
      this.props.component.handleCreate(form)
    }
    form.resetFields()
    this.setState({ visible: false })
  }
  saveFormRef = (form) => {
    this.form = form
  }
  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          {this.props.children}
        </Button>
        <this.props.component
          ref={compose(this.saveFormRef, this.props.ref)}
          visible={this.state.visible}
          onCancel={compose(this.handleCancel, this.props.onCancel)}
          onCreate={compose(this.handleCreate, this.props.onCreate)}
        />
      </div>
    )
  }
}

function compose(...fns) {
  return (...args) =>
    fns.forEach((x) => {
      if (x) {
        x(...args)
      }
    })
}
