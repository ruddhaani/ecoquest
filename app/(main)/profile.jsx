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

var limit = 0
const Profile = () => {

  useEffect(() => {
    getPosts()
  } , []);

  const { user, setAuth } = useAuth();
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
          ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout} />}
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

const UserHeader = ({ user, router, handleLogout }) => (
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
        </View>

        {/* Bio */}
        <View style={{ gap: 10 }}>
          <View style={[styles.info , {justifyContent: 'center'}]}>
            <Icon name="mail" size={20} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {user && user.email}
            </Text>
          </View>

          {
            user && user.phoneNumber && (
              <View style={[styles.info , {justifyContent: 'center'}]}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {user.phoneNumber}
                </Text>
              </View>
            )
          }

          {
            user && user.bio && (
              <Text style={[styles.info , {textAlign: 'center'}]}>
                {user.bio}
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