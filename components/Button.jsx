import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Loading from './Loading'

const Button = ({buttonStyle,
    textStyle,
    title,
    onPress = () => {},
    loading = false,
    hasShadow = true}) => {
    
        const shadowStyle = {
            shadowColor : theme.colors.darkLight,
            shadowOffset :  {width : 0, height : 10},
            shadowOpacity : 1,
            shadowRadius : 4,
            elevation : 4
        }

        if(loading){
            return (
                <View style = {[styles.button , buttonStyle , {backgroundColor : 'white'}]}>
                    <Loading />
                </View>
            )
        }
  return (
    <Pressable style = {[styles.button , buttonStyle , hasShadow && shadowStyle]} onPress={onPress}>
      <Text style = {[styles.text , textStyle]}>{title}</Text>
    </Pressable>
  )
}

export default Button

const styles = StyleSheet.create({
    button : {
        backgroundColor : theme.colors.primary,
        height : hp(6.6),
        justifyContent : 'center',
        alignItems : 'center',
        borderCurve : 'continuous',
        borderRadius : theme.radius.xxl,
        
    },

    text : {
        fontSize: hp(2.5),
        color : 'white',
        fontWeight : theme.fonts.bold
    }
})