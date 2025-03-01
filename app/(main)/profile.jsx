import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import Header from '../../components/Header'
import { wp, hp } from '../../helpers/common'
import Icon from '../../assets/icons'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import Loading from '../../components/Loading'
import PostCard from '../../components/PostCard'
import { getUserScore } from '../../services/scoreService'

var limit = 0
const Profile = () => {

  const handlePostEvent = async (payload) => {
      if (payload.eventType === "INSERT" && payload?.new?.id) {
        let newPost = { ...payload.new };
        let res = await getUserData(newPost.userId);
        newPost.postLikes = [];
        newPost.comments = [{ count: 0 }];
        newPost.user = res.success ? res.data : {};
        setPosts((prevPosts) => [newPost, ...prevPosts]);
      }
  
      if (payload.eventType === "DELETE" && payload.old.id) {
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.filter(post => post.id != payload.old.id);
          return updatedPosts;
        })
      }
  
      if (payload.eventType === "UPDATE" && payload?.new?.id) {
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.map(post => {
            if (post.id == payload.new.id) {
              post.body = payload.new.body;
              post.file = payload.new.file;
            }
  
            return post;
          });
  
          return updatedPosts;
        });
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
  
      getPosts();
      getScore();
  
      return () => {
        supabase.removeChannel(postChannel);
        supabase.removeChannel(commentChannel);
      };
    }, []);
  

  const { user} = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const onLogout = async () => {

    console.log('clicked')
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      Alert.alert('Signout', "Error signing out!");
    }
  }

  const [score , setScore] = useState(0);


  const getScore = async () => {
    if(user && user?.id){
      const res = await getUserScore(user?.id);

      if(res.success){
        setScore(res.data.score);
      }else{
        console.log(res.msg);
      }
    }
  }


  const getPosts = async () => {
      if (!hasMore) return null;
  
      limit += 4;
      let res = await fetchPosts(limit , user?.id);
  
      if (res.success) {
        if (posts.length == res.data.length) {
          setHasMore(false);
        }
        setPosts(res.data);
      }
    }
    

    

  const handleLogout = async () => {
    Alert.alert('Confirm', "Are you sure you want to log out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('cancelled'),
        style: 'cancel'
      },
      {
        text: 'Logout',
        onPress: () => onLogout(),
        style: 'destructive'
      }
    ])
  }
  return (
    <ScreenWrapper bg='white'>
      <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={<UserHeader user={user} score = {score} router={router} handleLogout={handleLogout} />}
          ListHeaderComponentStyle = {{marginBottom : 30}}
          onEndReached={() => {
            getPosts();
          }}

          onEndReachedThreshold={0}
          renderItem={({ item }) => <PostCard
            item={item}
            currentUser={user}
            router={router}
          />
          }
          ListFooterComponent={hasMore ? (
            <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>You're all caught up!</Text>
            </View>
          )} />
    </ScreenWrapper>
  )
}

const UserHeader = ({ user, router, score , handleLogout }) => (
  <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
    <View>
      <Header title="Profile" mb={30} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" color={theme.colors.rose} />
      </TouchableOpacity>
    </View>

    <View style={styles.container}>
      <View style={{ gap: 15 }}>
        <View style={styles.avatarContainer}>
          <Avatar
            uri={user?.image}
            size={hp(12)}
            rounded={theme.radius.xxl * 1.4}
          />

          <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
            <Icon name="edit" strokeWidth={2.5} size={20} />
          </Pressable>
        </View>

        {/* Username and address */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={styles.username}>{user && user.name}</Text>
          <Text style={styles.infoText}>{user && user.address}</Text>
          {
            user && user.bio && (
              <Text style={[styles.infoText , {textAlign: 'center'}]}>
                {user.bio}
              </Text>
            )
          }

          {
            user && (
              <Text style={[styles.infoText , {textAlign: 'center'}]}>
                Score: {score}
              </Text>
            )
          }
        </View>
        </View>
      </View>
    </View>
)

export default Profile

const styles = StyleSheet.create({
  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: '#fee2e2'
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },

  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },

  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },

  username: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },

  infoText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight
  }
})