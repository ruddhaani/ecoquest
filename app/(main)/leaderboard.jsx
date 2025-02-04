import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { wp } from '../../helpers/common'
import { getLeaderBoard } from '../../services/scoreService'

const Leaderboard = () => {
  const [leaderboard, setLeaderBoard] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  } , []);

  async function fetchLeaderboard(){
    let res = await getLeaderBoard();

    if(res.success){
        setLeaderBoard(res.data);
    }else{
        console.log(res.msg);
    }


  }

  return (
    <ScreenWrapper bg='white'>
      <View style = {styles.container}>
        <Header title='Leaderboard' />
        <View>
            {
                leaderboard.map((score) => {
                    return <View><Text>{score?.user?.name}</Text></View>
                })
            }
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Leaderboard

const styles = StyleSheet.create({
    container : {
        paddingHorizontal : wp(4)
    }
})