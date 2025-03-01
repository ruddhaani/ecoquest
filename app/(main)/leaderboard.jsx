import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import { getLeaderBoard } from '../../services/scoreService'
import LeaderboardItem from '../../components/LeaderboardItem'

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
      <ScrollView style = {styles.container}>
        <Header title='Leaderboard' />
        <View style={{marginTop : hp(4)}}>
            {
                leaderboard.map((score , index) => {
                    return <LeaderboardItem key={index} item={score} rank = {index + 1} />
                })
            }
        </View>
      </ScrollView>
    </ScreenWrapper>
  )
}

export default Leaderboard

const styles = StyleSheet.create({
    container : {
        paddingHorizontal : wp(4)
    }
})