import { Image, StyleSheet, Text, View , Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper bg='white'>
      <StatusBar style='dark' />
      <View style={styles.container}>
            <Image style = {styles.welcomeImage} resizeMode='contain' source={require('../assets/images/welcome.png')}/>

            {/* Title */}
            <View style = {{gap:20}}>
                <Text style = {styles.title}>EcoQuest</Text>
                <Text style = {styles.punchline}>
                    Where every goal is met towards securing a better future!
                </Text>
            </View>

            <View style = {styles.footer}>
                <Button title='Getting Started' buttonStyle={{marginHorizontal: wp(3)}} onPress={() => router.push('signUp')} />
                <View style={styles.bottomTextContainer}>
                    <Text style={styles.loginText}>
                        Already have an account? 
                    </Text>
                    <Pressable onPress={() => router.push('login')}>
                        <Text style = {[styles.loginText , {color : theme.colors.primary , fontWeight: theme.fonts.bold}]}>
                            Login
                        </Text>
                    </Pressable>
                </View>
            </View>
      </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
    container : {
        flex :1,
        alignItems:'center',
        justifyContent : 'space-around',
        backgroundColor: 'white',
        paddingHorizontal: wp(4)
    },

    welcomeImage : {
        height : hp(30),
        width : wp(100),
        alignSelf: 'center'
    },

    title : {
        color : theme.colors.textDark,
        fontSize : hp(4),
        textAlign : 'center',
        fontWeight: theme.fonts.extraBold
    },

    punchline : {
        fontSize : hp(1.7),
        paddingHorizontal: wp(10),
        textAlign : 'center',
        color : theme.colors.text
    }, 

    footer : {
        gap: 30,
        width : '100%'
    },

    bottomTextContainer : {
        flexDirection : 'row',
        justifyContent : 'center',
        gap: 5,
    },

    loginText : {
        textAlign : 'center',
        color : theme.colors.text,
        fontSize : hp(1.6)
    }
})