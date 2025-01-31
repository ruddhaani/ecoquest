import { Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { theme } from '../../constants/theme'
import { hp , wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'

const Home = () => {
    const {user , setAuth} = useAuth();
    const router = useRouter();

    console.log('USER IS THIS IS THE USER IS THE THIS: ' , user);
    // const onLogout = async () => {
    //     // setAuth(null);

    //     console.log('clicked')
    //     const {error} = await supabase.auth.signOut();
    //     if(error){
    //         Alert.alert('Signout' , "Error signing out!");
    //     }
    // }
  return (
    <ScreenWrapper bg='white'>
      <View style = {styles.container}>
        {/* Header */}

        <View style = {styles.header}>
          <Text style = {styles.title} >EcoQuest</Text>
          <View style = {styles.icons}>
            <Pressable onPress={() => router.push('notifications')}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={() => router.push('profile')}>
              <Avatar 
                uri={user?.image}
                size={hp(3.8)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {/* <Button title='Logout' onPress={
        onLogout
      }/> */}
    </ScreenWrapper >
  )
}

export default Home

const styles = StyleSheet.create({
  container : {
    flex: 1
  },

  header: {
    flexDirection: 'row',
    alignItems : 'center',
    justifyContent : 'space-between',
    marginBottom: 10,
    marginHorizontal : wp(4)
  },

  title : {
    color : theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold
  },

  avatarImage: {
    height : hp(4.3),
    width : hp(4.3),
    borderRadius : theme.radius.sm,
    borderCurve : 'continuous',
    borderColor : theme.colors.gray,
    borderWidth : 3
  },

  icons: {
    flexDirection : 'row',
    justifyContent : 'center',
    alignItems : 'center',
    gap:18, 
  },

  listStyle : {
    paddingTop : 20,
    paddingHorizontal : wp(4)
  },

  noPosts : {
    fontSize : hp(2),
    textAlign : 'center',
    color : theme.colors.text
  }
})