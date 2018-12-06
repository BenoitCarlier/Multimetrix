import React, { Component } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'

import styles from './Styles/ConnectionScreenStyle'

class ConnectionScreen extends Component {
  constructor (props) {
    super(props)

    this.renderItem = this.renderItem.bind(this)
    this.onDeviceFoundPressed = this.onDeviceFoundPressed.bind(this)
  }

  componentDidMount () {
    this.props.startScan()
  }

  componentWillUnmount () {
    if (this.props.bluetoothState === BluetoothState.Scanning) {
      this.props.stopScan()
    }
  }

  onDeviceFoundPressed (deviceId) {
    this.props.connect(deviceId, (device) => {
      this.props.subscribeNotification(device)
      this.props.navigation.goBack()
    })
  }

  renderItem ({ item, index }) {
    let itemView
    const isLast = index === this.props.scannedDevices.length - 1

    if (item.name !== null) {
      itemView = (
        <View style={{ flex: 1, margin: 15 }}>
          <Text style={styles.nameDevice}>
            Nom : {item.name}
          </Text>
          <Text style={styles.idDevice}>
            Adresse MAC : {item.id}
          </Text>
        </View>
      )
    } else {
      itemView = (
        <Text style={styles.idDevice2}>
          Adresse MAC : {item.id}
        </Text>
      )
    }

    return (
      <TouchableOpacity onPress={() => this.onDeviceFoundPressed(item.id)}>
        <View style={[styles.bleItemView, isLast && styles.bleLastItemView]}>
          {itemView}
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    return (
      <View>
        <Text style={styles.scanTitle}>
          Appareils disponibles
        </Text>

        <FlatList
          data={this.props.scannedDevices}
          keyExtractor={(item) => item.id}
          renderItem={this.renderItem}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    scannedDevices: BluetoothSelectors.getScannedDevices(state),
    bluetoothState: BluetoothSelectors.getBluetoothState(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startScan: () => dispatch(BluetoothActions.startScan()),
    stopScan: () => dispatch(BluetoothActions.stopScan()),
    connect: (deviceId, onConnectedCallback) => dispatch(BluetoothActions.connect(deviceId, onConnectedCallback)),
    subscribeNotification: (device) => dispatch(BluetoothActions.subscribeNotification(device))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionScreen)
