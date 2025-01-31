import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const Home = () => {
    const setAuth = useAuth();

    const onLogout = async () => {
        // setAuth(null);

        console.log('clicked')
        const {error} = await supabase.auth.signOut();
        if(error){
            Alert.alert('Signout' , "Error signing out!");
        }
    }
  return (
    <ScreenWrapper bg='white'>
      <Text>Home</Text>
      <Button title='Logout' onPress={
        onLogout
      }/>
    </ScreenWrapper >
  )
}

export default Home

const styles = StyleSheet.create({})