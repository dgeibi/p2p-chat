import { Form, Input, Checkbox, Button, Alert } from 'antd'
import React, { Component } from 'react'
import { ipcRenderer } from 'electron'

import Modal from '../../Common/Modal'
import { validName } from '../validators'

const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item

const create = ({ tags, name }) => {
  ipcRenderer.send('create-channel', { tags, name })
}

const validForm = (form, callback) => {
  form.validateFields((err, values) => {
    if (err) {
      callback(err)
      return
    }
    create(values)
    callback()
  })
}

@Form.create()
export default class CreateChannel extends Component {
  static checkboxsField = 'tags'
  state = {
    indeterminate: false,
    checkAll: false,
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

  onChange = (checkedList) => {
    const { onlineUsers } = this.props
    this.setState({
      indeterminate: checkedList.length > 0 && checkedList.length < onlineUsers.length,
      checkAll: checkedList.length === onlineUsers.length,
    })
  }

  onCheckAllChange = (e) => {
    const values = this.props.onlineUsers.map(x => x.value)
    this.props.form.setFieldsValue({
      [CreateChannel.checkboxsField]: e.target.checked ? values : [],
    })
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
    })
  }

  renderForm() {
    const { getFieldDecorator } = this.props.form
    const { onlineUsers } = this.props
    return (
      <Form>
        <FormItem label="Channel name">
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: 'Please input a channel name!',
              },
              {
                validator: validName,
              },
            ],
          })(<Input />)}
        </FormItem>
        <FormItem label="Channel members">
          {getFieldDecorator(CreateChannel.checkboxsField, {
            rules: [
              {
                required: true,
                message: 'Please select channel members!',
              },
            ],
          })(<CheckboxGroup options={onlineUsers} onChange={this.onChange} />)}
        </FormItem>
        <div>
          <Checkbox
            indeterminate={this.state.indeterminate}
            onChange={this.onCheckAllChange}
            checked={this.state.checkAll}
          >
            Check all
          </Checkbox>
        </div>
      </Form>
    )
  }

  render() {
    const { onlineUsers, visible } = this.props
    const props = {}
    if (onlineUsers.length <= 0) {
      props.footer = (
        <Button size="large" type="primary" onClick={this.handleCancel}>
          OK
        </Button>
      )
      props.children = (
        <Alert
          message="You can't create channels when nobody onlines."
          type="warning"
          showIcon
        />
      )
    } else {
      props.children = this.renderForm()
    }
    return (
      <Modal
        visible={visible}
        title="Create a channel"
        okText="Create"
        cancelText="Cancel"
        onCancel={this.handleCancel}
        onOk={this.handleCreate}
        {...props}
      />
    )
  }
}
