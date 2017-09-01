import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import { Input, Form, Button } from 'antd'
import { validAddress, validPort } from './validators'
import ModalBtn from '../Common/ModalBtn'
import Modal from '../Common/Modal'

const FormItem = Form.Item

const validForm = (form, callback) => {
  form.validateFields((err, values) => {
    if (err) {
      callback(err)
      return
    }
    ipcRenderer.send('change-setting', values)
    callback()
  })
}

@Form.create()
export class ConnectRange extends Component {
  handleCancel = () => {
    this.props.hide()
  }

  handleCreate = () => {
    const { form, hide } = this.props
    validForm(form, (err) => {
      if (!err) {
        form.resetFields()
        hide()
      }
    })
  }

  render() {
    const { visible } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Modal
        visible={visible}
        title="Connect Clients from Range"
        okText="Connect"
        cancelText="Cancel"
        onCancel={this.handleCancel}
        onOk={this.handleCreate}
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

export const ConnectRangeBtn = (props) => {
  const { visibleDefault, componentProps } = props
  return (
    <ModalBtn id="connect-range" visibleDefault={visibleDefault}>
      {(getProps) => {
        const { show, hide, visible } = getProps()
        return (
          <span>
            <Button onClick={show} icon="plus" />
            <ConnectRange hide={hide} visible={visible} {...componentProps} />
          </span>
        )
      }}
    </ModalBtn>
  )
}
