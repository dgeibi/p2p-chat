import React, { Component } from 'react'
import { Button, Input, Form } from 'antd'
import Connect from './Connect'

@Form.create()
class Settings extends Component {
  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <div>
        <Form>
          <h3>Login/Settings</h3>
          <FormItem label="Username">
            {getFieldDecorator('username', {
              initialValue: '匿名',
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
            })(<Input />)}
          </FormItem>
        </Form>
        <Connect />
      </div>
    )
  }
}

export default Settings

function FormItem(props) {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  }
  return <Form.Item {...formItemLayout} {...props} />
}
