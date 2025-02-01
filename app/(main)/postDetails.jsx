import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { createComment, fetchSinglePost, removeComment, removePost } from '../../services/postService'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import PostCard from '../../components/PostCard'
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading'
import Input from '../../components/Input'
import Icon from '../../assets/icons'
import CommentItem from '../../components/CommentItem'
import { getUserData } from '../../services/userServices'
import { supabase } from '../../lib/supabase'

const PostDetails = () => {
  const { postId } = useLocalSearchParams();
  console.log('postId', postId);
  const { user } = useAuth();
  const router = useRouter();

  const [loading , setLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(true);
  const [post, setPost] = useState(null);
  const inputRef = useRef(null);
  const commentRef = useRef("");

  const handleNewComment = async (newComment) => {
    try {
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
  
      setPost((prevPost) => ({
        ...prevPost,
        comments: [newComment, ...prevPost.comments], // Prepend new comment
      }));
    } catch (error) {
      console.error("Error updating comments:", error);
    }
  };

  useEffect(() => {
    const commentChannel = supabase
      .channel(`comments:${postId}`) // Use unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public' , table: 'comments', filter: `postId=eq.${postId}` },
        async (payload) => {
          console.log("New Comment Payload:", payload);
          if (payload.new) {
            await handleNewComment(payload.new);
          }
        }
      ).on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `postId=eq.${postId}` },
        async (payload) => {
          console.log("Deleted Comment Payload:", payload);
          if (payload.old) {
            setPost(prevPost => {
              let updatedPost = { ...prevPost };
              updatedPost.comments = updatedPost.comments.filter(c => c.id !== payload.old.id);
              return updatedPost;
            });
          }
        }
      )
      .subscribe();  
    getPostDetails();
  
    return () => {
      supabase.channel(`comments:${postId}`).unsubscribe(); // Correct way to remove the subscription
    };
  }, [postId]); 

  const getPostDetails = async () => {
    let res = await fetchSinglePost(postId);
    if (res.success) {
      setPost(res.data);
    }

    setStartLoading(false);
  }

  const onNewComment = async () => {
    if(!commentRef.current) return null;
    let data = {
      userId : user?.id,
      postId : post?.id,
      text : commentRef.current
    }

    setLoading(true);
    let res = await createComment(data);
    if(res.success){
      inputRef?.current?.clear();
      commentRef.current = "";
      setLoading(false);
    }else{
      Alert.alert('Comment' , res.msg);
    }
  }

  const onDeletePost = async (item) => {
    //delete post here
    let res = await removePost(post.id);
    if(res.success){
      router.back();
    }else{
      Alert.alert('Delete' , res.msg);
    }
  }

  const onEditPost = async (item) => {
    router.back();
    router.push({pathname : 'newPost' , params: {...item }})
  }

  const onDeleteComment = async (comment) => {
    console.log('deleting comment....' , comment);
    let res = await removeComment(comment?.id);
    if(res.success){
      setPost(prevPost=>{
        let updatedPost = {...prevPost};
        updatedPost.comments = updatedPost.comments.filter(c => c.id != comment.id);
        return updatedPost;
      })
    }else{
      Alert.alert('Comment' , res.msg);
    }
  }

  // console.log('got post id' , postId);

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    )
  }

  if(!post){
    return (
      <View style = {[styles.center , {justifyContent : 'flex-start' , marginTop : 100}]}>
        <Text style = {styles.notFound}>Post not found!</Text>
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <PostCard
          item={{...post , comments : [{count: post?.comments?.length}]}}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete= {true}
          onDelete = {onDeletePost}
          onEdit = {onEditPost}
        />

        {/* comment */}

        <View style={styles.inputContainer}>
          <Input placeholder="Type comment...."
            onChangeText={value => commentRef.current = value}
            inputRef={inputRef}
            placeholderTextColor={theme.colors.textLight}
            containerStyle={{ flex: 1, height: hp(6.3), borderRadius: theme.radius.xl }} 
          />

          {
            loading ? (
              <View style = {styles.loading}>
                <Loading size='small' />
              </View>
            ) : (
              <TouchableOpacity onPress={onNewComment}>
              <Icon name="send" color = {theme.colors.primaryDark} />
              </TouchableOpacity>
            )
          }
          
        </View>

        {/* Comment List */}

        <View style = {{marginVertical : 15 , gap: 17}}>
          {
            post?.comments?.map(comment => 
              <CommentItem
                canDelete = {user.id == comment.userId || user.id == post.userId}
                onDelete = {onDeleteComment}
                item = {comment}
                key={comment?.id.toString()}
              />
            )
          }

          {
            post?.comments?.length == 0 && (
              <Text style={{color : theme.colors.text, marginLeft : 5}}>
                Be first to comment!
              </Text>
            )
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default PostDetails

const styles = StyleSheet.create({
  sendIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.3 }],
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  list: {
    paddingHorizontal: wp(4),
  }
})