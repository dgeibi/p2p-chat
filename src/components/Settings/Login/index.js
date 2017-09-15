import React, { Component } from 'react'
import { Input, Form } from 'antd'
import { ipcRenderer } from 'electron'
import PropTypes from 'prop-types'

import { validPort, validName } from '../validators'
import Modal from '../../Common/Modal'

function FormItem(props) {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }
  return <Form.Item {...formItemLayout} {...props} />
}

const validForm = (form, callback) => {
  form.validateFields((err, options) => {
    if (err) {
      callback(err)
      return
    }
    ipcRenderer.send('setup', options)
    callback()
  })
}

@Form.create()
export default class Login extends Component {
  static propTypes = {
    hide: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    port: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
  }

  handleCancel = () => {
    this.props.hide()
  }

  handleCreate = () => {
    const { form } = this.props
    validForm(form, (err) => {
      if (!err) {
        this.props.form.resetFields()
        this.props.hide()
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { visible } = this.props

    return (
      <Modal
        visible={visible}
        title="Login"
        okText="Login"
        cancelText="Cancel"
        onCancel={this.handleCancel}
        onOk={this.handleCreate}
      >
        <Form>
          <FormItem label="Username">
            {getFieldDecorator('username', {
              initialValue: this.props.username,
              rules: [
                {
                  required: true,
                  message: 'Please input your username!',
                },
                {
                  validator: validName,
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="Port">
            {getFieldDecorator('port', {
              initialValue: this.props.port,
              rules: [
                {
                  required: true,
                },
                {
                  validator: validPort,
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
