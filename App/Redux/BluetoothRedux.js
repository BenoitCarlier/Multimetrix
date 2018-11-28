import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { BleManager, State as ControllerState } from 'react-native-ble-plx'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  setControllerState: ['newState'],
  startScan: null,
  stopScan: null
})

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

const BluetoothState = {
  Scanning: 'Scanning',
  Idle: 'Idle',
  Connecting: 'Connecting',
  Connected: 'Connected'
}

const bleManager = new BleManager()

export const INITIAL_STATE = Immutable({
  scannedDevices: [],
  connectedDevice: null,
  bluetoothState: BluetoothState.Idle,
  controllerState: ControllerState.Unknown
})

/* ------------- Selectors ------------- */

export const BluetoothSelectors = {
  getManager: (state) => bleManager,
  getControllerState: state => state.bluetooth.controllerState,
  getScannedDevices: state => state.bluetooth.scannedDevices,
  getConnectedDevice: state => state.bluetooth.connectedDevice
}

/* ------------- Reducers ------------- */

export const setControllerState = (state, { newState }) =>
  state.merge({ controllerState: newState })

export const startScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.Scanning, scannedDevices: [] })

export const stopScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.Idle })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SET_CONTROLLER_STATE]: setControllerState,
  [Types.START_SCAN]: startScan,
  [Types.STOP_SCAN]: stopScan
})
