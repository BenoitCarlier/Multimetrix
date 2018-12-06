import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin
  },
  logo: {
    marginTop: Metrics.doubleSection,
    height: Metrics.images.logo,
    width: Metrics.images.logo,
    resizeMode: 'contain'
  },
  centered: {
    alignItems: 'center'
  },
  btConnectButton: {
    width: 150
  },
  btDisconnectButton: {
    width: 170
  },
  btButtonIcon: {
    marginRight: 20
  },
  AppTitleStyle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    marginTop: 10
  },
  authors: {
    fontStyle: 'italic'
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  digitStyle: {
    fontFamily: 'SevenSegmentRegular',
    fontSize: 90,
    color: '#000000'
  },
  littleDigitStyle: {
    fontFamily: 'SevenSegmentRegular',
    fontSize: 30,
    color: '#000000',
    textAlign: 'center'
  },
  nameDeviceConnected: {
    fontSize: 18,
    color: '#59644e'
  },
  valuesChart: {
    marginTop: 10,
    height: 200,
    width: '80%',
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'black'
  }
})
