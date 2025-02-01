import { Alert, Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { theme } from '../../constants/theme'
import { hp , wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userServices'

var limit = 0;

const Home = () => {
    const handlePostEvent = async (payload) => {
        if(payload.eventType == "INSERT" && payload?.new?.id){
          let newPost = {...payload.new};
          let res = await getUserData(newPost.userId);
          newPost.user = res.success ? res.data : {};
          setPosts(prevPosts => [newPost, ...prevPosts]);
        }
    }

    useEffect(() => {
      let postChannel = supabase
      .channel('posts')
      .on('postgres_changes' , {event: '*' , schema: 'public' , table: 'posts'}, (payload) => {handlePostEvent(payload);})
      .subscribe();

      // getPosts();

      return () => {
        supabase.removeChannel(postChannel);
      }

    } , []);

    const {user , setAuth} = useAuth();
    const router = useRouter();

    const [posts , setPosts] = useState([]);
    const [hasMore , setHasMore] = useState(true);

    const getPosts = async () => {
        if(!hasMore) return null;

        limit += 4; 
        let res = await fetchPosts();
        
        if(res.success){
          if(posts.length == res.data.length){
            setHasMore(false);
          }
          setPosts(res.data);
        }
    }

    // console.log('USER IS THIS IS THE USER IS THE THIS: ' , user);
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

        {/* posts */}

        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          onEndReached={() => {
            getPosts();
          }}

          onEndReachedThreshold={0}
          renderItem={({item}) => <PostCard
                                        item = {item}
                                        currentUser = {user}
                                        router = {router}
                                        />
        }
        ListFooterComponent={hasMore ? (
          <View style = {{marginVertical: posts.length == 0 ? 200 : 30 }}> 
              <Loading />
          </View>
        ) : (
          <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>You're all caught up!</Text>
          </View>
        ) }    
        /> 

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