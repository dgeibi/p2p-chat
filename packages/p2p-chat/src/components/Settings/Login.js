import React, { Component } from 'react'
import { Input, Form } from 'antd'
import { ipcRenderer } from 'electron'
import { validPort, validName } from './validators'
import ModalBtn from '../Common/ModalBtn'
import Modal from '../Common/Modal'

function FormItem(props) {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }
  return <Form.Item {...formItemLayout} {...props} />
}

const validator = (form, callback) => {
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
export class Login extends Component {
  render() {
    const { getFieldDecorator } = this.props.form
    const { visible, onCancel, onCreate } = this.props

    return (
      <Modal
        visible={visible}
        title="Settings/Login"
        okText="OK"
        cancelText="Cancel"
        onCancel={onCancel}
        onOk={onCreate}
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

export default props =>
  <ModalBtn
    component={Login}
    handleCreate={validator}
    type="primary"
    icon="setting"
    ghost
    {...props}
  />
