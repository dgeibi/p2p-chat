import React, { Component } from 'react'
import { Button, Input } from 'antd'

class Settings extends Component {
  render() {
    return (
      <div>
        <div>
          <h3>Login/Settings</h3>
          <Button aria-label="Close">×</Button>
          <div>
            <div>
              <label htmlFor="username">Username: </label>
              <Input type="text" name="username" id="username" placeholder="anonymous" />
            </div>
            <div>
              <label htmlFor="port">Port: </label>
              <Input type="text" name="port" id="port" placeholder={8087} />
            </div>
            <div>
              <label htmlFor="ip">Address: </label>
              <Input type="text" id="ip" name="host" />
            </div>
            <h4>Set range of address and port</h4>
            <div>
              <label htmlFor="ip-start">Least address: </label>
              <Input type="text" id="ip-start" name="hostStart" />
            </div>
            <div>
              <label htmlFor="ip-end">Biggest address: </label>
              <Input type="text" id="ip-end" name="hostEnd" />
            </div>
            <div>
              <label htmlFor="port-start">Least port: </label>
              <Input type="text" id="port-start" name="portStart" placeholder={8087} />
            </div>
            <div>
              <label htmlFor="port-end">Biggest port: </label>
              <Input type="text" id="port-end" name="portEnd" placeholder={8090} />
            </div>
            <div>
              <h4>Specify a set of address and port</h4>
              <Button>Add</Button>
              <ul>
                <li>
                  <Input type="text" name="host" placeholder="Address" />
                  <Input type="text" name="port" placeholder="Port" />
                  <Button>Delete</Button>
                </li>
              </ul>
            </div>
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Settings
