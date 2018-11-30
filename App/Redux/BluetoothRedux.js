import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { BleManager, State as ControllerState } from 'react-native-ble-plx'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  setControllerState: ['newState'],
  setConnectedDevice: ['connectedDevice'],
  setValueRead: ['newValue'],
  startScan: null,
  stopScan: null,
  onDeviceFound: ['deviceFound'],
  onScanStopped: null,
  onError: ['error']
})

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const BluetoothState = {
  Scanning: 'Scanning',
  StoppingScan: 'StoppingScan',
  Idle: 'Idle',
  Connecting: 'Connecting',
  Connected: 'Connected'
}

const bleManager = new BleManager()

export const INITIAL_STATE = Immutable({
  valueRead: null,
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
  getValueRead: (state) => state.bluetooth.valueRead,
  getBluetoothState: state => state.bluetooth.bluetoothState,
  getControllerState: state => state.bluetooth.controllerState,
  getScannedDevices: state => Object.values(state.bluetooth.scannedDevices),
  getConnectedDevice: state => state.bluetooth.connectedDevice,
  isLoading: state => [BluetoothState.StoppingScan, BluetoothState.Connecting].includes(state.bluetooth.bluetoothState)
}

/* ------------- Reducers ------------- */

export const setControllerState = (state, { newState }) =>
  state.merge({ controllerState: newState })

export const setValueRead = (state, { newValue }) => {
  console.log(newValue)
  return state.merge({ valueRead: newValue })
}

export const setConnectedDevice = (state, { connectedDevice }) => {
  if (connectedDevice !== null) {
    return state.merge({
      connectedDevice: {
        id: connectedDevice.id,
        name: connectedDevice.name
      }
    })
  } else {
    return state.merge({ connectedDevice: null, valueRead: null })
  }
}

export const startScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.Scanning, scannedDevices: [] })

export const stopScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.StoppingScan })

export const onScanStopped = (state) =>
  state.merge({ bluetoothState: BluetoothState.Idle })

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

export const onError = (state, { error }) => {
  console.log('ERROR', error)
  return state.merge({ bluetoothState: BluetoothState.Idle, error: error })
}

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_CONTROLLER_STATE]: setControllerState,
  [Types.SET_CONNECTED_DEVICE]: setConnectedDevice,
  [Types.SET_VALUE_READ]: setValueRead,
  [Types.START_SCAN]: startScan,
  [Types.STOP_SCAN]: stopScan,
  [Types.ON_ERROR]: onError,
  [Types.ON_DEVICE_FOUND]: onDeviceFound,
  [Types.ON_SCAN_STOPPED]: onScanStopped
})
