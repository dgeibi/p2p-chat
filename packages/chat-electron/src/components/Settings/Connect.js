import { Form, Input, Icon, Button, Col, Modal } from 'antd'
import React, { Component } from 'react'
import ipRegex from 'ip-regex'

const InputGroup = Input.Group
const FormItem = Form.Item

let uuid = 0
const name = 'connects'
const formItemLayout = {
  wrapperCol: { span: 20, offset: 4 },
}

const CollectForm = Form.create()((props) => {
  const { visible, onCancel, onCreate, form } = props
  const { getFieldDecorator, getFieldValue } = form

  const remove = (k) => {
    const keys = form.getFieldValue(name)
    if (keys.length === 1) {
      return
    }
    form.setFieldsValue({
      [name]: keys.filter(key => key !== k),
    })
  }

  const add = () => {
    uuid += 1
    const keys = form.getFieldValue(name)
    const nextKeys = keys.concat(uuid)
    form.setFieldsValue({
      [name]: nextKeys,
    })
  }

  getFieldDecorator(name, { initialValue: [] })
  const keys = getFieldValue(name)
  const formItems = keys.map(k =>
    <InputGroup key={k}>
      <Col span={12}>
        <FormItem {...formItemLayout} required={false}>
          {getFieldDecorator(`address-${k}`, {
            validateTrigger: ['onChange', 'onBlur'],
            rules: [
              {
                validator(rule, value, callback) {
                  if (ipRegex({ exact: true }).test(value)) {
                    callback()
                  } else {
                    callback(Error(`${value} is not a regular IP`))
                  }
                },
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
                type: 'integer',
                transform(value) {
                  return Math.floor(value)
                },
                validator(rule, value, callback) {
                  if (value < 2000 || value > 59999) {
                    callback(
                      Error('Port should be a integer (2000~59999)')
                    )
                    return
                  }
                  callback()
                },
              },
            ],
          })(
            <Input
              placeholder="Port"
              addonAfter={
                keys.length > 1
                  ? <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    disabled={keys.length === 1}
                    onClick={() => remove(k)}
                  />
                  : null
              }
            />
          )}
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

class Connect extends Component {
  state = {
    visible: false,
  }
  showModal = () => {
    this.setState({ visible: true })
  }
  handleCancel = () => {
    this.setState({ visible: false })
  }
  handleCreate = () => {
    const form = this.form
    form.validateFields((err, values) => {
      if (err) {
        return
      }
      const result = values[name].map((i) => {
        const port = Math.floor(values[`port-${i}`])
        const address = values[`address-${i}`]
        return { port, address }
      })

      console.log('Received values of form: ', result)
      form.resetFields()
      this.setState({ visible: false })
    })
  }
  saveFormRef = (form) => {
    this.form = form
  }
  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Connect
        </Button>
        <CollectForm
          ref={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    )
  }
}

export default Connect
