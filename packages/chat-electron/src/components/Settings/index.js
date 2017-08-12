import React, { Component } from 'react'

class Settings extends Component {
  render() {
    return (
      <div>
        <div>
          <h3>Login/Settings</h3>
          <button aria-label="Close">×</button>
          <div>
            <div>
              <label htmlFor="username">Username: </label>
              <input type="text" name="username" id="username" placeholder="anonymous" />
            </div>
            <div>
              <label htmlFor="port">Port: </label>
              <input type="text" name="port" id="port" placeholder={8087} />
            </div>
            <div>
              <label htmlFor="ip">Address: </label>
              <input type="text" id="ip" name="host" />
            </div>
            <h4>Set range of address and port</h4>
            <div>
              <label htmlFor="ip-start">Least address: </label>
              <input type="text" id="ip-start" name="hostStart" />
            </div>
            <div>
              <label htmlFor="ip-end">Biggest address: </label>
              <input type="text" id="ip-end" name="hostEnd" />
            </div>
            <div>
              <label htmlFor="port-start">Least port: </label>
              <input type="text" id="port-start" name="portStart" placeholder={8087} />
            </div>
            <div>
              <label htmlFor="port-end">Biggest port: </label>
              <input type="text" id="port-end" name="portEnd" placeholder={8090} />
            </div>
            <div>
              <h4>Specify a set of address and port</h4>
              <button>Add</button>
              <ul>
                <li>
                  <input type="text" name="host" placeholder="Address" />
                  <input type="text" name="port" placeholder="Port" />
                  <button>Delete</button>
                </li>
              </ul>
            </div>
            <a href="#" id="settings-submit">
              Submit
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default Settings
