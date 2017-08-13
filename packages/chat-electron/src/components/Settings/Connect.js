import { Form, Input, Icon, Button, Col, Modal } from 'antd'
import React from 'react'
import ipRegex from 'ip-regex'
import ModalBtn from './ModalBtn'

const InputGroup = Input.Group
const FormItem = Form.Item

const CollectForm = Form.create()((props) => {
  const { visible, onCancel, onCreate, form } = props
  const { getFieldDecorator, getFieldValue } = form

  const remove = (k) => {
    const keys = form.getFieldValue(CollectForm.formName)
    if (keys.length === 1) {
      return
    }
    form.setFieldsValue({
      [CollectForm.formName]: keys.filter(key => key !== k),
    })
  }

  const add = () => {
    CollectForm.uuid += 1
    const keys = form.getFieldValue(CollectForm.formName)
    const nextKeys = keys.concat(CollectForm.uuid)
    form.setFieldsValue({
      [CollectForm.formName]: nextKeys,
    })
  }

  getFieldDecorator(CollectForm.formName, { initialValue: [] })
  const keys = getFieldValue(CollectForm.formName)
  const addonAfter = k => ({
    addonAfter:
      keys.length > 1
        ? <Icon
          className="dynamic-delete-button"
          type="minus-circle-o"
          disabled={keys.length === 1}
          onClick={() => remove(k)}
        />
        : null,
  })
  const formItems = keys.map(k =>
    <InputGroup key={k}>
      <Col span={12}>
        <FormItem required={false}>
          {getFieldDecorator(`address-${k}`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                validator: CollectForm.addressValidator,
              },
            ],
          })(<Input placeholder="Address" />)}
        </FormItem>
      </Col>

      <Col span={8}>
        <FormItem required={false}>
          {getFieldDecorator(`port-${k}`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                validator: CollectForm.portValidator,
              },
            ],
          })(<Input placeholder="Port" {...addonAfter(k)} />)}
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
      <h4>Specify a set of address and port</h4>
      <Form>
        {formItems}
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="dashed" onClick={add}>
            <Icon type="plus" /> Add
          </Button>
        </FormItem>
      </Form>
    </Modal>
  )
})

CollectForm.formName = 'connects'
CollectForm.uuid = 0

CollectForm.portValidator = (rule, value, callback) => {
  const port = Math.floor(value)
  if (port < 2000 || port > 59999) {
    callback(Error('Port should be a integer (2000~59999)'))
    return
  }
  callback()
}

CollectForm.addressValidator = (rule, value, callback) => {
  if (!value || ipRegex({ exact: true }).test(value)) {
    callback()
  } else {
    callback(Error(`${value} is not a regular IP`))
  }
}

CollectForm.handleCreate = (form) => {
  form.validateFields((err, values) => {
    if (err) return
    const result = values[CollectForm.formName].map((i) => {
      const port = Math.floor(values[`port-${i}`])
      const address = values[`address-${i}`]
      return { port, address }
    })

    console.log('Received values of form: ', result)
  })
}

export default props => <ModalBtn component={CollectForm} {...props}>Connect</ModalBtn>
