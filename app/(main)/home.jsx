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
  console.log(supabase?.getChannels());
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

    if (res?.success) {
      if (posts.length === res?.data?.length) {
        setHasMore(false);
      }
      setPosts(res?.data || []);
    }
  }

  const handlePostEvent = async (payload) => {
    if (payload?.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload?.new };
      let res = await getUserData(newPost?.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res?.success ? res?.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }

    if (payload?.eventType === "DELETE" && payload?.old?.id) {
      setPosts((prevPosts) => prevPosts.filter((post) => post?.id !== payload?.old?.id));
    }

    if (payload?.eventType === "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post?.id === payload?.new?.id
            ? { ...post, ...payload?.new }
            : post
        )
      );
    }
  };

  const handleCommentEvent = (payload) => {
    if (payload?.eventType === "DELETE") {
      getPosts();
    } else {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post?.id === (payload?.eventType === "INSERT" ? payload?.new?.postId : payload?.old?.postId)
            ? {
              ...post,
              comments: [{ count: (post?.comments?.[0]?.count || 0) + (payload?.eventType === "INSERT" ? 1 : -1) }],
            }
            : post
        )
      );
    }
  };

  const handleNewNotification = async (payload) => {
    if (payload?.eventType === 'INSERT' && payload?.new?.id) {
      console.log('New notification received:', payload?.new);
      setNotificationCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    let postChannel = supabase?.channel('posts')
      ?.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, handlePostEvent)
      ?.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, handlePostEvent)
      ?.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, handlePostEvent)
      ?.subscribe();

    let commentChannel = supabase?.channel('comments')
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, handleCommentEvent)
      ?.subscribe();

    let notificationChannel = supabase?.channel('notifications')
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user?.id}` }, handleNewNotification)
      ?.subscribe();

    getPosts();

    return () => {
      postChannel?.unsubscribe();
      commentChannel?.unsubscribe();
      notificationChannel?.unsubscribe();
    };
  }, []);

  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme?.colors?.primaryDark }]} >EcoQuest</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => {
              setNotificationCount(0);
              router.push('notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme?.colors?.text} />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar
                uri={user?.image}
                size={hp(3.8)}
                rounded={theme?.radius?.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={posts}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
          ListFooterComponent={hasMore ? <Loading /> : <Text style={styles.noPosts}>You're all caught up!</Text>}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home;


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