import { takeLatest, all } from 'redux-saga/effects'
// import API from '../Services/Api'
// import FixtureAPI from '../Services/FixtureApi'
// import DebugConfig from '../Config/DebugConfig'

/* ------------- Types ------------- */

import { BluetoothTypes } from '../Redux/BluetoothRedux'

/* ------------- Sagas ------------- */

import { connectDevice, disconnectDevice, initBluetooth, receiveNotification, scanDevices } from './BluetoothSagas'

/* ------------- API ------------- */

// The API we use is only used from Sagas, so we create it here and pass along
// to the sagas which need it.
// const api = DebugConfig.useFixtures ? FixtureAPI : API.create()

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield all([
    takeLatest(BluetoothTypes.START_SCAN, scanDevices),
    takeLatest(BluetoothTypes.INIT, initBluetooth),
    takeLatest(BluetoothTypes.CONNECT, connectDevice),
    takeLatest(BluetoothTypes.DISCONNECT, disconnectDevice),
    takeLatest(BluetoothTypes.SUBSCRIBE_NOTIFICATION, receiveNotification)
  ])
}
