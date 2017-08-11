import React, { Component } from 'react'

class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      text: '',
    }
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(e) {
    const name = e.target.name
    this.setState({
      [name]: e.target.value,
    })
  }
  render() {
    return (
      <div>
        <div>
          <input type="file" name="files" onChange={this.handleChange} />
          <a href="#">文件</a>
        </div>
        <div>
          <textarea name="text" onChange={this.handleChange} />
        </div>
      </div>
    )
  }
}

export default Dialog
