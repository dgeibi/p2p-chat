import { Form, Input, Icon, Button, Col } from 'antd'
import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import Modal from '../Common/Modal'
import { validAddress, validPort } from './validators'

const InputGroup = Input.Group
const FormItem = Form.Item

let uuid = 0

const validForm = (form, callback) => {
  form.validateFields((err, values) => {
    if (err) {
      callback(err)
      return
    }

    const connects = values.keys.map((i) => {
      const port = Math.floor(values[`port-${i}`])
      const host = values[`address-${i}`]
      return { port, host }
    })

    if (connects.length > 0) {
      ipcRenderer.send('change-setting', { connects })
    }

    callback()
  })
}

@Form.create()
export default class Connect extends Component {
  remove = (k) => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    if (keys.length === 1) return
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  add = () => {
    const { form } = this.props

    uuid += 1
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(uuid)
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

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
    const { form } = this.props
    const { getFieldDecorator, getFieldValue } = form

    const { remove, add } = this
    getFieldDecorator('keys', { initialValue: [] })
    const keys = getFieldValue('keys')
    const minusCircle = k => ({
      addonAfter:
        keys.length > 1
          ? <Icon type="minus-circle-o" disabled={keys.length === 1} onClick={() => remove(k)} />
          : null,
    })
    const formItems = keys.map(k =>
      <InputGroup key={k}>
        <Col span={12}>
          <FormItem required={false}>
            {getFieldDecorator(`address-${k}`, {
              validateTrigger: ['onChange'],
              rules: [
                {
                  validator: validAddress,
                },
              ],
            })(<Input placeholder="Address" />)}
          </FormItem>
        </Col>

        <Col span={8}>
          <FormItem required={false}>
            {getFieldDecorator(`port-${k}`, {
              validateTrigger: ['onChange'],
              rules: [
                {
                  validator: validPort,
                },
                {
                  required: true,
                  message: 'Please input port or remove the entry',
                },
              ],
            })(<Input placeholder="Port" {...minusCircle(k)} />)}
          </FormItem>
        </Col>
      </InputGroup>
    )

    const { visible } = this.props
    const { handleCancel, handleCreate } = this
    return (
      <Modal
        visible={visible}
        title="Connect Clients"
        okText="Connect"
        cancelText="Cancel"
        onCancel={handleCancel}
        onOk={handleCreate}
      >
        <Form>
          {formItems}
          <FormItem>
            <Button type="dashed" onClick={add}>
              <Icon type="plus" /> Add
            </Button>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
