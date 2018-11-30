import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'
import connect from 'react-redux/es/connect/connect'
import { State as ControllerState } from 'react-native-ble-plx'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'
import Icon from 'react-native-vector-icons/FontAwesome'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false
    }

    this.displayConnectionButton = this.displayConnectionButton.bind(this)
    this.onConnectPressed = this.onConnectPressed.bind(this)
    this.onDisconnectPressed = this.onDisconnectPressed.bind(this)
  }

  static getDerivedStateFromProps (props, currentState) {
    if (props.isBluetoothLoading !== currentState.loading) {
      return {
        loading: props.isBluetoothLoading || currentState.loading
      }
    }
    return null
  }

  async onConnectPressed () {
    if (this.props.controllerState !== ControllerState.PoweredOn) {
      await this.props.bleManager.enable()
    }
    this.props.navigation.navigate('ConnectionScreen')
  }

  async onDisconnectPressed () {
    this.setState({
      loading: true
    })

    if (this.props.connectedDevice !== null) {
      // TODO: stop reading value before disconnecting
      await this.props.bleManager.cancelDeviceConnection(this.props.connectedDevice.id)
      this.props.setConnectedDevice(null)
      this.setState({
        loading: false
      })
    }
  }

  displayConnectionButton () {
    if (this.state.loading) {
      return null
    }

    if (this.props.connectedDevice === null) {
      return (
        <View style={{ width: 130 }}>
          <Icon.Button name={'bluetooth'} size={20} onPress={this.onConnectPressed}>
            Se connecter
          </Icon.Button>
        </View>
      )
    } else {
      return (
        <View style={{ width: 150 }}>
          <Icon.Button name={'bluetooth'} size={20} onPress={this.onDisconnectPressed}>
            Se déconnecter
          </Icon.Button>
        </View>
      )
    }
  }

  render () {
    return (
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>

          <View>
            <Text>Multimetrix</Text>
          </View>

          {this.state.loading &&
          <View>
            <Text>LOADING</Text>
          </View>
          }

          {this.displayConnectionButton()}

          <View style={styles.section}>
            <Text style={{ fontFamily: 'SevenSegmentRegular', fontSize: 90, color: '#000000' }}>
              {this.props.valueRead || '-'}
            </Text>
          </View>

        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  bleManager: BluetoothSelectors.getManager(state),
  connectedDevice: BluetoothSelectors.getConnectedDevice(state),
  controllerState: BluetoothSelectors.getControllerState(state),
  bluetoothState: BluetoothSelectors.getBluetoothState(state),
  isBluetoothLoading: BluetoothSelectors.isLoading(state),
  valueRead: BluetoothSelectors.getValueRead(state)
})

const mapDispatchToProps = (dispatch) => ({
  setConnectedDevice: (connectedDevice) => dispatch(BluetoothActions.setConnectedDevice(connectedDevice))
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
