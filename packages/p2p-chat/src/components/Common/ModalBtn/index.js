import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as actions from './redux'

function selectVisible(state, ownProp) {
  if (state[ownProp.id] === undefined) return !!ownProp.visibleDefault
  return !!state[ownProp.id]
}

@connect(
  (state, ownProp) => ({
    visible: selectVisible(state.modalbtns, ownProp),
  }),
  (dispatch, ownProp) => ({
    show: () => dispatch(actions.show(ownProp.id)),
    hide: () => dispatch(actions.hide(ownProp.id)),
  })
)
export default class ModalBtn extends Component {
  static propTypes = {
    show: PropTypes.func.isRequired,
    hide: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }

  render() {
    const { show, hide, visible, children } = this.props
    return children({ show, hide, visible })
  }
}
