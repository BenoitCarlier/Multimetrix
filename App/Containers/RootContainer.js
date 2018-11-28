import React, { Component } from 'react'
import { View, StatusBar } from 'react-native'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import { connect } from 'react-redux'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'

// Styles
import styles from './Styles/RootContainerStyles'

class RootContainer extends Component {
  componentDidMount () {
    this.props.bleManager.onStateChange((state) => {
      this.props.setControllerState(state)
    }, true)
  }

  render () {
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle='light-content' />
        <ReduxNavigation />
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  bleManager: BluetoothSelectors.getManager(state)
})

const mapDispatchToProps = (dispatch) => ({
  setControllerState: (newState) => dispatch(BluetoothActions.setControllerState(newState))
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
