import React, { Component } from 'react'
import { Alert, View, StatusBar, ActivityIndicator } from 'react-native'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import { connect } from 'react-redux'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'
import { LoadingSelectors } from '../Redux/LoadingRedux'

// Styles
import styles from './Styles/RootContainerStyles'

class RootContainer extends Component {
  componentDidMount () {
    this.props.initBluetooth()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.error === null && this.props.error !== null) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + this.props.error)
    }
  }

  render () {
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle='light-content' />
        <ReduxNavigation />

        {this.props.isLoading &&
          <View style={styles.loader}>
            <ActivityIndicator size='large' />
          </View>
        }

      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  error: BluetoothSelectors.getError(state),
  isLoading: LoadingSelectors.isLoading(state)
})

const mapDispatchToProps = (dispatch) => ({
  initBluetooth: () => dispatch(BluetoothActions.init())
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
