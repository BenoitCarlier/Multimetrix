import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { BleManager, State as ControllerState } from 'react-native-ble-plx'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  init: null,
  onInitDone: null,
  setControllerState: ['newState'],
  setConnectedDevice: ['newDevice'],
  onValueReceived: ['newValue'],
  startScan: null,
  stopScan: null,
  onDeviceFound: ['deviceFound'],
  onScanStopped: null,
  connect: ['deviceId', 'onConnectedCallback'],
  onConnected: ['connectedDevice'],
  disconnect: null,
  onDisconnected: null,
  subscribeNotification: ['device'],
  onError: ['error']
})

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const BluetoothState = {
  Initializing: 'Initializing',
  Scanning: 'Scanning',
  StoppingScan: 'StoppingScan',
  Idle: 'Idle',
  Connecting: 'Connecting',
  Connected: 'Connected',
  Disconnecting: 'Disconnecting'
}

const bleManager = new BleManager()

export const INITIAL_STATE = Immutable({
  value: null,
  scannedDevices: {},
  connectedDevice: null,
  bluetoothState: BluetoothState.Idle,
  controllerState: ControllerState.Unknown,
  error: null
})

/* ------------- Selectors ------------- */

export const BluetoothSelectors = {
  getManager: (state) => bleManager,
  getError: (state) => state.bluetooth.error,
  getValue: (state) => state.bluetooth.value,
  getBluetoothState: state => state.bluetooth.bluetoothState,
  getControllerState: state => state.bluetooth.controllerState,
  getScannedDevices: state => Object.values(state.bluetooth.scannedDevices),
  getConnectedDevice: state => state.bluetooth.connectedDevice
}

/* ------------- Reducers ------------- */

export const init = (state) =>
  state.merge({ bluetoothState: BluetoothState.Initializing })

export const onInitDone = (state) => {
  console.log('onInitDone')
  return state.merge({ bluetoothState: BluetoothState.Idle })
}

export const setControllerState = (state, { newState }) =>
  state.merge({ controllerState: newState })

export const setConnectedDevice = (state, { newDevice }) =>
  state.merge({ connectedDevice: newDevice })

export const setValue = (state, { newValue }) =>
  state.merge({ value: newValue })

export const startScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.Scanning, scannedDevices: [] })

export const stopScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.StoppingScan })

export const onScanStopped = (state) => {
  if (state.bluetoothState !== BluetoothState.Scanning) {
    return state
  }
  return state.merge({ bluetoothState: BluetoothState.Idle })
}

export const onDeviceFound = (state, { deviceFound }) =>
  state.merge({
    scannedDevices: {
      ...state.scannedDevices,
      [deviceFound.id]: {
        id: deviceFound.id,
        name: deviceFound.name
      }
    }
  })

export const connect = (state) =>
  state.merge({ bluetoothState: BluetoothState.Connecting })

export const onConnected = (state, { connectedDevice }) => {
  console.log('onConnected')
  return state.merge({
    bluetoothState: BluetoothState.Connected,
    connectedDevice: {
      id: connectedDevice.id,
      name: connectedDevice.name
    },
    scannedDevices: []
  })
}

export const disconnect = (state) =>
  state.merge({ bluetoothState: BluetoothState.Disconnecting })

export const onDisconnected = (state) => {
  console.log('onDisconnected')
  return state.merge({ bluetoothState: BluetoothState.Idle, connectedDevice: null, value: null })
}

export const onError = (state, { error }) => {
  console.log('ERROR', error)
  return state.merge({ bluetoothState: BluetoothState.Idle, error: error })
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT]: init,
  [Types.ON_INIT_DONE]: onInitDone,
  [Types.SET_CONNECTED_DEVICE]: setConnectedDevice,
  [Types.SET_CONTROLLER_STATE]: setControllerState,
  [Types.ON_VALUE_RECEIVED]: setValue,
  [Types.START_SCAN]: startScan,
  [Types.STOP_SCAN]: stopScan,
  [Types.ON_DEVICE_FOUND]: onDeviceFound,
  [Types.ON_SCAN_STOPPED]: onScanStopped,
  [Types.CONNECT]: connect,
  [Types.ON_CONNECTED]: onConnected,
  [Types.DISCONNECT]: disconnect,
  [Types.ON_DISCONNECTED]: onDisconnected,
  [Types.ON_ERROR]: onError
})
