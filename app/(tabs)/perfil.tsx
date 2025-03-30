import { View, Text } from 'react-native'
import React from 'react'
import { styles } from '../../styles/auth.styles'

export default function perfil() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Este sería el perfil</Text>
    </View>
  )
}