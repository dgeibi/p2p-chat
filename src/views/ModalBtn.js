import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { modalBtnActions, selectVisible } from './ModalBtnRedux'

@connect(
  (state, ownProp) => ({
    visible: selectVisible(state.modalbtns, ownProp),
  }),
  (dispatch, ownProp) => ({
    show: () => dispatch(modalBtnActions.show(ownProp.id)),
    hide: () => dispatch(modalBtnActions.hide(ownProp.id)),
  })
)
export default class ModalBtn extends Component {
  static propTypes = {
    show: PropTypes.func.isRequired,
    hide: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  }

  render() {
    const {
      show, hide, visible, children,
    } = this.props
    return children({ show, hide, visible })
  }
}
