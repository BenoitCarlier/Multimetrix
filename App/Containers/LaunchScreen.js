import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'
import connect from 'react-redux/es/connect/connect'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'
import Icon from 'react-native-vector-icons/FontAwesome'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  constructor (props) {
    super(props)
    this.onConnectBtnPressed = this.onConnectBtnPressed.bind(this)
  }

  onConnectBtnPressed () {
    this.props.navigation.navigate('ConnectionScreen')
  }

  render () {
    return (
      <View style={styles.mainContainer}>
        <ScrollView style={styles.container}>

          <View>
            <Text>Multimetrix</Text>
          </View>

          {this.props.connectedDevice === null &&
            <View style={{ width: 130 }}>
              <Icon.Button name={'bluetooth'} size={20} onPress={this.onConnectBtnPressed}>
                Se connecter
              </Icon.Button>
            </View>
          }

          <View style={styles.section}>
            <Text style={{ fontFamily: 'SevenSegmentRegular', fontSize: 90, color: '#000000' }}>
              13
            </Text>
          </View>

        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  connectedDevice: BluetoothSelectors.getConnectedDevice(state),
  controllerState: BluetoothSelectors.getControllerState(state)
})

const mapDispatchToProps = (dispatch) => ({
  startScan: () => dispatch(BluetoothActions.startScan())
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
