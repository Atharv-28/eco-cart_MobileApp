import React from 'react'
import { View, Text , Image, StyleSheet } from 'react-native'
import Logo from '../assets/eco-cart-logo.png'

const Header = () => {
  return (
    <View style={style.container}>
        <Image source={Logo} style={{ width: 100, height: 100 }} />
        <Text style={style.header}>Eco-Cart</Text>
    </View>
  )
}

const style = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    header: {
        color: '#198754',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        fontWeight: 'bold',
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    }
)
export default Header;