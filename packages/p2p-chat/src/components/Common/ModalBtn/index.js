import React, { Component } from 'react'
import { Button } from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import compose from '../../../utils/compose'
import rm from '../../../utils/propertyRm'
import * as actions from './redux'

function selectVisible(state, ownProp) {
  if (state[ownProp.id] === undefined) return !!ownProp.visibleDefault
  return !!state[ownProp.id]
}

@connect(
  (state, ownProp) => ({
    visible: selectVisible(state.modalbtns, ownProp),
  }),
  (dispatch, ownProp) => ({
    show: () => dispatch(actions.show(ownProp.id)),
    hide: () => dispatch(actions.hide(ownProp.id)),
  })
)
export default class ModalBtn extends Component {
  static propTypes = {
    component: PropTypes.func.isRequired,
    componentProps: PropTypes.object,
    handleCreate: PropTypes.func,
    show: PropTypes.func.isRequired,
    hide: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    visibleDefault: PropTypes.bool,
  }
  static defaultProps = {
    componentProps: {},
  }
  showModal = () => {
    this.props.show()
  }
  handleCancel = () => {
    this.props.hide()
  }

  handleCreate = () => {
    if (this.props.handleCreate) {
      this.props.handleCreate(this.form, (err) => {
        if (!err) {
          this.reset()
        }
      })
    } else {
      this.reset()
    }
  }

  saveFormRef = (form) => {
    this.form = form
  }

  reset() {
    this.form.resetFields()
    this.props.hide()
  }

  render() {
    const { onClick, componentProps } = this.props

    const btnProps = rm(
      this.props,
      'hide',
      'show',
      'id',
      'visible',
      'componentProps',
      'component',
      'onClick',
      'handleCreate',
      'visibleDefault'
    )
    const { ref, onCancel, onCreate, ...props } = componentProps

    return (
      <span>
        <Button onClick={compose(this.showModal, onClick)} {...btnProps} />
        <this.props.component
          {...props}
          visible={this.props.visible}
          ref={compose(this.saveFormRef, ref)}
          onCancel={compose(this.handleCancel, onCancel)}
          onCreate={compose(this.handleCreate, onCreate)}
        />
      </span>
    )
  }
}
