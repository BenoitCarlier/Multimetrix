import { StyleSheet } from 'react-native'
import { ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  scanTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#51494c',
    margin: 10
  },
  bleItemView: {
    borderTopColor: '#51494c',
    borderTopWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bleLastItemView: {
    borderBottomColor: '#51494c',
    borderBottomWidth: 1
  },
  nameDevice: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  idDevice: {
    fontStyle: 'italic',
    fontSize: 18
  },
  logoBt: {
    height: 30,
    width: 30,
    marginLeft: 15
  },
  idDevice2: {
    flex: 1,
    fontStyle: 'italic',
    fontSize: 18,
    margin: 15
  }
})
