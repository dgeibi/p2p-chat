import { Form, Input, Icon, Button, Col, Modal } from 'antd'
import React from 'react'
import { ipcRenderer } from 'electron'
import { createModalBtn } from '../../utils/ModalBtn'
import { validAddress, validPort } from './validators'
import { showError } from '../../utils/message'

const InputGroup = Input.Group
const FormItem = Form.Item

let uuid = 0

export const createBtn = createModalBtn(<Icon type="plus" />, (form) => {
  form.validateFields((err, values) => {
    if (err) {
      showError('Connection Invalid')
      return
    }

    const connects = values.keys.map((i) => {
      const port = Math.floor(values[`port-${i}`])
      const host = values[`address-${i}`]
      return { port, host }
    })

    if (connects.length <= 0) {
      return
    }

    ipcRenderer.send('change-setting', { connects })
    console.log('Received values of form: ', connects)
  })
})

export const Connect = (props) => {
  const { visible, onCancel, onCreate, form } = props
  const { getFieldDecorator, getFieldValue } = form

  const remove = (k) => {
    const keys = form.getFieldValue('keys')
    if (keys.length === 1) {
      return
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    })
  }

  const add = () => {
    uuid += 1
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(uuid)
    form.setFieldsValue({
      keys: nextKeys,
    })
  }

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
  return (
    <Modal
      visible={visible}
      title="Connect Clients"
      okText="Connect"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={onCreate}
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

export default createBtn(Connect)
