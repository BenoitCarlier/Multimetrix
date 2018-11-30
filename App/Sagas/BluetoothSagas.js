import { cancel, cancelled, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import BluetoothActions, { BluetoothSelectors, BluetoothTypes } from '../Redux/BluetoothRedux'

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
  const bleManager = yield select(BluetoothSelectors.getManager)

  const channel = eventChannel(emit => {
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {  // TODO: mettre service UUID
      if (error) {
        emit({ error, device: null })
      } else {
        emit({ error: null, device: scannedDevice })
      }
    })

    return () => { console.log('Unsubscribed') }
  })

  const task = yield fork(scanDevicesTask, channel)

  yield take(BluetoothTypes.STOP_SCAN)

  bleManager.stopDeviceScan()

  yield cancel(task)
}
