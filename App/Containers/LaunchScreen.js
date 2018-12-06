import React, { Component } from 'react'
import { Text, ScrollView, View } from 'react-native'
import connect from 'react-redux/es/connect/connect'
import { State as ControllerState } from 'react-native-ble-plx'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'
import Icon from 'react-native-vector-icons/FontAwesome'
import { LineChart, Grid, YAxis } from 'react-native-svg-charts'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  constructor (props) {
    super(props)

    this.displayConnectionButton = this.displayConnectionButton.bind(this)
    this.onConnectPressed = this.onConnectPressed.bind(this)
    this.onDisconnectPressed = this.onDisconnectPressed.bind(this)
  }

  async onConnectPressed () {
    if (this.props.controllerState !== ControllerState.PoweredOn) {
      await this.props.bleManager.enable()
    }
    this.props.navigation.navigate('ConnectionScreen')
  }

  onDisconnectPressed () {
    this.props.disconnect()
  }

  displayConnectionButton () {
    if (this.props.bluetoothState === BluetoothState.Connected) {
      return (
        <View style={{alignItems: 'center'}}>
          <Text style={styles.nameDeviceConnected}>Connecté à {this.props.connectedDevice.id}</Text>
          <View style={styles.btDisconnectButton}>
            <Icon.Button name={'bluetooth'} size={20} onPress={this.onDisconnectPressed} iconStyle={styles.btButtonIcon}>
              Se déconnecter
            </Icon.Button>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.btConnectButton}>
          <Icon.Button name={'bluetooth'} size={20} onPress={this.onConnectPressed} iconStyle={styles.btButtonIcon}>
            Se connecter
          </Icon.Button>
        </View>
      )
    }
  }

  render () {
    return (
      <ScrollView contentContainerStyle={styles.mainContainer}>

        <Text style={styles.AppTitleStyle}>Multimetrix</Text>

        {this.displayConnectionButton()}

        {this.props.values !== null &&
          <View style={{alignItems: 'center'}}>
            <Text style={styles.digitStyle}>
              {this.props.lastValue}
            </Text>
            <Text style={styles.littleDigitStyle}> mV </Text>

            <View style={{height: 200, flexDirection: 'row'}}>
              <YAxis
                data={this.props.values}
                contentInset={{top: 20, bottom: 20}}
                svg={{fill: 'grey', fontSize: 10}}
                numberOfTicks={5}
                formatLabel={value => `${value}mV`}
              />
              <LineChart
                style={styles.valuesChart}
                data={this.props.values}
                svg={{stroke: 'rgb(0, 97, 255)'}}
                contentInset={{top: 20, bottom: 20}}
              >
                <Grid />
              </LineChart>
            </View>
          </View>
        }

        <Text style={styles.authors}> By Alexis A., Clément P. and Benoit C.G. </Text>

      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  bleManager: BluetoothSelectors.getManager(state),
  controllerState: BluetoothSelectors.getControllerState(state),
  bluetoothState: BluetoothSelectors.getBluetoothState(state),
  connectedDevice: BluetoothSelectors.getConnectedDevice(state),
  lastValue: BluetoothSelectors.getLastValue(state),
  values: BluetoothSelectors.getValues(state)
})

const mapDispatchToProps = (dispatch) => ({
  disconnect: () => dispatch(BluetoothActions.disconnect())
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
