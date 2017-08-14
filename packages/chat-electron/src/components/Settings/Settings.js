import React, { Component } from 'react'
import { Input, Form, Modal, Icon, message } from 'antd'
import { createModalBtn } from './ModalBtn'
import { validPort } from './validators'

function FormItem(props) {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }
  return <Form.Item {...formItemLayout} {...props} />
}

@createModalBtn(<Icon type="setting" />, (form) => {
  form.validateFields((err, values) => {
    if (err) {
      message.error('Settings Invalid')
      return
    }
    console.log('Received values of form: ', values)
  })
})
@Form.create()
class Settings extends Component {
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
              initialValue: 'anonymous',
              rules: [
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="Port">
            {getFieldDecorator('port', {
              initialValue: '8087',
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

export default Settings
