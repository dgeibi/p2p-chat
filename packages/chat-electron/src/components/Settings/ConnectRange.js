import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import { Input, Form, Modal, Icon } from 'antd'
import { validAddress, validPort } from './validators'
import ModalBtn from '../Common/ModalBtn'
import { showError } from '../../utils/message'

const FormItem = Form.Item

const handleCreate = (form) => {
  form.validateFields((err, values) => {
    if (err) {
      showError('Connection Invalid')
      return
    }
    ipcRenderer.send('change-setting', values)
    console.log('Received values of form: ', values)
  })
}

@Form.create()
export class ConnectRange extends Component {
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
              validateTrigger: ['onChange'],
              rules: [
                {
                  validator: validAddress,
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="Biggest address">
            {getFieldDecorator('hostEnd', {
              validateTrigger: ['onChange'],
              rules: [
                {
                  validator: validAddress,
                },
              ],
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="Least port">
            {getFieldDecorator('portStart', {
              validateTrigger: ['onChange'],
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

export const ConnectRangeBtn = props =>
  <ModalBtn component={ConnectRange} handleCreate={handleCreate} {...props}>
    <Icon type="plus" />
  </ModalBtn>
