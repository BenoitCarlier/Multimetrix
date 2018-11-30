import React, { Component } from 'react'
import { Alert, View, StatusBar } from 'react-native'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import { connect } from 'react-redux'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'

// Styles
import styles from './Styles/RootContainerStyles'

class RootContainer extends Component {
  async componentDidMount () {
    this.props.bleManager.onStateChange((state) => {
      this.props.setControllerState(state)
    }, true)

    let connectedDevices = await this.props.bleManager.connectedDevices([]) // TODO: mettre service UUID

    if (connectedDevices.length > 0) {
      // TODO: gerer les connexions multiples
      if (connectedDevices.length === 1) {
        this.props.setConnectedDevice(connectedDevices[0])
      } else {
        console.log("Ne gère pas les connexions multiples pour l'instant")
      }
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.error === null && this.props.error !== null) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + this.props.error)
    }
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
  bleManager: BluetoothSelectors.getManager(state),
  error: BluetoothSelectors.getError(state)
})

const mapDispatchToProps = (dispatch) => ({
  setControllerState: (newState) => dispatch(BluetoothActions.setControllerState(newState)),
  setConnectedDevice: (connectedDevice) => dispatch(BluetoothActions.setConnectedDevice(connectedDevice))
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
