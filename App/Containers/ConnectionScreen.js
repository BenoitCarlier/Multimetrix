import React, { Component } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { Buffer } from 'buffer'
import BleItem from '../Components/bleItem'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'

import styles from './Styles/ConnectionScreenStyle'

class ConnectionScreen extends Component {
  constructor (props) {
    super(props)

    // TODO: mettre loading dans redux store
    this.state = {
      loading: false
    }

    this.renderItem = this.renderItem.bind(this)
    this.onDeviceFoundPressed = this.onDeviceFoundPressed.bind(this)
  }

  componentDidMount () {
    this.props.startScan()
  }

  componentWillUnmount () {
    // TODO: handle case where we go back while connecting
    if (this.props.bluetoothState === BluetoothState.Scanning) {
      this.props.stopScan()
    }
  }

  onDeviceFoundPressed (deviceId) {
    console.log('CONNECTING TO ', deviceId)

    this.setState({
      loading: true
    })

    // TODO: move bleManager actions made in components into BluetoothRedux actions to have bluetoothState = Connecting
    this.props.bleManager.connectToDevice(deviceId, { timeout: 5000 })
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics()
      })
      .then((device) => {
        this.props.setConnectedDevice(device)
        this.props.navigation.goBack()

        // device.services()
        //   .then((services) => {
        //     console.log(services)
        //   })

        // device.characteristicsForService('6e400001-b5a3-f393-e0a9-e50e24dcca9e')
        //   .then((characteristics) => console.log(characteristics))

        device.monitorCharacteristicForService('6e400001-b5a3-f393-e0a9-e50e24dcca9e', '6e400003-b5a3-f393-e0a9-e50e24dcca9e', (error, characteristic) => {
          if (error) {
            console.log(error)
          } else {
            let buffer = Buffer.from(characteristic.value, 'base64')
            let valueRead = buffer.readUIntLE(0, buffer.length)
            this.props.setValueRead(valueRead)
          }
        })
      })
      .catch((error) => {
        this.props.onError(error)
      })
      .finally(() => {
        this.setState({
          loading: false
        })
      })
  }

  renderItem ({ item, index }) {
    return (
      <TouchableOpacity onPress={() => this.onDeviceFoundPressed(item.id)}>
        <BleItem device={item} last={index === this.props.scannedDevices.length - 1}/>
      </TouchableOpacity>
    )
  }

  render () {
    return (
      <View>
        {this.state.loading &&
        <Text>LOADING</Text>
        }
        <Text style={styles.scanTitle}>
          Scan BLE Actif
        </Text>

        <FlatList
          data={this.props.scannedDevices}
          keyExtractor={(item, index) => item.id}
          renderItem={this.renderItem}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    bleManager: BluetoothSelectors.getManager(state),
    scannedDevices: BluetoothSelectors.getScannedDevices(state),
    bluetoothState: BluetoothSelectors.getBluetoothState(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startScan: () => dispatch(BluetoothActions.startScan()),
    stopScan: () => dispatch(BluetoothActions.stopScan()),
    setConnectedDevice: (connectedDevice) => dispatch(BluetoothActions.setConnectedDevice(connectedDevice)),
    setValueRead: (valueRead) => dispatch(BluetoothActions.setValueRead(valueRead)),
    onError: (error) => dispatch(BluetoothActions.onError(error))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionScreen)
