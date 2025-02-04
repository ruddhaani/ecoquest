import { Alert, Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userServices'

var limit = 0;

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [startLoading, setStartLoading] = useState(false);

  const getPosts = async () => {
    if (!hasMore) return null;

    limit += 4;
    let res = await fetchPosts(limit);

    if (res.success) {
      if (posts.length == res.data.length) {
        setHasMore(false);
      }
      setPosts(res.data);
    }
  }

  const handlePostEvent = async (payload) => {
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
  
    if (payload.eventType === "DELETE" && payload?.old?.id) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
    }
  
    if (payload.eventType === "UPDATE" && payload.new?.id) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === payload.new.id
            ? { ...post, ...payload.new } // Merge all updated fields properly
            : post
        )
      );
    }
  };
  

  const handleCommentEvent = (payload) => {
    if (payload.eventType === "DELETE") {
      getPosts();
    } else {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === (payload.eventType === "INSERT" ? payload.new.postId : payload.old?.postId)
            ? {
              ...post,
              comments: [{ count: post.comments[0].count + (payload.eventType === "INSERT" ? 1 : -1) }],
            }
            : post
        )
      );
    }
  };

  const handleNewNotification = async (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.id) {
      console.log('New notification received:', payload.new);
      setNotificationCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    
    let postChannel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => handlePostEvent(payload)
      )
      .subscribe();

    let commentChannel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => handleCommentEvent(payload)
      )
      .subscribe();

    let notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}` },
        (payload) => handleNewNotification(payload)
      )
      .subscribe();

    getPosts();



    return () => {
      postChannel.unsubscribe();
      commentChannel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  }, []);

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
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primaryDark }]} >EcoQuest</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => {
              setNotificationCount(0);
              router.push('notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {
                notificationCount > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>
                      {
                        notificationCount
                      }
                    </Text>
                  </View>
                )
              }
            </Pressable>

            <Pressable onPress={() => router.push('leaderboard')}>
              <Icon name="rank" size = {hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>

            <Pressable onPress={() => router.push('profile')}>
              <Avatar
                uri={user?.image}
                size={hp(3.8)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
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

          onEndReachedThreshold={0.5}
          renderItem={({ item }) => <PostCard
            item={item}
            currentUser={user}
            router={router}
          />
          }
          ListFooterComponent={hasMore ? (
            <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>You're all caught up!</Text>
            </View>
          )}
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
  container: {
    flex: 1
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4)
  },

  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold
  },

  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3
  },

  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },

  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },

  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.primaryDark
  },

  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold
  }
})