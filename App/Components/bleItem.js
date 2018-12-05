import React from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'
import Images from '../Themes/Images'

class BleItem extends React.Component {
  _displayNameAndId (device) {
    if (device.name !== null) {
      return (
        <View style={{ flex: 1, margin: 15 }}>
          <Text style={styles.nameDevice}>
            Nom : {device.name}
          </Text>
          <Text style={styles.idDevice}>
            Adresse MAC : {device.id}
          </Text>
        </View>
      )
    } else {
      return (<Text style={styles.idDevice2}>
        Adresse MAC : {device.id}
      </Text>)
    }
  }

  render () {
    const { device } = this.props
    return (
      <View style={[styles.bleItemView, this.props.last ? styles.bleLastItemView : null]}>
        <Image style={styles.logoBt} source={Images.logoBT} />
        {this._displayNameAndId(device)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    height:30,
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

export default BleItem
