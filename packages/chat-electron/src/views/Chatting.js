import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Dialog from '../components/Chatting/Dialog'
import * as actions from './ChattingRedux'

@connect(
  state => ({
    dialog: state.aside.dialog,
    routing: state.routing,
  }),
  dispatch => ({
    dialogActions: bindActionCreators(actions.dialogActions, dispatch),
  })
)
class Chatting extends Component {
  get id() {
    const { match } = this.props
    return match.params
  }

  render() {
    const { dialog, dialogActions } = this.props
    const id = this.id

    return (
      <div>
        <Dialog {...dialogActions} {...dialog} id={id} />
      </div>
    )
  }
}

export default Chatting
