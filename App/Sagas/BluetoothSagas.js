import { apply, cancel, cancelled, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { Buffer } from 'buffer'
import BluetoothConfig from '../Config/BluetoothConfig'
import BluetoothActions, { BluetoothSelectors, BluetoothTypes } from '../Redux/BluetoothRedux'
import { State as ControllerState } from 'react-native-ble-plx'
import LoadingActions, { LoadingId } from '../Redux/LoadingRedux'

/** ************ Scan ************* **/
export function * scanDevicesTask (channel) {
  try {
    while (true) {
      const { error, device } = yield take(channel)
      if (error) {
        throw error
      }

      yield put(BluetoothActions.onDeviceFound(device))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    if (yield cancelled()) {
      yield put(BluetoothActions.onScanStopped())
    }
  }
}

export function * scanDevices () {
  yield put(LoadingActions.onLoad(LoadingId.Scanning))

  const bleManager = yield select(BluetoothSelectors.getManager)

  const scanningChannel = eventChannel(emit => {
    bleManager.startDeviceScan([BluetoothConfig.serviceUUID], null, (error, scannedDevice) => {
      if (error) {
        emit({ error, device: null })
      } else {
        emit({ error: null, device: scannedDevice })
      }
    })

    return () => {}
  })

  const task = yield fork(scanDevicesTask, scanningChannel)

  yield put(LoadingActions.onStopLoading(LoadingId.Scanning))

  yield take(BluetoothTypes.STOP_SCAN)

  yield put(LoadingActions.onLoad(LoadingId.StoppingScan))

  bleManager.stopDeviceScan()

  yield cancel(task)

  yield put(LoadingActions.onStopLoading(LoadingId.StoppingScan))
}

/** ************ Connection ************* **/
export function * connectDevice (action) {
  yield put(LoadingActions.onLoad(LoadingId.Connecting))

  try {
    const controllerState = yield select(BluetoothSelectors.getControllerState)
    if (controllerState !== ControllerState.PoweredOn) {
      throw new Error("Le contrôleur Bluetooth n'est pas allumé")
    }

    const bleManager = yield select(BluetoothSelectors.getManager)
    const { deviceId, onConnectedCallback } = action
    console.log('CONNECTING TO ', deviceId)

    let connectedDevice = yield apply(bleManager, bleManager.connectToDevice, [deviceId, { timeout: 5000 }])

    connectedDevice = yield apply(connectedDevice, connectedDevice.discoverAllServicesAndCharacteristics)

    yield put(BluetoothActions.onConnected(connectedDevice))

    onConnectedCallback(connectedDevice)
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Connecting))
  }
}

/** ************ Disconnection ************* **/
export function * disconnectDevice () {
  yield put(LoadingActions.onLoad(LoadingId.Disconnecting))

  try {
    const bleManager = yield select(BluetoothSelectors.getManager)
    const connectedDevice = yield select(BluetoothSelectors.getConnectedDevice)

    if (connectedDevice !== null) {
      console.log('DISCONNECTING FROM ', connectedDevice.id)

      // TODO: stop reading value before disconnecting
      yield apply(bleManager, bleManager.cancelDeviceConnection, [connectedDevice.id])
    }

    yield put(BluetoothActions.onDisconnected())
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Disconnecting))
  }
}

/** ****** Subscribe to notification ******* **/
export function * receiveNotificationTask (channel) {
  try {
    while (true) {
      const { error, value } = yield take(channel)
      if (error) {
        throw error
      }

      yield put(BluetoothActions.onValueReceived(value))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    if (yield cancelled()) {
      yield put(BluetoothActions.onScanStopped())
    }
  }
}

export function * receiveNotification (action) {
  try {
    const { device } = action

    const notificationChannel = eventChannel(emit => {
      device.monitorCharacteristicForService(
        BluetoothConfig.serviceUUID,
        BluetoothConfig.notifyCharacteristicUUID,
        (error, characteristic) => {
          if (error) {
            // emit({ error, value: null })
          } else {
            let buffer = Buffer.from(characteristic.value, 'base64')
            let valueRead = buffer.readUIntLE(0, buffer.length)
            emit({ error: null, value: valueRead })
          }
        }
      )

      return () => {}
    })

    yield fork(receiveNotificationTask, notificationChannel)
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Initializing))
  }
}

/** ************ Init ************* **/
export function * controllerStateTask (channel) {
  try {
    while (true) {
      const { state } = yield take(channel)

      yield put(BluetoothActions.setControllerState(state))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  }
}

export function * initBluetooth () {
  yield put(LoadingActions.onLoad(LoadingId.Initializing))

  try {
    const bleManager = yield select(BluetoothSelectors.getManager)

    const controllerStateChannel = eventChannel(emit => {
      const subscription = bleManager.onStateChange((state) => {
        emit({ state })
      }, true)

      return () => {
        console.log('Unsubscribed from controller state channel')
        subscription.remove()
      }
    })

    yield fork(controllerStateTask, controllerStateChannel)

    const connectedDevices = yield apply(bleManager, bleManager.connectedDevices, [[]])

    if (connectedDevices.length > 0) {
      if (connectedDevices.length === 1) {
        yield put(BluetoothActions.setConnectedDevice(connectedDevices[0]))
      } else {
        throw new Error("Ne gère pas les connexions multiples pour l'instant")
      }
    }

    yield put(BluetoothActions.onInitDone())
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Initializing))
  }
}
