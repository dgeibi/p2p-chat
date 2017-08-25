import React, { Component } from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'
import compose from '../../utils/compose'

export default class ModalBtn extends Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    componentProps: PropTypes.object,
    handleCreate: PropTypes.func,
  }
  static defaultProps = {
    componentProps: {},
  }
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
      handleCreate,
      onClick,
      component,
      componentProps,
      ...btnProps
    } = this.props
    const { ref, onCancel, onCreate, visible, ...props } = componentProps

    return (
      <span>
        <Button onClick={compose(this.showModal, onClick)} {...btnProps} />
        <this.props.component
          {...props}
          visible={this.state.visible}
          ref={compose(this.saveFormRef, ref)}
          onCancel={compose(this.handleCancel, onCancel)}
          onCreate={compose(this.handleCreate, onCreate)}
        />
      </span>
    )
  }
}
