import React, { Component } from 'react'
import { Input, Form, Modal, Icon, message } from 'antd'
import { validAddress, validPort } from './validators'
import { createModalBtn } from './ModalBtn'

const FormItem = Form.Item

@createModalBtn(<Icon type="plus" />, (form) => {
  form.validateFields((err, values) => {
    if (err) {
      message.error('Connection Invalid')
      return
    }
    console.log('Received values of form: ', values)
  })
})
@Form.create()
class ConnectRange extends Component {
  render() {
    const { visible, onCancel, onCreate } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Modal
        visible={visible}
        title="Connect Clients Range"
        okText="Connect"
        cancelText="Cancel"
        onCancel={onCancel}
        onOk={onCreate}
      >
        <Form>
          <FormItem label="Least address">
            {getFieldDecorator('hostStart', {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  validator: validAddress,
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="Biggest address">
            {getFieldDecorator('hostEnd', {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  validator: validAddress,
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="Least port">
            {getFieldDecorator('portStart', {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  validator: validPort,
                },
                {
                  required: true,
                  message: 'please input least port!',
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="Biggest port">
            {getFieldDecorator('portEnd', {
              validateTrigger: ['onChange', 'onBlur'],
              rules: [
                {
                  validator: validPort,
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default ConnectRange
